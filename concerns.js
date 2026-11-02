/* 건강 고민: 보호자가 고른 관심 항목. 진단이 아니라 돌봄·문의에 참고하는 정보다. */
(function(){
  const OUT='stroke="#3A2B20" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';
  const LINE=`fill="none" ${OUT}`;
  const ITEMS=[
    {id:'eye',label:'눈',art:`<path d="M6 24 Q24 6 42 24 Q24 42 6 24Z" fill="#fff" ${OUT}/><circle cx="24" cy="24" r="8" fill="#6F9FC9" ${OUT}/><circle cx="24" cy="24" r="3.4" fill="#24180F"/><circle cx="26.6" cy="21.4" r="1.6" fill="#fff"/>`},
    {id:'joint',label:'뼈/관절',art:`<g transform="rotate(-40 24 24)"><circle cx="10" cy="19" r="5.4" fill="#FBF7EF" ${OUT}/><circle cx="10" cy="29" r="5.4" fill="#FBF7EF" ${OUT}/><circle cx="38" cy="19" r="5.4" fill="#FBF7EF" ${OUT}/><circle cx="38" cy="29" r="5.4" fill="#FBF7EF" ${OUT}/><rect x="9" y="19.8" width="30" height="8.4" fill="#FBF7EF"/><path d="M13 19.8H35M13 28.2H35" ${LINE}/></g>`},
    {id:'skin',label:'피부/피모',art:`<path d="M16 25 q-4 -7 0 -14 M25 25 q-4 -8 1 -17 M34 25 q-4 -7 0 -14" fill="none" stroke="#A9632E" stroke-width="3" stroke-linecap="round"/><rect x="6" y="25" width="36" height="15" rx="5" fill="#F7C4B8" ${OUT}/><path d="M12 33q3-2 6 0t6 0 6 0 6 0" fill="none" stroke="#E08F80" stroke-width="2" stroke-linecap="round"/>`},
    {id:'teeth',label:'치아/구강',art:`<path d="M24 12 C19 8 10 8 9 17 C8 25 12 28 13 34 C14 40 17 42 19 38 C20 34 21 29 24 29 C27 29 28 34 29 38 C31 42 34 40 35 34 C36 28 40 25 39 17 C38 8 29 8 24 12Z" fill="#fff" ${OUT}/><path d="M16 15q3-2 6 0" fill="none" stroke="#B9C5D2" stroke-width="2" stroke-linecap="round"/>`},
    {id:'ear',label:'귀/청력',art:`<path d="M13 22 C12 11 21 6 29 8 C38 10 41 20 36 27 C32 32 31 36 28 40 C24 44 18 41 19 36" fill="#F7C4B8" ${OUT}/><path d="M20 21 C20 15 27 13 30 18 C32 22 28 25 26 28" ${LINE}/>`},
    {id:'cog',label:'인지/수면',art:`<path d="M31 8 A17 17 0 1 0 41 31 A14 14 0 0 1 31 8Z" fill="#F7D46A" ${OUT}/><path d="M36 9v6M33 12h6" fill="none" stroke="#3C6FD6" stroke-width="2.4" stroke-linecap="round"/>`},
    {id:'aging',label:'노화',art:`<circle cx="24" cy="24" r="17" fill="#CFE0F5" ${OUT}/><path d="M24 13v11l7 5" ${LINE}/><path d="M24 7v2M24 39v2M7 24h2M39 24h2" ${LINE}/>`},
    {id:'heart',label:'심장',art:`<path d="M24 41 C9 31 6 24 6 17 C6 10 12 7 16 7 C20 7 23 9 24 13 C25 9 28 7 32 7 C36 7 42 10 42 17 C42 24 39 31 24 41Z" fill="#EE6A6A" ${OUT}/><path d="M13 21h7l2-4 4 8 2-4h7" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`},
    {id:'breath',label:'호흡/기침',art:`<path d="M5 18 H28 a5.5 5.5 0 1 0 -5.5 -5.5" fill="none" stroke="#3C6FD6" stroke-width="3.4" stroke-linecap="round"/><path d="M5 26 H36 a5.5 5.5 0 1 1 -5.5 5.5" fill="none" stroke="#6F9FC9" stroke-width="3.4" stroke-linecap="round"/><path d="M5 34 H20 a4.5 4.5 0 1 1 -4.5 4.5" fill="none" stroke="#3C6FD6" stroke-width="3.4" stroke-linecap="round"/>`},
    {id:'kidney',label:'신장/요로',art:`<path d="M24 6 C24 6 10 22 10 30 A14 14 0 0 0 38 30 C38 22 24 6 24 6Z" fill="#F7C93F" ${OUT}/><path d="M17 31 a7.5 7.5 0 0 0 6 6.5" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>`},
    {id:'digest',label:'소화/배변',art:`<path d="M9 40 Q5 40 5 35.5 Q5 31 10 31 L38 31 Q43 31 43 35.5 Q43 40 39 40Z" fill="#A9734A" ${OUT}/><path d="M13 31 Q10 31 10 27 Q10 22 15 22 L33 22 Q38 22 38 27 Q38 31 35 31Z" fill="#B98258" ${OUT}/><path d="M18 22 Q15 21 16 17 Q17 13 22 12 Q26 11 27 8 Q33 14 31 18 Q30 22 30 22Z" fill="#C99468" ${OUT}/>`},
    {id:'weight',label:'비만/체중',art:`<rect x="7" y="7" width="34" height="34" rx="8" fill="#E7EEF7" ${OUT}/><path d="M14 22 a10 10 0 0 1 20 0Z" fill="#fff" ${OUT}/><path d="M24 22l3-6" ${LINE}/>`},
    {id:'food',label:'식욕/영양',art:`<path d="M6 25 H42 L37 41 H11Z" fill="#F0924B" ${OUT}/><rect x="17" y="30" width="14" height="5" rx="2" fill="#fff"/><circle cx="17" cy="19" r="5" fill="#B5773F" ${OUT}/><circle cx="28" cy="18" r="6" fill="#C98E55" ${OUT}/><path d="M34 15 q6 -7 9 -7 q0 7 -8 10" fill="#6FA64B" ${OUT}/>`},
    {id:'lump',label:'혹/종양',art:`<path d="M5 38 H43 V31 H34 C32 20 16 20 14 31 H5Z" fill="#F7C4B8" ${OUT}/><circle cx="24" cy="29" r="3" fill="#E08F80"/><path d="M24 7v6M16 10l2 5M32 10l-2 5" fill="none" stroke="#3C6FD6" stroke-width="2.4" stroke-linecap="round"/>`},
    {id:'immune',label:'면역력',art:`<path d="M24 6 L39 11 V23 C39 32 33 38 24 42 C15 38 9 32 9 23 V11Z" fill="#6FBF7B" ${OUT}/><path d="M16 24l6 6 11-12" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`}
  ];
  const MAX=5;
  const SENIOR_AGE=8;
  const known=pet=>pet&&pet.years!==''&&pet.years!=null&&!Number.isNaN(Number(pet.years));
  function recommended(pet){
    if(!known(pet))return [];
    return Number(pet.years)>=SENIOR_AGE?['joint','teeth','heart']:['skin','teeth','joint'];
  }
  function ordered(pet){
    const rec=recommended(pet);
    return [...rec.map(id=>ITEMS.find(i=>i.id===id)),...ITEMS.filter(i=>!rec.includes(i.id))];
  }
  function labels(ids){return (ids||[]).map(id=>(ITEMS.find(i=>i.id===id)||{}).label).filter(Boolean);}
  window.Concerns={ITEMS,MAX,SENIOR_AGE,recommended,ordered,labels,icon:it=>`<svg viewBox="0 0 48 48" aria-hidden="true">${it.art}</svg>`};
})();
