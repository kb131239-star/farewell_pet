-- farewell pet: 보호자와 업체 간 1:1 문의 채팅
-- Supabase 대시보드의 SQL Editor에서 전체를 한 번 실행한다. 다시 실행해도 안전하다.
-- 마지막 결과로 시연 업체 초대 코드가 나온다. 이 코드는 공개하지 않는다.

-- 입점 업체. 여기에 있는 업체에만 채팅 문의를 보낼 수 있다.
create table if not exists public.chat_places (
  id text primary key,
  name text not null check (char_length(name) between 1 and 80),
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

-- 업체 계정과 업체의 연결
create table if not exists public.place_members (
  place_id text not null references public.chat_places(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (place_id, user_id)
);

-- 일회용 업체 초대 코드. 클라이언트에서 직접 읽을 수 없다.
create table if not exists public.place_invites (
  code text primary key,
  place_id text not null references public.chat_places(id) on delete cascade,
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

-- 문의방: 보호자 1명과 업체 1곳당 하나
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  place_id text not null references public.chat_places(id) on delete cascade,
  guardian_id uuid not null references auth.users(id) on delete cascade,
  guardian_name text not null check (char_length(guardian_name) between 1 and 40),
  created_at timestamptz not null default now(),
  last_message_at timestamptz,
  last_message_preview text,
  guardian_read_at timestamptz,
  place_read_at timestamptz,
  last_sender_id uuid references auth.users(id) on delete set null,
  unique (place_id, guardian_id)
);
alter table public.conversations add column if not exists last_sender_id uuid references auth.users(id) on delete set null;
create index if not exists conversations_guardian_idx on public.conversations (guardian_id, last_message_at desc);
create index if not exists conversations_place_idx on public.conversations (place_id, last_message_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

-- 내가 이 문의방의 보호자이거나 해당 업체 소속인지 확인
create or replace function public.is_conversation_participant(cid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.conversations c
    where c.id = cid and (
      c.guardian_id = auth.uid()
      or exists (select 1 from public.place_members m where m.place_id = c.place_id and m.user_id = auth.uid())
    )
  );
$$;

-- 보호자가 입점 업체와의 문의방을 열거나 기존 방을 돌려받는다
create or replace function public.start_conversation(p_place_id text, p_guardian_name text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  cid uuid;
  uname text := nullif(btrim(p_guardian_name), '');
begin
  if auth.uid() is null then raise exception '로그인이 필요해요.'; end if;
  if uname is null or char_length(uname) > 40 then raise exception '이름을 확인해 주세요.'; end if;
  if not exists (select 1 from public.chat_places where id = p_place_id) then
    raise exception '아직 채팅 문의를 받지 않는 업체예요.';
  end if;
  insert into public.conversations (place_id, guardian_id, guardian_name)
  values (p_place_id, auth.uid(), uname)
  on conflict (place_id, guardian_id) do update set guardian_name = excluded.guardian_name
  returning id into cid;
  return cid;
end;
$$;

-- 업체 초대 코드를 사용해 내 계정을 업체에 연결한다
create or replace function public.redeem_place_invite(p_code text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  pid text;
begin
  if auth.uid() is null then raise exception '로그인이 필요해요.'; end if;
  update public.place_invites set used_by = auth.uid(), used_at = now()
  where code = btrim(p_code) and used_by is null
  returning place_id into pid;
  if pid is null then raise exception '사용할 수 없는 초대 코드예요.'; end if;
  insert into public.place_members (place_id, user_id) values (pid, auth.uid()) on conflict do nothing;
  return pid;
end;
$$;

-- 내가 어느 쪽인지에 맞춰 읽은 시각을 기록한다
create or replace function public.mark_conversation_read(cid uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_conversation_participant(cid) then raise exception '이 문의방을 볼 수 없어요.'; end if;
  update public.conversations c set
    guardian_read_at = case when c.guardian_id = auth.uid() then now() else c.guardian_read_at end,
    place_read_at = case when c.guardian_id <> auth.uid() then now() else c.place_read_at end
  where c.id = cid;
end;
$$;

-- 메시지가 오면 문의함 목록에 보일 정보를 갱신한다
create or replace function public.on_message_inserted()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.conversations
  set last_message_at = new.created_at, last_message_preview = left(new.body, 80), last_sender_id = new.sender_id
  where id = new.conversation_id;
  return new;
end;
$$;
drop trigger if exists messages_after_insert on public.messages;
create trigger messages_after_insert after insert on public.messages
for each row execute function public.on_message_inserted();

-- 접근 권한: 기본값을 모두 닫고 필요한 것만 연다
alter table public.chat_places enable row level security;
alter table public.place_members enable row level security;
alter table public.place_invites enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

revoke all on public.chat_places, public.place_members, public.place_invites, public.conversations, public.messages from anon, authenticated;
grant select on public.chat_places to anon, authenticated;
grant select on public.place_members to authenticated;
grant select on public.conversations to authenticated;
grant select on public.messages to authenticated;
grant insert (conversation_id, body) on public.messages to authenticated;

drop policy if exists "입점 업체 목록은 누구나 조회" on public.chat_places;
create policy "입점 업체 목록은 누구나 조회" on public.chat_places for select to anon, authenticated using (true);

drop policy if exists "내 업체 연결만 조회" on public.place_members;
create policy "내 업체 연결만 조회" on public.place_members for select to authenticated using (user_id = auth.uid());

drop policy if exists "참여 중인 문의방만 조회" on public.conversations;
create policy "참여 중인 문의방만 조회" on public.conversations for select to authenticated using (public.is_conversation_participant(id));

drop policy if exists "참여 중인 문의방의 메시지만 조회" on public.messages;
create policy "참여 중인 문의방의 메시지만 조회" on public.messages for select to authenticated using (public.is_conversation_participant(conversation_id));

drop policy if exists "참여 중인 문의방에 내 이름으로만 전송" on public.messages;
create policy "참여 중인 문의방에 내 이름으로만 전송" on public.messages for insert to authenticated
with check (sender_id = auth.uid() and public.is_conversation_participant(conversation_id));

revoke all on function public.is_conversation_participant(uuid) from public, anon;
revoke all on function public.start_conversation(text, text) from public, anon;
revoke all on function public.redeem_place_invite(text) from public, anon;
revoke all on function public.mark_conversation_read(uuid) from public, anon;
revoke all on function public.on_message_inserted() from public, anon, authenticated;
grant execute on function public.is_conversation_participant(uuid) to authenticated;
grant execute on function public.start_conversation(text, text) to authenticated;
grant execute on function public.redeem_place_invite(text) to authenticated;
grant execute on function public.mark_conversation_read(uuid) to authenticated;

-- 새 메시지와 문의함 변경을 실시간으로 받는다
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'conversations') then
    alter publication supabase_realtime add table public.conversations;
  end if;
end;
$$;

-- 시연용 가상 업체와 초대 코드 (실제 업체가 아니다)
insert into public.chat_places (id, name, is_demo)
values ('demo-partner', '초록마당 돌봄(시연용)', true)
on conflict (id) do nothing;

insert into public.place_invites (code, place_id)
select replace(gen_random_uuid()::text, '-', ''), 'demo-partner'
where not exists (select 1 from public.place_invites where place_id = 'demo-partner' and used_by is null);

select code as "시연 업체 초대 코드", place_id from public.place_invites where place_id = 'demo-partner' and used_by is null;
