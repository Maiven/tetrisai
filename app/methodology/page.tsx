export const metadata = {
  title: '방법론 · 반대편',
  description: '반대편 Startup Employee Due Diligence의 5-Lens와 falsification methodology',
};

export default function MethodologyPage() {
  return (
    <main className="legalPage">
      <a className="legalBack" href="/">← 반대편으로 돌아가기</a>
      <p className="eyebrow">METHODOLOGY</p>
      <h1>추천 AI가 아니라<br />검증 프로토콜입니다.</h1>
      <p className="legalLead">반대편은 “갈까 말까?”에 답하기보다, 사용자의 결론을 반증 가능한 상태로 만들고 직접 확인할 질문을 남깁니다.</p>

      <section>
        <h2>Startup 5-Lens</h2>
        <div className="legalGrid">
          <div><b>회사 생존 신호</b><p>런웨이·다음 자금조달 조건·핵심 사업 마일스톤에서 무엇을 물어볼지 봅니다.</p></div>
          <div><b>역할의 실제</b><p>직함보다 첫 90일 성공 기준·의사결정권·하지 않을 일을 봅니다.</p></div>
          <div><b>리더·의사결정권</b><p>리더의 인상보다 실제 피드백·반대 의견 처리·우선순위 충돌 사례를 봅니다.</p></div>
          <div><b>현금·지분 보상</b><p>명목 옵션 수가 아니라 지분율·행사가격·베스팅·행사기간 등 확인 항목을 분리합니다.</p></div>
          <div><b>학습·다음 선택지</b><p>회사의 성장보다 12개월 뒤 개인에게 남을 증명 가능한 역량·성과·네트워크를 봅니다.</p></div>
        </div>
      </section>

      <section>
        <h2>Falsification flow</h2>
        <ol>
          <li>Evidence Ledger — 사실·가정·미확인을 분리합니다.</li>
          <li>Counter Case — 현재 결론이 틀렸다는 가장 강한 경우를 만듭니다.</li>
          <li>Flip Condition — 무엇이 확인되면 생각을 바꿀지 미리 정합니다.</li>
          <li>Reversibility — 잘못 선택했을 때 회복 비용을 봅니다.</li>
          <li>Pre-mortem — 이미 실패했다고 가정하고 원인과 조기 신호를 역추적합니다.</li>
          <li>Smallest Test — 큰 결정을 하기 전에 작은 검증 행동을 제안합니다.</li>
        </ol>
      </section>

      <section>
        <h2>AI가 하는 일과 하지 않는 일</h2>
        <p>생성형 AI는 사용자의 자유로운 문맥을 읽고 구조화된 실사 스키마에 맞춰 질문과 반증 조건을 만듭니다. AI는 퇴사·입사 여부를 대신 선택하지 않고, 외부 근거가 없는 회사 생존 확률이나 지분가치를 만들어내지 않도록 설계했습니다.</p>
      </section>

      <section>
        <h2>Research roots</h2>
        <p><a href="https://hbr.org/2007/09/performing-a-project-premortem" target="_blank" rel="noreferrer">Gary Klein, Performing a Project Premortem ↗</a></p>
        <p><a href="https://onlinelibrary.wiley.com/doi/10.1002/bdm.3960020103" target="_blank" rel="noreferrer">Mitchell, Russo & Pennington, Prospective hindsight ↗</a></p>
      </section>
    </main>
  );
}
