export const metadata = {
  title: '방법론과 연구 근거 · 반대편',
  description: '반대편 Startup Employee Due Diligence의 5-Lens, falsification, Human-AI reliance, startup career research 기반 설계 원칙',
};

export default function MethodologyPage() {
  return (
    <main className="legalPage researchPage">
      <a className="legalBack" href="/">← 반대편으로 돌아가기</a>
      <p className="eyebrow">METHODOLOGY · RESEARCH NOTES</p>
      <h1>추천 AI가 아니라<br />검증 가능한 의사결정 workflow입니다.</h1>
      <p className="legalLead">반대편은 최신 연구를 “논문을 많이 인용하는 화면”으로 쓰지 않습니다. 연구에서 반복해서 나타나는 문제를 제품 규칙으로 번역합니다: AI 과신을 줄이고, 정보 부족을 숨기지 않고, 실제 질문과 증거 수집으로 이어지게 합니다.</p>

      <section>
        <h2>Startup 5-Lens</h2>
        <div className="legalGrid">
          <div><b>회사 생존 신호</b><p>투자 단계 자체를 안정성으로 해석하지 않고, 런웨이·다음 조달 조건·사업 마일스톤에서 무엇을 확인할지 봅니다.</p></div>
          <div><b>역할의 실제</b><p>직함보다 첫 90일 성공 기준·의사결정권·하지 않을 일을 봅니다.</p></div>
          <div><b>리더·의사결정권</b><p>면접 인상보다 실제 피드백·반대 의견 처리·우선순위 충돌 사례를 봅니다.</p></div>
          <div><b>현금·지분 보상</b><p>명목 옵션 수가 아니라 지분율·행사가격·베스팅·행사기간 등 확인 항목을 분리합니다.</p></div>
          <div><b>학습·다음 선택지</b><p>회사의 성장보다 12개월 뒤 개인에게 남을 증명 가능한 역량·성과·네트워크와 실제 대안의 질을 봅니다.</p></div>
        </div>
      </section>

      <section>
        <h2>Falsification + Evidence Loop</h2>
        <ol>
          <li>Initial hypothesis — 현재 기울기가 있으면 정답이 아니라 반증할 가설로 취급합니다.</li>
          <li>Evidence Ledger — 사실·가정·미확인을 분리합니다.</li>
          <li>Counter Case — 현재 결론이 틀렸다는 가장 강한 경우를 만듭니다.</li>
          <li>Flip Condition — 무엇이 확인되면 생각을 바꿀지 미리 정합니다.</li>
          <li>Reality Check — 부정적 현실, 대안의 질, 약속과 현실 차이를 실제 사례 질문으로 확인합니다.</li>
          <li>Reversibility — 잘못 선택했을 때 회복 비용을 봅니다.</li>
          <li>Pre-mortem — 이미 실패했다고 가정하고 원인과 조기 신호를 역추적합니다.</li>
          <li>Verification Sprint — 10분 → 24시간 → 7일로 실제 증거를 확보합니다.</li>
          <li>Evidence Loop — 새 답변을 넣어 AI 분석을 다시 업데이트합니다.</li>
        </ol>
      </section>

      <section>
        <h2>Human–AI 연구에서 가져온 UI 원칙</h2>
        <div className="researchCards">
          <article>
            <span>01 · APPROPRIATE RELIANCE</span>
            <b>신뢰를 최대화하지 않고, 적절한 의존을 목표로 합니다.</b>
            <p>최근 연구는 “AI를 믿는가?”보다 AI가 맞을 때 참고하고 틀릴 때 거부할 수 있는 appropriate reliance를 별도 행동 개념으로 봅니다. 그래서 반대편은 AI 추천 점수 대신 사용자가 직접 확인할 증거와 STOP RULE을 전면에 둡니다.</p>
            <a href="https://www.sciencedirect.com/science/article/pii/S1389041725000373" target="_blank" rel="noreferrer">Cognitive Systems Research, 2025 ↗</a>
            <a href="https://arxiv.org/abs/2604.23896" target="_blank" rel="noreferrer">Raees & Papangelis, 2026 ↗</a>
          </article>

          <article>
            <span>02 · NO FALSE CONFIDENCE</span>
            <b>숫자형 AI 자신감·생존확률을 보여주지 않습니다.</b>
            <p>2026년 연구에서는 시각적 confidence cue가 주관적 구분 능력을 높이면서도 잘못된 AI 답변에 대한 행동적 과의존을 키울 수 있었습니다. “더 많은 불확실성 표시”가 자동으로 더 좋은 판단을 만드는 것은 아닙니다.</p>
            <a href="https://www.sciencedirect.com/science/article/pii/S2949882126000587" target="_blank" rel="noreferrer">Computers in Human Behavior: Artificial Humans, 2026 ↗</a>
          </article>

          <article>
            <span>03 · SHORTER, CHECKABLE OUTPUTS</span>
            <b>긴 설명보다 확인 가능한 항목을 우선합니다.</b>
            <p>Nature Machine Intelligence 연구에서는 긴 LLM 설명이 정확도를 높이지 않아도 사람의 답변 신뢰를 높이는 현상이 관찰됐습니다. 그래서 반대편은 장문의 설득 대신 사실/가정/미확인·질문·Flip Condition을 짧게 분리합니다.</p>
            <a href="https://www.nature.com/articles/s42256-024-00976-7" target="_blank" rel="noreferrer">Nature Machine Intelligence ↗</a>
          </article>

          <article>
            <span>04 · EXPLAIN THE WEAKNESS</span>
            <b>AI가 모르는 것을 숨기지 않습니다.</b>
            <p>AI의 오류가 발생할 수 있는 약점을 사전에 알려준 집단이 잘못된 조언 상황에서 더 나은 성과를 보였다는 실험 결과가 있습니다. 반대편은 비공개 런웨이·리더 행동·미래 지분가치를 알 수 없다고 첫 화면과 결과에 명시합니다.</p>
            <a href="https://www.sciencedirect.com/science/article/pii/S107158192500062X" target="_blank" rel="noreferrer">International Journal of Human-Computer Studies, 2025 ↗</a>
          </article>

          <article>
            <span>05 · MULTI-STEP TRANSPARENCY</span>
            <b>한 번의 추천보다 다단계 workflow를 사용합니다.</b>
            <p>복잡한 과제를 작은 단계로 나눈 transparent workflow는 인간이 AI에 언제 의존할지 더 세밀하게 판단하도록 돕는 연구 방향과 맞닿아 있습니다. 반대편의 5-Lens → Evidence → Flip → Sprint → Re-analysis 구조가 이 원칙을 반영합니다.</p>
            <a href="https://arxiv.org/abs/2501.10909" target="_blank" rel="noreferrer">Fine-Grained Appropriate Reliance, 2025 ↗</a>
          </article>

          <article>
            <span>06 · EXPLANATIONS CAN PERSUADE</span>
            <b>설명가능성 자체를 안전장치로 과신하지 않습니다.</b>
            <p>2024~2026 연구에서는 설명을 붙이는 것만으로 잘못된 AI 조언에 대한 과의존이 줄지 않거나, 설명이 오히려 설득 신호처럼 작동할 수 있음이 보고됐습니다. 그래서 반대편은 “왜 AI가 이렇게 생각했는지”를 길게 설득하기보다 무엇을 사용자가 검증해야 하는지를 보여줍니다.</p>
            <a href="https://www.nature.com/articles/s41598-024-60220-5" target="_blank" rel="noreferrer">Scientific Reports, 2024 ↗</a>
            <a href="https://www.sciencedirect.com/science/article/pii/S0167923626001107" target="_blank" rel="noreferrer">Decision Support Systems, 2026 ↗</a>
          </article>
        </div>
      </section>

      <section>
        <h2>스타트업 커리어 연구에서 가져온 원칙</h2>
        <div className="researchCards">
          <article>
            <span>LEARNING OPPORTUNITY</span>
            <b>“회사 성장”과 “내 학습”을 분리합니다.</b>
            <p>117개 스타트업의 8,817개 고용주 리뷰를 분석한 연구에서 학습 기회는 스타트업의 고용 매력도를 설명하는 중요한 속성으로 나타났습니다. 그래서 반대편은 “빠른 회사 = 빠른 성장”으로 단정하지 않고 실제로 누구에게 무엇을 배우며 12개월 뒤 무엇을 증명할지 묻습니다.</p>
            <a href="https://www.sciencedirect.com/org/science/article/pii/S2046901224000181" target="_blank" rel="noreferrer">European Journal of Training and Development, 2024 ↗</a>
          </article>

          <article>
            <span>ALTERNATIVE QUALITY</span>
            <b>대안이 있는지보다 대안의 질을 봅니다.</b>
            <p>2025년 메타분석에서는 다른 일자리의 단순한 이용가능성보다 대안의 질이 실제 이직과 더 강하게 관련됐습니다. 그래서 반대편의 Reality Check는 “다른 회사가 있나?” 대신 각 선택이 12개월 뒤 만드는 역량·성과·네트워크를 비교하게 합니다.</p>
            <a href="https://www.sciencedirect.com/org/science/article/pii/S0268394625000195" target="_blank" rel="noreferrer">Journal of Managerial Psychology, 2025 ↗</a>
          </article>

          <article>
            <span>ENTREPRENEURIAL PSYCHOLOGICAL CONTRACT</span>
            <b>스타트업의 약속은 전통 조직과 다르게 작동할 수 있습니다.</b>
            <p>기업가적 환경의 불확실성은 직원이 인식하는 심리적 계약의 내용과 위반 경험을 다르게 만들 수 있다는 연구가 있습니다. 그래서 역할·성장·보상에 대해 “처음 들은 약속과 현재 현실 사이의 차이”를 별도로 확인합니다.</p>
            <a href="https://www.sciencedirect.com/org/science/article/abs/pii/S1355255425000375" target="_blank" rel="noreferrer">International Journal of Entrepreneurial Behavior & Research, 2025 ↗</a>
          </article>

          <article>
            <span>REALISTIC PREVIEW</span>
            <b>좋은 점만 듣는 대신 부정적인 현실을 묻습니다.</b>
            <p>Realistic Job Preview 연구의 메타분석은 조직의 솔직함 인식이 이후 자발적 이직과 연결되는 중요한 메커니즘임을 보여줬습니다. 반대편은 “이 역할의 좋은 점”보다 최근 힘든 점·퇴사 이유·실제 실패 사례를 먼저 묻게 합니다.</p>
            <a href="https://onlinelibrary.wiley.com/doi/full/10.1111/j.1744-6570.2011.01230.x" target="_blank" rel="noreferrer">Personnel Psychology meta-analysis ↗</a>
          </article>

          <article>
            <span>STARTUP SEARCH & FIT</span>
            <b>좋은 오퍼와 좋은 fit은 같은 것이 아닙니다.</b>
            <p>2025년 Strategic Management Journal 연구는 스타트업이 후보자에게 먼저 접근하는 firm-driven search가 채용 성과를 높이면서도 이후 이직을 증가시킬 수 있음을 보여줬습니다. 단기적으로 매력적인 오퍼가 장기 정합성을 보장하지 않는다는 점을 제품에 반영합니다.</p>
            <a href="https://sms.onlinelibrary.wiley.com/doi/full/10.1002/smj.3710" target="_blank" rel="noreferrer">Strategic Management Journal, 2025 ↗</a>
          </article>

          <article>
            <span>DYNAMIC FIT</span>
            <b>fit은 입사 순간의 고정값이 아닙니다.</b>
            <p>조직개편·리더 변경·투자 지연 같은 사건은 사람-조직 fit을 시간에 따라 바꿀 수 있습니다. 그래서 반대편은 오퍼 전뿐 아니라 재직 중 잔류·이직·조직개편 결정까지 같은 Evidence Loop로 다룹니다.</p>
            <a href="https://www.sciencedirect.com/science/article/abs/pii/S1053482224000305" target="_blank" rel="noreferrer">Human Resource Management Review, 2024 ↗</a>
          </article>
        </div>
      </section>

      <section>
        <h2>UI/UX 연구를 제품에 적용한 방식</h2>
        <p>Baymard의 2025 SaaS UX 연구에서는 디지털 서비스 구매자가 기능 목록만 읽기보다 실제 UI를 보고 서비스 경험을 확인하려는 행동이 반복해서 관찰됐습니다. 그래서 첫 화면의 추상 일러스트를 실제 결과 화면 미리보기로 교체했습니다. 동시에 초기 입력 마찰을 줄이기 위해 핵심 질문 1개만 먼저 보이고, 회사 단계·직무·현재 기울기는 선택형 progressive disclosure 안으로 이동했습니다.</p>
        <p><a href="https://baymard.com/research-articles/saas-website-ux-best-practices" target="_blank" rel="noreferrer">Baymard Institute, SaaS Website UX Best Practices, 2025 ↗</a></p>
      </section>

      <section>
        <h2>AI가 하는 일과 하지 않는 일</h2>
        <p>생성형 AI는 사용자의 자유로운 문맥을 읽고 구조화된 실사 스키마에 맞춰 질문과 반증 조건을 만듭니다. AI는 퇴사·입사 여부를 대신 선택하지 않고, 외부 근거가 없는 회사 생존 확률·AI 자신감 점수·지분 미래가치를 만들어내지 않습니다. 회사 내부의 비공개 사실은 “모름”으로 남기고 실제 사람과 문서에 질문하도록 바꿉니다.</p>
      </section>

      <p className="legalDate">Research notes updated · 2026-09-18</p>
    </main>
  );
}
