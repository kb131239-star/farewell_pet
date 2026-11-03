/* Supabase 공통: 설정 확인, 클라이언트, 입점 업체 조회, 안전한 복귀 주소 */
(function(){
  const cfg=window.FP_CONFIG||{};
  const enabled=!!(cfg.supabaseUrl&&cfg.supabaseKey);
  let client=null;
  function getClient(){
    if(!enabled||!window.supabase)return null;
    if(!client)client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    return client;
  }
  let partnersCache=null;
  /* 입점 업체 목록. 공개 정보라 로그인 없이 읽는다. 실패하면 빈 목록으로 두어 기존 문의 흐름을 유지한다. */
  function partners(){
    if(!enabled)return Promise.resolve(new Map());
    if(!partnersCache)partnersCache=fetch(`${cfg.supabaseUrl}/rest/v1/chat_places?select=id,name,is_demo`,{headers:{apikey:cfg.supabaseKey}})
      .then(r=>r.ok?r.json():[]).then(list=>new Map(list.map(p=>[p.id,p]))).catch(()=>new Map());
    return partnersCache;
  }
  /* 켜져 있는 소셜 로그인 확인 */
  function providers(){
    if(!enabled)return Promise.resolve({});
    return fetch(`${cfg.supabaseUrl}/auth/v1/settings`,{headers:{apikey:cfg.supabaseKey}}).then(r=>r.ok?r.json():{}).then(s=>s.external||{}).catch(()=>({}));
  }
  /* 로그인 뒤 돌아갈 주소는 이 앱의 정해진 화면만 허용한다 */
  function safeNext(next){return /^(chat|services)\.html(\?[\w=&%-]*)?$/.test(next||'')?next:'services.html';}
  const baseUrl=()=>location.href.split(/[?#]/)[0].replace(/[^/]*$/,'');
  window.FPAuth={enabled,getClient,partners,providers,safeNext,baseUrl};
})();
