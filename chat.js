/* 보호자와 업체 간 1:1 문의. 접근 권한은 데이터베이스(supabase/schema.sql)가 강제한다. */
(function(){
  const {esc,icon,toast}=FP;
  const $=s=>document.querySelector(s);
  const db=FPAuth.getClient();
  const params=new URLSearchParams(location.search);
  const DRAFT_KEY='fp-chat-draft';
  let me=null, memberOf=[], places=new Map(), convs=[], role='guardian', current=null, msgs=[], msgChannel=null;

  function shellMode(){
    $('#shell').classList.toggle('in-thread',!!current);
    $('#thread').hidden=!current;
    $('#thread-empty').hidden=!!current;
  }
  function notice(title,body,link){
    $('#conv-list').innerHTML=`<div class="chat-empty"><b>${esc(title)}</b><p>${esc(body)}</p>${link||''}</div>`;
    shellMode();
  }
  const fail=msg=>toast(msg);

  /* ---------- 문의함 ---------- */
  const nameOf=c=>c.guardian_id===me.id?((places.get(c.place_id)||{}).name||'업체'):c.guardian_name;
  const isUnread=c=>{
    if(!c.last_message_at||c.last_sender_id===me.id)return false;
    const read=c.guardian_id===me.id?c.guardian_read_at:c.place_read_at;
    return !read||new Date(read)<new Date(c.last_message_at);
  };
  function when(iso){
    if(!iso)return '';
    const d=new Date(iso),now=new Date();
    return d.toDateString()===now.toDateString()?d.toLocaleTimeString('ko-KR',{hour:'numeric',minute:'2-digit'}):d.toLocaleDateString('ko-KR',{month:'numeric',day:'numeric'});
  }
  function visible(){return convs.filter(c=>role==='guardian'?c.guardian_id===me.id:c.guardian_id!==me.id);}
  function renderTabs(){
    const tabs=$('#role-tabs');
    tabs.hidden=!memberOf.length;
    if(!memberOf.length)return;
    const count=r=>convs.filter(c=>(r==='guardian'?c.guardian_id===me.id:c.guardian_id!==me.id)&&isUnread(c)).length;
    tabs.innerHTML=[['guardian','내가 보낸 문의'],['place','업체로 온 문의']].map(([k,l])=>`<button type="button" role="tab" data-role="${k}" aria-selected="${role===k}">${l}${count(k)?` <b class="tnum">${count(k)}</b>`:''}</button>`).join('');
  }
  function renderList(){
    renderTabs();
    const list=visible();
    if(!list.length){
      if(role==='place')notice('아직 들어온 문의가 없어요','보호자가 문의를 보내면 여기에 나타나요.');
      else notice('아직 보낸 문의가 없어요','산책 지도에서 채팅 문의를 받는 업체를 고르면 대화를 시작할 수 있어요.','<a class="btn btn-soft" href="services.html">산책 지도로 가기</a>');
      return;
    }
    $('#conv-list').innerHTML=list.map(c=>{
      const unread=isUnread(c);
      return `<button type="button" class="conv ${current&&current.id===c.id?'on':''}" data-conv="${c.id}"><span class="conv-top"><b>${esc(nameOf(c))}</b><time class="tnum">${esc(when(c.last_message_at||c.created_at))}</time></span><span class="conv-bottom"><span class="conv-last">${esc(c.last_message_preview||'아직 메시지가 없어요')}</span>${unread?'<i class="dot"><span class="sr-only">읽지 않음</span></i>':''}</span></button>`;
    }).join('');
  }
  async function loadConversations(){
    const {data,error}=await db.from('conversations').select('*').order('last_message_at',{ascending:false,nullsFirst:false});
    if(error){fail('문의 목록을 불러오지 못했어요.');return;}
    convs=data||[];
    if(current){const fresh=convs.find(c=>c.id===current.id);if(fresh){current=fresh;paintMessages(false);}}
    renderList();
  }
  async function loadMembership(){
    const {data}=await db.from('place_members').select('place_id');
    memberOf=(data||[]).map(r=>r.place_id);
  }

  /* ---------- 대화 ---------- */
  const dayLabel=iso=>new Date(iso).toLocaleDateString('ko-KR',{year:'numeric',month:'long',day:'numeric'});
  function paintMessages(scroll){
    const box=$('#messages');
    const otherRead=current.guardian_id===me.id?current.place_read_at:current.guardian_read_at;
    let lastDay='';
    const lastMine=[...msgs].reverse().find(m=>m.sender_id===me.id);
    box.innerHTML=msgs.length?msgs.map(m=>{
      const day=dayLabel(m.created_at),mine=m.sender_id===me.id;
      const sep=day!==lastDay?`<div class="day"><span>${esc(day)}</span></div>`:'';lastDay=day;
      const read=lastMine&&m.id===lastMine.id&&otherRead&&new Date(otherRead)>=new Date(m.created_at);
      return `${sep}<div class="msg ${mine?'mine':'theirs'}"><p class="bubble">${esc(m.body)}</p><span class="meta tnum">${read?'읽음 · ':''}${esc(new Date(m.created_at).toLocaleTimeString('ko-KR',{hour:'numeric',minute:'2-digit'}))}</span></div>`;
    }).join(''):`<div class="chat-empty small"><p>첫 메시지를 보내 보세요.</p></div>`;
    if(scroll)box.scrollTop=box.scrollHeight;
  }
  function addMessage(m){
    if(msgs.some(x=>x.id===m.id))return;
    msgs.push(m);msgs.sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
    paintMessages(true);
  }
  async function loadMessages(){
    const {data,error}=await db.from('messages').select('*').eq('conversation_id',current.id).order('created_at',{ascending:true}).limit(500);
    if(error){fail('메시지를 불러오지 못했어요.');return;}
    msgs=data||[];paintMessages(true);
    markRead();
  }
  async function markRead(){
    if(!current||document.hidden)return;
    const c=current;
    const last=msgs[msgs.length-1];
    if(!last||last.sender_id===me.id)return;
    const {error}=await db.rpc('mark_conversation_read',{cid:c.id});
    if(!error){const stamp=new Date().toISOString();if(c.guardian_id===me.id)c.guardian_read_at=stamp;else c.place_read_at=stamp;renderList();}
  }
  function subscribeMessages(cid){
    if(msgChannel)db.removeChannel(msgChannel);
    msgChannel=db.channel('messages-'+cid).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:`conversation_id=eq.${cid}`},p=>{addMessage(p.new);markRead();}).subscribe();
  }
  function openConversation(conv,push){
    current=conv;
    role=conv.guardian_id===me.id?'guardian':'place';
    $('#thread-name').textContent=nameOf(conv);
    $('#thread-sub').textContent=conv.guardian_id===me.id?'업체와 1:1 문의':'보호자 문의';
    $('#demo-note').hidden=!(places.get(conv.place_id)||{}).is_demo;
    msgs=[];$('#messages').innerHTML='';
    if(push)history.pushState({c:conv.id},'',`chat.html?c=${conv.id}`);
    shellMode();renderList();
    subscribeMessages(conv.id);loadMessages();
    if(!matchMedia('(pointer:coarse)').matches)$('#draft').focus();
  }
  function closeConversation(){
    current=null;
    if(msgChannel){db.removeChannel(msgChannel);msgChannel=null;}
    shellMode();renderList();
  }
  const resize=()=>{const t=$('#draft');t.style.height='auto';t.style.height=Math.min(t.scrollHeight,140)+'px';};
  async function send(){
    const t=$('#draft'),body=t.value.trim();
    if(!body||!current)return;
    $('#send').disabled=true;
    const {data,error}=await db.from('messages').insert({conversation_id:current.id,body}).select().single();
    $('#send').disabled=false;
    if(error){fail('보내지 못했어요. 잠시 뒤 다시 시도해 주세요.');return;}
    t.value='';resize();addMessage(data);t.focus();
    loadConversations();
  }

  /* ---------- 이벤트 ---------- */
  $('#composer').addEventListener('submit',e=>{e.preventDefault();send();});
  $('#draft').addEventListener('input',resize);
  /* 한글 조합 중 Enter는 보내지 않는다. 휴대폰에서는 Enter가 줄바꿈이다. */
  $('#draft').addEventListener('keydown',e=>{
    if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&e.keyCode!==229&&!matchMedia('(pointer:coarse)').matches){e.preventDefault();send();}
  });
  $('#conv-list').addEventListener('click',e=>{const b=e.target.closest('[data-conv]');if(!b)return;const c=convs.find(x=>x.id===b.dataset.conv);if(c)openConversation(c,true);});
  $('#role-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-role]');if(!b)return;role=b.dataset.role;renderList();});
  $('#thread-back').addEventListener('click',()=>{history.pushState({},'','chat.html');closeConversation();});
  window.addEventListener('popstate',()=>{const id=new URLSearchParams(location.search).get('c');const c=convs.find(x=>x.id===id);if(c)openConversation(c,false);else closeConversation();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&me){loadConversations();if(current)loadMessages();}});
  $('#logout').addEventListener('click',async()=>{await db.auth.signOut();location.href='index.html';});
  $('#invite-form').addEventListener('submit',async e=>{
    e.preventDefault();
    const code=$('#invite-code').value.trim();if(!code)return;
    const {error}=await db.rpc('redeem_place_invite',{p_code:code});
    if(error){fail('사용할 수 없는 초대 코드예요.');return;}
    $('#invite-code').value='';$('#partner-box').open=false;
    toast('업체 계정과 연결했어요.');
    await loadMembership();role='place';await loadConversations();
  });

  /* ---------- 시작 ---------- */
  async function start(){
    shellMode();
    if(!FPAuth.enabled){notice('채팅 연결을 준비 중이에요','지금은 업체 상세 화면에서 전화나 문의 문구 복사로 연락할 수 있어요.','<a class="btn btn-soft" href="services.html">산책 지도로 가기</a>');return;}
    if(!db){notice('채팅 도구를 불러오지 못했어요','인터넷 연결을 확인한 뒤 새로고침해 주세요.');return;}
    const {data:{session}}=await db.auth.getSession();
    if(!session){location.replace('signup.html?next='+encodeURIComponent('chat.html'+location.search));return;}
    me=session.user;
    $('#logout').hidden=false;$('#partner-box').hidden=false;
    places=await FPAuth.partners();
    await loadMembership();
    if(memberOf.length&&!params.get('place'))role='place';
    await loadConversations();
    db.channel('inbox').on('postgres_changes',{event:'*',schema:'public',table:'conversations'},()=>loadConversations()).subscribe();

    const placeId=params.get('place'),cid=params.get('c');
    if(placeId){
      if(!places.has(placeId)){toast('아직 채팅 문의를 받지 않는 업체예요.');history.replaceState({},'','chat.html');return;}
      const pet=FP.load().pet||{};
      const guardian=pet.name?`${FP.josa.name(pet.name)} 보호자`:'보호자';
      const {data:newId,error}=await db.rpc('start_conversation',{p_place_id:placeId,p_guardian_name:guardian});
      if(error){fail('문의방을 열지 못했어요. 잠시 뒤 다시 시도해 주세요.');return;}
      await loadConversations();
      const conv=convs.find(c=>c.id===newId);
      history.replaceState({c:newId},'',`chat.html?c=${newId}`);
      if(conv){
        openConversation(conv,false);
        let draft='';try{draft=sessionStorage.getItem(DRAFT_KEY)||'';sessionStorage.removeItem(DRAFT_KEY);}catch{}
        if(draft){$('#draft').value=draft;resize();}
      }
      return;
    }
    if(cid){const conv=convs.find(c=>c.id===cid);if(conv)openConversation(conv,false);else{toast('이 문의를 볼 수 없어요.');history.replaceState({},'','chat.html');}}
  }
  start();
})();
