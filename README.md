# farewell pet · 산책 지도

반려견 프로필(체급·약·성격)을 먼저 입력하고, 산책로처럼 이어진 지도에서 병원·호텔·유치원·미용실을 골라 조건을 하나씩 대조해 보는 프로토타입입니다.

- 첫 화면: `index.html`
- 우리 아이 등록(질문 한 개씩 + 건강 고민 + 미니미 꾸미기 + 성격 검사 MCPQ-R): `profile.html`
- 산책 지도 · 필터링 · 상세: `services.html`

호텔·유치원·미용 업체와 요금은 화면 설명용 예시입니다. 병원 3곳은 공개 정보이며, 진료 조건은 병원에 직접 확인해야 합니다.

로컬 실행: `node server.cjs` → http://localhost:5175

성격 검사 참고 문헌
- Ley, Bennett & Coleman (2009). Applied Animal Behaviour Science, 116(2–4), 220–227. doi:10.1016/j.applanim.2008.09.009
- Ley, McGreevy & Bennett (2009). Applied Animal Behaviour Science, 119(1–2), 85–90. doi:10.1016/j.applanim.2009.02.027
