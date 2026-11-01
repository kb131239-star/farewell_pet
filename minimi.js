/* 우리 강아지 미니미: 얼굴(귀 모양) · 몸 크기 · 색깔 · 액세서리를 조합해 SVG로 그린다 */
(function(){
  const OUT='#3A2B20';
  const COLORS={
    white:{label:'하얀색',base:'#FBF7EF',shade:'#E7DCCB',muzzle:'#FFFFFF',ear:'#EEDFC9',swatch:'#FBF7EF'},
    black:{label:'검은색',base:'#35302C',shade:'#26221F',muzzle:'#C9A27E',ear:'#26221F',swatch:'#35302C'},
    brown:{label:'갈색',base:'#B5773F',shade:'#93602F',muzzle:'#F2DCBB',ear:'#86512A',swatch:'#B5773F'},
    bw:{label:'흑백',base:'#FBF7EF',shade:'#E7DCCB',muzzle:'#FFFFFF',ear:'#35302C',patch:'#35302C',swatch:'linear-gradient(135deg,#FBF7EF 50%,#35302C 50%)'},
    cream:{label:'크림색',base:'#EBCB98',shade:'#D2AE76',muzzle:'#FBEEDB',ear:'#D2A666',swatch:'#EBCB98'}
  };
  const FACES={pointy:'쫑긋 귀',floppy:'늘어진 귀',fluffy:'곱슬 털'};
  const SIZES={small:'소형',medium:'중형',large:'대형'};
  const ACCS={none:'없음',ribbon:'리본',bowtie:'나비넥타이',bell:'방울 목걸이',bandana:'두건'};

  function ears(face,p,front){
    if(face==='pointy'){
      if(front)return `<path d="M68 76 L71 40 Q74 34 79 39 L95 60" fill="${p.ear}" stroke="${OUT}" stroke-width="3.2" stroke-linejoin="round"/><path d="M75 52 L76 44 L86 56" fill="#F2B3B0"/><path d="M132 76 L129 40 Q126 34 121 39 L105 60" fill="${p.ear}" stroke="${OUT}" stroke-width="3.2" stroke-linejoin="round"/><path d="M125 52 L124 44 L114 56" fill="#F2B3B0"/>`;
      return '';
    }
    if(face==='floppy'){
      if(!front)return '';
      return `<path d="M66 66 Q48 70 50 98 Q52 120 66 118 Q76 116 74 96 Z" fill="${p.ear}" stroke="${OUT}" stroke-width="3.2" stroke-linejoin="round"/><path d="M134 66 Q152 70 150 98 Q148 120 134 118 Q124 116 126 96 Z" fill="${p.ear}" stroke="${OUT}" stroke-width="3.2" stroke-linejoin="round"/>`;
    }
    /* fluffy: 머리 위 방울과 귀 털뭉치 */
    if(!front){
      const top=[[84,56,11],[100,50,13],[116,56,11],[92,46,9],[108,46,9]];
      return top.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${p.base}" stroke="${OUT}" stroke-width="3"/>`).join('');
    }
    const side=[[60,90,11],[56,104,11],[61,117,10],[140,90,11],[144,104,11],[139,117,10]];
    return side.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${p.ear}" stroke="${OUT}" stroke-width="3"/>`).join('');
  }

  function accessory(acc){
    switch(acc){
      case 'ribbon':return `<g transform="translate(126 58) rotate(18)"><path d="M0 0 L-17 -10 Q-20 0 -17 10 Z" fill="#F06C8C" stroke="${OUT}" stroke-width="2.6" stroke-linejoin="round"/><path d="M0 0 L17 -10 Q20 0 17 10 Z" fill="#F06C8C" stroke="${OUT}" stroke-width="2.6" stroke-linejoin="round"/><circle r="5" fill="#F7A2B6" stroke="${OUT}" stroke-width="2.6"/></g>`;
      case 'bowtie':return `<g transform="translate(100 135)"><path d="M0 0 L-17 -9 Q-20 0 -17 9 Z" fill="#3C6FD6" stroke="${OUT}" stroke-width="2.6" stroke-linejoin="round"/><path d="M0 0 L17 -9 Q20 0 17 9 Z" fill="#3C6FD6" stroke="${OUT}" stroke-width="2.6" stroke-linejoin="round"/><rect x="-5" y="-5.5" width="10" height="11" rx="3" fill="#6E95E6" stroke="${OUT}" stroke-width="2.6"/></g>`;
      case 'bell':return `<path d="M70 128 Q100 142 130 128" fill="none" stroke="${OUT}" stroke-width="10" stroke-linecap="round"/><path d="M70 128 Q100 142 130 128" fill="none" stroke="#D9473F" stroke-width="5.5" stroke-linecap="round"/><circle cx="100" cy="143" r="7.5" fill="#FFC21A" stroke="${OUT}" stroke-width="2.6"/><path d="M95 145h10" stroke="${OUT}" stroke-width="2"/>`;
      case 'bandana':return `<path d="M70 126 Q100 140 130 126 L102 160 Q100 162 98 160 Z" fill="#E5583F" stroke="${OUT}" stroke-width="2.8" stroke-linejoin="round"/><circle cx="92" cy="138" r="2" fill="#fff"/><circle cx="106" cy="140" r="2" fill="#fff"/><circle cx="99" cy="150" r="2" fill="#fff"/>`;
      default:return '';
    }
  }

  /* 체급별 비율: 작은 개는 머리가 크고 다리가 짧게, 큰 개는 몸통·다리가 길고 머리는 상대적으로 작게 */
  const BODY={
    small:{hs:.98,bw:54,bh:46,leg:13,lw:13},
    medium:{hs:.95,bw:66,bh:52,leg:19,lw:15},
    large:{hs:.88,bw:80,bh:64,leg:27,lw:18}
  };
  const BOX='16 22 168 194';
  function svg(cfg={},opt={}){
    const c={face:'floppy',size:'medium',color:'brown',acc:'none',...cfg};
    const p=COLORS[c.color]||COLORS.brown;
    const b=BODY[c.size]||BODY.medium;
    const hb=92+40*b.hs;               /* 머리 아래 끝 */
    const y0=hb-17, y1=y0+b.bh;         /* 몸통 위·아래: 머리 밑으로 파고들어 목이 이어지게 */
    const tw=b.bw*.6, bw=b.bw, L=100-bw/2, R=100+bw/2;
    const groundY=y1+b.leg;
    const f=n=>n.toFixed(1);
    const body=`<path d="M${f(100-tw/2)} ${f(y0+10)} Q${f(100-tw/2)} ${f(y0)} 100 ${f(y0)} Q${f(100+tw/2)} ${f(y0)} ${f(100+tw/2)} ${f(y0+10)} C${f(R)} ${f(y0+b.bh*.42)} ${f(R+3)} ${f(y1-4)} ${f(R-12)} ${f(y1)} L${f(L+12)} ${f(y1)} C${f(L-3)} ${f(y1-4)} ${f(L)} ${f(y0+b.bh*.42)} ${f(100-tw/2)} ${f(y0+10)}Z" fill="${p.base}" stroke="${OUT}" stroke-width="3.2" stroke-linejoin="round"/>`;
    const bib=p.patch?'':`<ellipse cx="100" cy="${f(y0+b.bh*.5)}" rx="${f(bw*.2)}" ry="${f(b.bh*.3)}" fill="${p.muzzle}" opacity=".9"/>`;
    const leg=(x,top,h,fill)=>`<rect x="${f(x-b.lw/2)}" y="${f(top)}" width="${b.lw}" height="${f(h)}" rx="${f(b.lw/2)}" fill="${fill}" stroke="${OUT}" stroke-width="3"/>`;
    const backLegs=leg(100-bw*.36,y1-16,b.leg+14,p.shade)+leg(100+bw*.36,y1-16,b.leg+14,p.shade);
    const frontLegs=leg(100-bw*.15,y1-14,b.leg+14,p.base)+leg(100+bw*.15,y1-14,b.leg+14,p.base);
    const tx=R-8, ty=y0+b.bh*.48;
    const tail=c.face==='fluffy'
      ?`<circle cx="${f(tx+12)}" cy="${f(ty-12)}" r="${f(8+b.bw*.04)}" fill="${p.base}" stroke="${OUT}" stroke-width="3"/>`
      :`<path d="M${f(tx)} ${f(ty)} q${f(14+bw*.08)} -2 ${f(13+bw*.06)} -${f(18+b.bh*.15)}" fill="none" stroke="${OUT}" stroke-width="13" stroke-linecap="round"/><path d="M${f(tx)} ${f(ty)} q${f(14+bw*.08)} -2 ${f(13+bw*.06)} -${f(18+b.bh*.15)}" fill="none" stroke="${c.face==='pointy'?p.base:p.ear}" stroke-width="7" stroke-linecap="round"/>`;
    const bodyPatch=p.patch?`<ellipse cx="${f(100+bw*.2)}" cy="${f(y0+b.bh*.55)}" rx="${f(bw*.26)}" ry="${f(b.bh*.28)}" fill="${p.patch}"/>`:'';
    const eyePatch=p.patch?`<ellipse cx="117" cy="88" rx="13" ry="11" fill="${p.patch}"/>`:'';
    const label=opt.title?`<title>${opt.title}</title>`:'';
    const shadow=opt.shadow===false?'':`<ellipse cx="100" cy="${f(groundY+2)}" rx="${f(bw*.62+10)}" ry="7" fill="rgba(40,60,30,.18)"/>`;
    const head=`<g transform="translate(100 92) scale(${b.hs}) translate(-100 -92)">${ears(c.face,p,false)}<circle cx="100" cy="92" r="40" fill="${p.base}" stroke="${OUT}" stroke-width="${f(3.2/b.hs)}"/>${eyePatch}${ears(c.face,p,true)}<ellipse cx="100" cy="107" rx="21" ry="14.5" fill="${p.muzzle}"/><circle cx="84" cy="90" r="4.8" fill="#24180F"/><circle cx="116" cy="90" r="4.8" fill="${p.patch?'#fff':'#24180F'}"/>${p.patch?'<circle cx="116" cy="90" r="3.4" fill="#24180F"/>':''}<circle cx="85.6" cy="88.4" r="1.6" fill="#fff"/><circle cx="117.6" cy="88.4" r="1.6" fill="#fff"/><ellipse cx="100" cy="101" rx="6.6" ry="4.8" fill="#24180F"/><path d="M100 105 v4 M100 109 q-5 5 -9.5 1 M100 109 q5 5 9.5 1" fill="none" stroke="#24180F" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="75" cy="104" rx="5.5" ry="3.2" fill="#F19C9C" opacity=".55"/><ellipse cx="125" cy="104" rx="5.5" ry="3.2" fill="#F19C9C" opacity=".55"/>${c.acc==='ribbon'?accessory('ribbon'):''}</g>`;
    const cs=Math.max(.82,Math.min(1.05,bw/66));
    const collar=c.acc!=='ribbon'&&c.acc!=='none'?`<g transform="translate(100 ${f(hb-3)}) scale(${cs.toFixed(2)}) translate(-100 -128)">${accessory(c.acc)}</g>`:'';
    const content=`${shadow}${tail}${backLegs}${body}${bib}${bodyPatch}${frontLegs}${head}${collar}`;
    if(opt.inner)return content;
    const vb=opt.viewBox||BOX;
    return `<svg class="minimi ${opt.cls||''}" viewBox="${vb}" ${opt.title?'role="img"':'aria-hidden="true"'}>${label}${content}</svg>`;
  }
  /* 몸무게로 기본 몸 크기 추정 */
  function sizeKey(pet){const s=pet&&pet.size;return s==='소형견'?'small':s==='대형견'?'large':'medium';}
  function config(pet){const m=(pet&&pet.minimi)||{};return {face:'floppy',color:'brown',acc:'none',...m,size:m.size||sizeKey(pet)};}
  window.Minimi={svg,config,BOX,COLORS,FACES,SIZES,ACCS};
})();
