-- 보호자-업체 1:1 문의 채팅. 대화 당사자만 읽고 쓸 수 있고, 보낸 메시지는 고칠 수 없다.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.facilities (
  id text primary key check (char_length(id) between 1 and 64),
  name text not null check (char_length(name) between 1 and 80),
  accepting_inquiries boolean not null default false,
  is_test boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.facility_staff (
  facility_id text not null references public.facilities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (facility_id, user_id)
);
create index facility_staff_user_id_idx on public.facility_staff(user_id);

create table public.facility_invites (
  code_hash text primary key,
  facility_id text not null references public.facilities(id) on delete cascade,
  expires_at timestamptz not null,
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz
);
create index facility_invites_facility_id_idx on public.facility_invites(facility_id);
create index facility_invites_used_by_idx on public.facility_invites(used_by);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  facility_id text not null references public.facilities(id) on delete cascade,
  guardian_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  pet_name text not null check (char_length(pet_name) between 1 and 40),
  last_message text,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (facility_id, guardian_id)
);
create index conversations_guardian_id_idx on public.conversations(guardian_id, last_message_at desc);
create index conversations_facility_id_idx on public.conversations(facility_id, last_message_at desc);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid default auth.uid() references auth.users(id) on delete set null,
  sender_role text not null check (sender_role in ('guardian','facility')),
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index messages_conversation_id_idx on public.messages(conversation_id, created_at);
create index messages_sender_id_idx on public.messages(sender_id);

create function private.is_facility_staff(p_facility_id text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.facility_staff s
    where s.facility_id = p_facility_id and s.user_id = auth.uid());
$$;

create function private.can_read_conversation(p_conversation_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.conversations c
    where c.id = p_conversation_id
      and (c.guardian_id = auth.uid() or private.is_facility_staff(c.facility_id)));
$$;

create function private.can_send_message(p_conversation_id uuid, p_role text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.conversations c
    where c.id = p_conversation_id
      and ((p_role = 'guardian' and c.guardian_id = auth.uid())
        or (p_role = 'facility' and private.is_facility_staff(c.facility_id))));
$$;

create function private.touch_conversation()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.conversations
    set last_message = left(new.body, 80), last_message_at = new.created_at
    where id = new.conversation_id;
  return new;
end;
$$;
create trigger messages_touch_conversation after insert on public.messages
  for each row execute function private.touch_conversation();

revoke all on all functions in schema private from public, anon;
grant execute on function private.is_facility_staff(text) to authenticated;
grant execute on function private.can_read_conversation(uuid) to authenticated;
grant execute on function private.can_send_message(uuid, text) to authenticated;

alter table public.facilities enable row level security;
alter table public.facility_staff enable row level security;
alter table public.facility_invites enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

revoke all on public.facilities, public.facility_staff, public.facility_invites, public.conversations, public.messages from anon, authenticated;
grant select on public.facilities to anon, authenticated;
grant select on public.facility_staff to authenticated;
grant select on public.conversations to authenticated;
grant insert (facility_id, pet_name) on public.conversations to authenticated;
grant select on public.messages to authenticated;
grant insert (conversation_id, sender_role, body) on public.messages to authenticated;

create policy "facilities are public" on public.facilities for select to anon, authenticated using (true);
create policy "staff see own memberships" on public.facility_staff for select to authenticated using (user_id = (select auth.uid()));
create policy "participants read conversations" on public.conversations for select to authenticated
  using (guardian_id = (select auth.uid()) or private.is_facility_staff(facility_id));
create policy "guardians start conversations" on public.conversations for insert to authenticated
  with check (guardian_id = (select auth.uid())
    and exists (select 1 from public.facilities f where f.id = facility_id and f.accepting_inquiries));
create policy "participants read messages" on public.messages for select to authenticated
  using (private.can_read_conversation(conversation_id));
create policy "participants send messages" on public.messages for insert to authenticated
  with check (sender_id = (select auth.uid()) and private.can_send_message(conversation_id, sender_role));

-- 업체 초대 코드는 해시만 저장한다. 한 번 쓰면 만료된다.
create function public.redeem_facility_invite(p_code text)
returns text language plpgsql security definer set search_path = '' as $$
declare v_facility_id text;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  update public.facility_invites
    set used_by = auth.uid(), used_at = now()
    where code_hash = encode(sha256(convert_to(btrim(p_code), 'UTF8')), 'hex')
      and used_at is null and expires_at > now()
    returning facility_id into v_facility_id;
  if v_facility_id is null then raise exception 'invalid_invite'; end if;
  insert into public.facility_staff (facility_id, user_id)
    values (v_facility_id, auth.uid()) on conflict do nothing;
  return v_facility_id;
end;
$$;
revoke all on function public.redeem_facility_invite(text) from public, anon;
grant execute on function public.redeem_facility_invite(text) to authenticated;

alter publication supabase_realtime add table public.messages, public.conversations;

insert into public.facilities (id, name, accepting_inquiries, is_test)
values ('test-care', 'farewell 테스트 돌봄', true, true);
