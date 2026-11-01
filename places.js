/* 시설 데이터와 필터 구성
   - 병원 3곳은 공개 정보(hospitals.js). 세부 조건은 아직 모르므로 '확인 필요'로 둔다.
   - 호텔·돌봄·유치원·미용은 화면 설명용 예시 업체다. 이름·요금·조건 모두 예시이며 화면에 '예시'로 표시한다. */
(function(){
  const T=true,F=false;
  const examples=[
    {id:'ex-hotel-1',name:'느린하루 펫스테이',cat:'hotel',kinds:['hotel'],region:'나주시',dist:2,address:'예시 주소 · 나주시 빛가람동',hours:'매일 10:00 - 20:00 (예시)',
     sizes:{소형견:T,중형견:T,대형견:F},
     attrs:{'24시간 상주':F,'개별 객실':T,'장기 호텔링':T,'데이케어':T,'산책':T,'목욕':T,'병원 연계':T,'유료픽업':T,'무료픽업':F,'미끄럼 방지 매트':T,'실내 놀이터':T,'실외 놀이터':F,'마당':F,'테라스':T,'루프탑':F,'수영장':F,'수의사':F,'훈련사':F,'반려동물 관리사':T,'주차장':T,'반려동물 용품 판매':F,'애견카페':F,'투약 지원':T,'단독 돌봄':T,'야간 관리':undefined},
     prices:[['호텔',[['1~5kg','30,000원'],['6~12kg','35,000원']]],['데이케어',[['1~5kg 종일','20,000원'],['6~12kg 종일','25,000원']]]]},
    {id:'ex-hotel-2',name:'온유 펫호텔',cat:'hotel',kinds:['hotel'],region:'나주시',dist:3,address:'예시 주소 · 나주시 금천면',hours:'매일 09:00 - 21:00 (예시)',
     sizes:{소형견:T,중형견:T,대형견:T},
     attrs:{'24시간 상주':T,'개별 객실':T,'장기 호텔링':T,'데이케어':F,'산책':T,'목욕':undefined,'병원 연계':undefined,'유료픽업':F,'무료픽업':T,'미끄럼 방지 매트':T,'실내 놀이터':F,'실외 놀이터':T,'마당':T,'테라스':F,'루프탑':F,'수영장':F,'수의사':F,'수의테크니션':undefined,'훈련사':F,'반려동물 관리사':T,'주차장':T,'반려동물 용품 판매':T,'애견카페':F,'투약 지원':undefined,'단독 돌봄':T,'야간 관리':T},
     prices:[['호텔',[['1~5kg','33,000원'],['6~12kg','38,000원'],['13kg 이상','45,000원']]],['기타',[['장기위탁 (1~5kg, 월)','300,000원'],['장기위탁 (6~12kg, 월)','350,000원']]]]},
    {id:'ex-care-1',name:'마당있는 돌봄집',cat:'care',kinds:['hotel'],region:'나주시',dist:4,address:'예시 주소 · 나주시 남평읍',hours:'월-토 08:00 - 20:00 (예시)',
     sizes:{소형견:T,중형견:T,대형견:undefined},
     attrs:{'24시간 상주':T,'개별 객실':F,'장기 호텔링':F,'데이케어':T,'산책':T,'목욕':F,'병원 연계':F,'유료픽업':T,'무료픽업':F,'사회화 교육':T,'행동 교정':F,'미끄럼 방지 매트':undefined,'실내 놀이터':F,'실외 놀이터':T,'마당':T,'테라스':F,'루프탑':F,'수영장':F,'훈련사':F,'유치원 교사':F,'반려동물 관리사':T,'주차장':T,'반려동물 용품 판매':F,'애견카페':F,'투약 지원':T,'단독 돌봄':F,'야간 관리':T},
     prices:[['가정 돌봄',[['1박 (소형·중형)','28,000원']]],['데이케어',[['종일','18,000원']]]]}
  ].map(p=>({...p,example:true}));


  /* 미용실: 보호자가 공유한 Google 비즈니스 프로필과 업체 SNS·지역 프로필에서 확인한 정보 (2026.11.01 확인).
     확인되지 않은 조건은 비워 두어 '확인 필요'로 보이게 한다. */
  const grooming=[
    {id:'groom-barberpet',name:'바버펫',cat:'grooming',kinds:['grooming'],region:'나주시',dist:2,
     address:'전라남도 나주시 교육길 13, 스마트파크 지식산업센터 E동 1-110호 (빛가람동)',phone:'010-3316-2882',
     hours:'10:00 - 18:00 (휴무일은 업체에 확인해 주세요)',
     description:'하이바·귀툭튀 같은 가위컷과 대형견 미용을 한다고 소개하는 빛가람동 미용실이에요. 아이들이 스트레스 받지 않는 미용을 추구한다고 밝히고 있어요.',
     sizes:{대형견:true},
     attrs:{'가위컷':true,'목욕':true},
     source:'https://www.instagram.com/barberpet_naju/',sourceLabel:'바버펫 인스타그램',checked:'2026.11.01',prices:null},
    {id:'groom-rosemary',name:'로즈메리펫뷰티샵',cat:'grooming',kinds:['grooming','hotel'],region:'나주시',dist:2,
     address:'전라남도 나주시 상야4길 10, 패션페이스 1층 122호 (빛가람동)',phone:'010-5878-6082',
     hours:'10:00 - 19:00 · 일요일 휴무',
     description:'완벽한 미용보다 안전하고 스트레스 없는 미용을 추구한다고 소개하는 미용실이에요. 스파·팩 서비스를 하고, 애견호텔과 옷·사료 같은 용품 판매도 함께 운영해요.',
     sizes:{},
     attrs:{'스파':true,'목욕':true,'반려동물 용품 판매':true,'주차장':true},
     source:'https://share.google/EIJ6qS6QGWbP2bP1q',sourceLabel:'Google 비즈니스 프로필',checked:'2026.11.01',prices:null},
    {id:'groom-puppyholic',name:'퍼피홀릭',cat:'grooming',kinds:['grooming'],region:'나주시',dist:4,
     address:'전라남도 나주시 남내1길 10 (남내동)',phone:'061-333-0706',
     hours:'월-토 09:30 - 19:30 · 일요일 휴무',
     description:'나주 원도심 남내동에서 반려견 미용과 용품 판매를 함께 하는 곳이에요.',
     sizes:{},
     attrs:{'반려동물 용품 판매':true},
     source:'https://share.google/cyQYIFFHyFf9Yn44I',sourceLabel:'Google 비즈니스 프로필',checked:'2026.11.01',prices:null}
  ];


  /* 유치원: 업체 인스타그램·Google 비즈니스 프로필·지역 프로필(당근)에서 확인한 정보 (2026.11.01 확인) */
  const kindergartens=[
    {id:'kinder-paradise',name:'견상낙원',cat:'kindergarten',kinds:['kinder','hotel'],region:'나주시',dist:2,
     address:'전라남도 나주시 빛가람로 689, 가온빌딩 801호 (빛가람동)',phone:'010-8534-3684',
     hours:'월-토 09:00 - 23:00 · 일 09:00 - 19:00',
     description:'애견유치원과 호텔, 장기위탁을 함께 운영한다고 소개하는 곳이에요. 픽업도 한다고 안내하지만 요금과 범위는 업체에 확인해 주세요.',
     sizes:{},attrs:{'데이케어':true,'장기 호텔링':true},
     source:'https://www.instagram.com/dogparadise92/',sourceLabel:'견상낙원 인스타그램',checked:'2026.11.01',prices:null},
    {id:'kinder-nunbotti',name:'눈보뛰프리미엄',cat:'kindergarten',kinds:['kinder','hotel'],region:'나주시',dist:2,
     address:'전라남도 나주시 빛가람동 348-20, LS타워 201호',phone:'062-941-5880',
     hours:'08:00 영업 시작 (마감 시간은 업체에 확인해 주세요)',
     description:'10kg 안팎의 반려견을 대상으로 하는 유치원이라고 소개해요. 수중 트레드밀, 펫 피트니스, 전용 목욕 장비를 갖췄고, 원생을 위한 호텔도 운영한다고 안내해요.',
     sizes:{소형견:true,대형견:false},attrs:{'데이케어':true,'산책':true,'목욕':true,'사회화 교육':true},
     source:'https://www.instagram.com/premium_dogcare/',sourceLabel:'눈보뛰프리미엄 인스타그램',checked:'2026.11.01',prices:null},
    {id:'kinder-castle',name:'멍캐슬',cat:'kindergarten',kinds:['kinder','hotel','grooming'],region:'나주시',dist:2,
     address:'전라남도 나주시 빛가람로 740, 한빛타워 4층 403·404호 (빛가람동)',phone:'061-930-7347',
     hours:'08:00 영업 시작 (마감 시간은 업체에 확인해 주세요)',
     description:'유치원·호텔·카페·미용을 한곳에서 운영하는 반려견 케어 센터예요. 200평 규모 실내 공간과 별도 야외 운동장이 있다고 소개해요.',
     sizes:{},attrs:{'데이케어':true,'목욕':true,'실내 놀이터':true,'실외 놀이터':true,'애견카페':true},
     source:'https://www.instagram.com/meongcastle/',sourceLabel:'멍캐슬 인스타그램',checked:'2026.11.01',prices:null},
    {id:'kinder-dabang',name:'멍다방',cat:'kindergarten',kinds:['kinder','hotel'],region:'나주시',dist:2,
     address:'전라남도 나주시 배멧1길 46, 302호 (빛가람동)',phone:null,
     hours:'09:30 - 19:00 · 수요일 휴무',
     description:'애견카페와 유치원, 호텔을 함께 운영하는 곳이에요. 방문 후기에 따르면 주차 공간이 넉넉하다고 해요. 전화번호는 아직 확인하지 못해서, 인스타그램 메시지로 문의해 주세요.',
     sizes:{},attrs:{'데이케어':true,'애견카페':true,'주차장':true},
     source:'https://www.instagram.com/mungdabang/',sourceLabel:'멍다방 인스타그램',checked:'2026.11.01',prices:null}
  ];

  const hospitalPlaces=(typeof hospitals!=='undefined'?hospitals:[]).map((h,i)=>({
    id:'hosp-'+i,name:h.name,cat:'hospital',kinds:['hospital'],region:'나주시',dist:2,address:h.address,phone:h.phone,image:h.image,description:h.description,source:h.source,sourceLabel:h.sourceLabel,checked:'2026.10.18',
    hours:'진료 시간은 병원에 확인해 주세요',sizes:{},attrs:{},prices:null
  }));

  const sizeGroup=title=>({key:'size',title,opts:['소형견','중형견','대형견'],grid:3});
  const FILTERS={
    hotel:{title:'호텔·돌봄',needs:['투약 지원','단독 돌봄','야간 관리'],groups:[
      sizeGroup('돌봄 가능 체급'),
      {title:'주요 서비스',opts:['24시간 상주','개별 객실','장기 호텔링','데이케어','산책','목욕','병원 연계','유료픽업','무료픽업'],grid:3},
      {title:'돌봄 시설',opts:['미끄럼 방지 매트','실내 놀이터','실외 놀이터','마당','테라스','루프탑','수영장']},
      {title:'전문가',opts:['수의사','수의테크니션','훈련사','반려동물 관리사']},
      {title:'편의시설',opts:['주차장','반려동물 용품 판매','애견카페']}]},
    kinder:{title:'유치원',needs:['투약 지원','단독 돌봄'],groups:[
      sizeGroup('등원 가능 체급'),
      {title:'주요 서비스',opts:['데이케어','산책','목욕','사회화 교육','행동 교정','유료픽업','무료픽업'],grid:3},
      {title:'돌봄 시설',opts:['미끄럼 방지 매트','실내 놀이터','실외 놀이터','마당','테라스','루프탑','수영장']},
      {title:'전문가',opts:['훈련사','유치원 교사','반려동물 관리사']},
      {title:'편의시설',opts:['주차장','반려동물 용품 판매','애견카페']}]},
    grooming:{title:'미용',needs:[],groups:[
      sizeGroup('미용 가능 체급'),
      {title:'주요 서비스',opts:['가위컷','특수견 미용','스파','목욕','노령견 미용','피어프리','유료픽업','무료픽업'],grid:3},
      {title:'편의시설',opts:['주차장','반려동물 용품 판매','애견카페']}]},
    hospital:{title:'동물병원',needs:['노령견 진료'],groups:[
      {title:'진료',opts:['야간·응급 진료','외과·수술','피부·귀','치과','건강검진','예방접종']},
      {title:'편의시설',opts:['주차장']}]}
  };
  const SOON={
    consult:{title:'실시간·전문가 상담',kind:'consult',body:'병원에 가기 전 궁금한 점을 AI 안내로 정리하고, 필요하면 수의사 상담을 예약하는 기능을 준비하고 있어요.',note:'AI 안내는 진단이나 처방을 대신하지 않아요. 아이가 아프다면 가까운 동물병원에 먼저 연락해 주세요.'},
    together:{title:'보호자와 함께 공간',kind:'together',body:'애견카페, 동반 식당, 반려견 놀이터처럼 보호자와 함께 머물 수 있는 곳을 모으고 있어요.',note:'공간마다 체급 제한과 입장 조건이 달라서, 확인된 정보부터 차례로 열어 둘게요.'},
    star:{title:'별들의 공간',kind:'star',body:'무지개다리를 건넌 아이를 기억하는 공간이에요. 장례와 추모에 필요한 정보를 조심스럽게 준비하고 있어요.',note:'준비가 끝나면 이 산책로 끝에서 만날 수 있어요.'}
  };
  window.PLACES=[...hospitalPlaces,...kindergartens,...grooming,...examples];
  window.FILTERS=FILTERS;
  window.SOON=SOON;
  window.FACILITY_ICONS={'미끄럼 방지 매트':'grid','실내 놀이터':'slide','실외 놀이터':'slide','마당':'tree','테라스':'umbrella','루프탑':'building','수영장':'waves','주차장':'parking','반려동물 용품 판매':'bag','애견카페':'cup'};
})();
