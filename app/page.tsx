'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';

type Future = { title: string; description: string; upside: string; downside: string };
type Premortem = { step: string; earlySignal: string };
type EvidenceItem = { claim: string; status: '사실' | '가정' | '미확인'; why: string };
type DiligenceItem = {
  dimension: '회사 생존 신호' | '역할의 실제' | '리더·의사결정권' | '현금·지분 보상' | '학습·다음 선택지';
  status: '확인됨' | '주의' | '정보 부족' | '검증 우선';
  signal: string;
  missingEvidence: string;
  questionToAsk: string;
};
type StartupContext = { decisionType: string; stage: string; role: string; headcount: string };
type Analysis = {
  reframedDecision: string;
  realQuestion: string;
  assumptions: string[];
  counterarguments: string[];
  blindSpots: string[];
  evidenceLedger: EvidenceItem[];
  startupDiligence: DiligenceItem[];
  flipConditions: string[];
  reversibility: { level: '높음' | '중간' | '낮음'; explanation: string; costToReverse: string };
  decisionTension: { actTooSoon: string; waitTooLong: string };
  futures: Future[];
  premortem: Premortem[];
  evidenceToCheck: string[];
  reversibleExperiment: string;
  decisionRule: string;
  decisionCard: { oneSentence: string; nextCheck: string; stopRule: string };
  riskNotice: string;
};
type ApiResult = { mode: 'ai' | 'fallback' | 'demo'; model: string; analysis: Analysis };

const EXAMPLES = [
  'Series A 스타트업 오퍼를 받았는데 연봉은 10% 낮고 스톡옵션이 있습니다. 옮겨야 할까?',
  '투자 지연과 채용 동결이 반복되는데 지금 회사를 계속 다녀야 할까?',
  '직함은 리드로 올라가지만 권한과 보상은 그대로입니다. 역할을 받아야 할까?',
];

const DECISION_TYPES = ['선택 안 함', '스타트업 합류', '잔류 vs 이직', '역할·승진', '보상·스톡옵션', '조직개편·리더변경', '팀·프로젝트 결정'];
const STAGES = ['선택 안 함', 'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', '투자단계 모름/비VC'];
const ROLES = ['선택 안 함', 'Product/PM', 'Data/AI', 'Engineering', 'Design', 'Growth/Marketing', 'BD/Sales', 'Operations/People', 'Founder/Lead', 'Other'];
const HEADCOUNTS = ['선택 안 함', '1~19명', '20~50명', '51~200명', '201명 이상', '모름'];

const DEMO = '현재 직장은 안정적이지만 성장 속도가 느립니다. 연봉이 15% 높은 Series A 스타트업으로 이직 제안을 받았고 스톡옵션도 있습니다.';
const DEMO_CONTEXT: StartupContext = {
  decisionType: '스타트업 합류',
  stage: 'Series A',
  role: 'Data/AI',
  headcount: '51~200명',
};

export default function Home() {
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState<StartupContext>({
    decisionType: '선택 안 함',
    stage: '선택 안 함',
    role: '선택 안 함',
    headcount: '선택 안 함',
  });
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLElement | null>(null);
  const count = useMemo(() => question.length, [question]);

  async function analyze(value?: string, demo = false) {
    const q = (value ?? question).trim();
    setError('');
    if (!demo && q.length < 8) {
      setError('조금 더 구체적으로 적어주세요. 8자 이상이면 좋습니다.');
      return;
    }

    const activeContext = demo ? DEMO_CONTEXT : context;
    if (demo) setContext(DEMO_CONTEXT);
    setQuestion(q || DEMO);
    setLoading(true);

    try {
      const normalizedContext = Object.fromEntries(
        Object.entries(activeContext).filter(([, v]) => v && v !== '선택 안 함'),
      );

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q || DEMO, demo, context: normalizedContext }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '분석에 실패했습니다.');
      setResult(data);
      requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    } catch (e) {
      setError(e instanceof Error ? e.message : '잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    analyze();
  }

  function updateContext(key: keyof StartupContext, value: string) {
    setContext((prev) => ({ ...prev, [key]: value }));
  }

  async function copySummary() {
    if (!result) return;
    const a = result.analysis;
    const due = a.startupDiligence.map((x) => `- ${x.dimension} [${x.status}]: ${x.questionToAsk}`);
    const summary = [
      '반대편 · Startup Employee Due Diligence',
      '',
      `결정: ${question}`,
      `진짜 질문: ${a.realQuestion}`,
      '',
      '5-Lens 실사',
      ...due,
      '',
      '결론을 뒤집을 조건',
      ...a.flipConditions.map((x, i) => `${i + 1}. ${x}`),
      '',
      `가장 작은 검증: ${a.reversibleExperiment}`,
      `중단 조건: ${a.decisionCard.stopRule}`,
      '',
      'https://decision-mirror-eight.vercel.app',
    ].join('\n');
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main>
      <section className="hero" id="top">
        <nav>
          <a href="#top" className="brand" aria-label="반대편 홈">
            <span className="mark"><i /><i /></span>
            <span><strong>반대편</strong><small>Startup Employee Due Diligence</small></span>
          </a>
          <div className="navlinks">
            <a href="#for-startup">누구를 위한가</a>
            <a href="#how">실사 프로토콜</a>
            <button onClick={() => document.getElementById('decision-input')?.focus()}>내 결정 실사하기 ↗</button>
          </div>
        </nav>

        <div className="heroGrid">
          <div className="copy">
            <p className="eyebrow">EMPLOYEE-SIDE STARTUP DUE DILIGENCE</p>
            <h1>입사·잔류·이직 전에,<br /><em>회사보다 내 결정을 먼저 실사하세요.</em></h1>
            <p className="lead">스타트업은 정보가 부족한데 결정은 빠릅니다. 반대편은 회사·역할·리더·보상·학습의 다섯 영역에서 아직 증명되지 않은 것을 찾아 직원 편에서 결정을 검증합니다.</p>

            <form className="decisionBox" onSubmit={submit}>
              <label htmlFor="decision-input">지금 스타트업에서 고민하고 있는 결정을 적어보세요.</label>
              <textarea
                id="decision-input"
                maxLength={700}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="예: 투자 지연이 반복되고 제 역할은 계속 넓어지는데, 지금 회사를 계속 다녀야 할까?"
              />

              <div className="contextBox">
                <div className="contextTitle">
                  <b>스타트업 컨텍스트</b>
                  <span>선택사항 · 정확할수록 질문이 구체적입니다.</span>
                </div>
                <div className="contextGrid">
                  <ContextSelect label="결정 유형" value={context.decisionType} options={DECISION_TYPES} onChange={(v) => updateContext('decisionType', v)} />
                  <ContextSelect label="회사 단계" value={context.stage} options={STAGES} onChange={(v) => updateContext('stage', v)} />
                  <ContextSelect label="내 직무" value={context.role} options={ROLES} onChange={(v) => updateContext('role', v)} />
                  <ContextSelect label="회사 규모" value={context.headcount} options={HEADCOUNTS} onChange={(v) => updateContext('headcount', v)} />
                </div>
              </div>

              <div className="decisionActions">
                <span>{count}/700 · 회사명·실명·연락처·비공개 숫자 등 민감정보는 입력하지 마세요.</span>
                <button type="submit" disabled={loading}>{loading ? '실사 중…' : '내 결정 실사하기 →'}</button>
              </div>
              {error && <p className="error">{error}</p>}
            </form>

            <div className="examples">
              <span>바로 체험</span>
              {EXAMPLES.map((x) => <button key={x} onClick={() => analyze(x)}>{x}</button>)}
              <button className="demo" onClick={() => analyze(DEMO, true)}>▶ 로그인 없이 10초 데모</button>
            </div>
          </div>

          <div className="mirrorArt" aria-label="직원과 회사 사이의 정보 비대칭을 상징하는 두 경로">
            <div className="portal warm"><span>회사가 보여주는 것</span><small>투자 · 직함 · 비전 · 보상</small></div>
            <div className="mirror"><b>?</b><span>직원이라면<br />무엇을 실사할까?</span></div>
            <div className="portal cool"><span>내가 확인할 것</span><small>런웨이 · 권한 · 리더 · 옵션</small></div>
            <div className="person"><i /></div>
          </div>
        </div>

        <div className="trustline">
          <span>◉ 로그인·회원가입 없이 바로 체험</span>
          <span>◐ 직원 편의 5-Lens Due Diligence</span>
          <span>◎ 회사 생존·지분가치를 임의 예측하지 않음</span>
        </div>
      </section>

      <section className="startupTarget section" id="for-startup">
        <p className="eyebrow">BEACHHEAD USER</p>
        <h2>특히 이런 스타트업 종사자를 위해 만들었습니다.</h2>
        <p className="sectionLead">1차 유료 고객은 <b>Seed~Series B, 약 20~100명 규모의 3~8년차 PM·Data/AI·Engineering 실무자</b>로 더 좁힙니다. 회사의 핵심 실행을 맡지만 모든 경영정보에 접근하지는 못하고, 이직·잔류·리드 역할·스톡옵션 같은 결정의 비용은 이미 커진 사람들입니다. 다른 직군과 단계도 사용할 수 있지만, 제품 학습은 이 집단에서 먼저 시작합니다.</p>
        <div className="personaBar">
          <span className="primaryPersona">PM·Product · PRIMARY</span><span className="primaryPersona">Data·AI · PRIMARY</span><span className="primaryPersona">Engineering · PRIMARY</span><span>Design</span><span>Growth</span><span>BD·Sales</span><span>Operations·People</span>
        </div>
        <div className="decisionCases">
          {[
            ['JOIN', '이 스타트업에 합류할까?', '연봉·옵션보다 런웨이, 역할, 리더와 실제 의사결정권을 실사합니다.'],
            ['STAY', '투자가 지연되는데 남아야 할까?', '불안의 느낌이 아니라 회사 신호와 내 커리어 하방을 분리합니다.'],
            ['ROLE', '리드 역할을 받아야 할까?', '직함보다 권한·성공기준·업무경계·보상 변화가 실제로 있는지 봅니다.'],
            ['EQUITY', '스톡옵션이 정말 좋은 보상일까?', '옵션 수보다 지분율·행사가격·베스팅·행사기간처럼 확인할 조건을 찾습니다.'],
            ['REORG', '조직개편 뒤 계속 버텨야 할까?', '리더 변경·우선순위·내 역할의 가치가 어떻게 달라졌는지 검증합니다.'],
            ['OPTION', '여기서 1년 더 있으면 무엇이 남을까?', '회사 성장보다 내 시장가치에 남을 역량·성과·네트워크를 봅니다.'],
          ].map(([k,t,d]) => <article key={k}><span>{k}</span><h3>{t}</h3><p>{d}</p></article>)}
        </div>
      </section>

      <section className="why section" id="why">
        <p className="eyebrow">THE INFORMATION ASYMMETRY</p>
        <h2>회사는 자신을 설명하지만,<br />직원은 회사를 실사할 도구가 거의 없습니다.</h2>
        <p className="sectionLead">투자자는 회사에 돈을 넣기 전에 due diligence를 합니다. 직원은 더 희소한 자산인 <b>자기 시간과 커리어</b>를 넣지만, 면접·오퍼·사내 소문과 감정 사이에서 판단하는 경우가 많습니다. 반대편은 그 정보 비대칭을 직원 쪽에서 줄입니다.</p>
        <div className="compare">
          <article><b>기존 커리어 상담 / 범용 AI</b><p>고민 → 장단점 → 추천 또는 위로</p><strong>“그래서 갈까요, 말까요?”</strong></article>
          <article className="accent"><b>반대편 · Employee Due Diligence</b><p>결정 → 회사/역할/리더/보상/학습 실사 → 반증 → STOP RULE</p><strong>“무엇을 확인해야 책임 있게 결정할 수 있을까?”</strong></article>
        </div>
      </section>

      <section className="how section" id="how">
        <p className="eyebrow">STARTUP 5-LENS + FALSIFICATION</p>
        <h2>스타트업 커리어 결정을<br />투자 실사처럼 검증합니다.</h2>

        <div className="fiveLens">
          {[
            ['01', '회사 생존 신호', '투자 단계가 아니라 런웨이·다음 조달 조건·사업 마일스톤에서 무엇을 확인할지 묻습니다.'],
            ['02', '역할의 실제', '직함이 아니라 첫 90일 성공 기준, 의사결정권, 하지 않을 업무를 봅니다.'],
            ['03', '리더·의사결정권', '좋은 인상보다 피드백 주기와 최근 실제 의견충돌 사례를 확인합니다.'],
            ['04', '현금·지분 보상', '명목 옵션 수보다 지분율·행사가격·베스팅·행사기간 등 확인 항목을 구조화합니다.'],
            ['05', '학습·다음 선택지', '회사가 실패해도 12개월 뒤 내게 남을 역량·성과·네트워크를 확인합니다.'],
          ].map(([n,t,d]) => <article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}
        </div>

        <div className="steps six">
          {[
            ['A', 'Evidence Ledger', '내가 실제로 아는 것과 회사/나의 가정을 사실·가정·미확인으로 분리합니다.'],
            ['B', 'Counter Case', '현재 결론이 틀렸다고 가정하고 가장 강한 반대 논리를 만듭니다.'],
            ['C', 'Flip Condition', '어떤 사실이 나오면 생각을 바꿀지 결정 전에 정합니다.'],
            ['D', 'Reversibility', '실패했을 때 다시 구직하고 회복하는 시간·돈·경력 비용을 봅니다.'],
            ['E', 'Pre-mortem', '1년 뒤 실패했다고 가정해 원인과 조기 경보 신호를 역추적합니다.'],
            ['F', 'Smallest Test', '퇴사·입사·수락 전에 할 수 있는 가장 작은 검증 행동을 제안합니다.'],
          ].map(([n,t,d]) => <article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}
        </div>

        <div className="researchNote">
          <div><b>Research-grounded</b><span>Pre-mortem · Prospective hindsight</span></div>
          <p>실패를 미리 가정하고 원인을 역추적하는 pre-mortem과 prospective hindsight 연구를 기반으로, 스타트업 종사자가 실제로 회사와 자신의 가정을 검증할 수 있는 프로토콜로 재구성했습니다.</p>
          <div className="sourceLinks">
            <a href="https://hbr.org/2007/09/performing-a-project-premortem" target="_blank" rel="noreferrer">Gary Klein · HBR ↗</a>
            <a href="https://onlinelibrary.wiley.com/doi/10.1002/bdm.3960020103" target="_blank" rel="noreferrer">Mitchell, Russo & Pennington · JBDM ↗</a>
          </div>
        </div>

        <div className="engineBlock">
          <div className="engineIntro">
            <p className="eyebrow">WHY AI · HOW AI</p>
            <h3>스타트업의 맥락은 AI가 읽고,<br />실사 구조는 규칙이 통제합니다.</h3>
            <p>직무·회사 단계·결정 유형이 달라도 자유로운 문장을 AI가 해석합니다. 하지만 출력은 회사·역할·리더·보상·학습의 고정 실사 스키마 안에서만 생성되어 범용 상담보다 비교 가능한 결과를 만듭니다.</p>
          </div>
          <div className="engineGrid">
            <div><span>01</span><b>Context Parsing</b><p>GPT-5.6 Sol이 결정 유형·직무·회사단계와 자유서술을 함께 해석합니다.</p></div>
            <div><span>02</span><b>Startup Ontology</b><p>회사·역할·리더·보상·학습의 5-Lens로 놓친 정보의 위치를 고정합니다.</p></div>
            <div><span>03</span><b>Human Agency</b><p>AI가 퇴사·입사를 대신 결정하지 않고 질문·검증·STOP RULE을 남깁니다.</p></div>
            <div><span>04</span><b>Failure-safe</b><p>AI 호출 실패 시에도 로컬 실사 프레임워크와 즉시 데모로 핵심 경험을 유지합니다.</p></div>
          </div>
          <div className="stackLine"><b>Built with</b><span>Next.js · React · OpenAI GPT-5.6 Sol · Vercel AI SDK · Vercel AI Gateway</span></div>
        </div>
      </section>

      {result && (
        <section className="results" ref={resultsRef}>
          <div className="resultsInner">
            <header className="resultHeader">
              <div>
                <span className={`mode ${result.mode}`}>
                  {result.mode === 'ai' ? 'LIVE STARTUP DUE DILIGENCE' : result.mode === 'demo' ? '10-SECOND STARTUP DEMO' : 'SAFE FALLBACK MODE'}
                </span>
                <h2>좋고 나쁨이 아니라,<br />아직 무엇을 모르는지 찾았습니다.</h2>
                <p>{result.model}</p>
              </div>
              <div className="headerActions">
                <button onClick={copySummary}>{copied ? '복사 완료 ✓' : '실사 카드 복사'}</button>
                <button onClick={() => { setResult(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>새 결정 실사</button>
              </div>
            </header>

            <article className="heroResult">
              <small>당신이 적은 결정</small>
              <h3>{question}</h3>
              <div className="reframe"><span>다시 정의한 진짜 질문</span><p>{result.analysis.realQuestion}</p></div>
            </article>

            <StartupDiligence items={result.analysis.startupDiligence} />

            <div className="resultGrid">
              <EvidenceLedger items={result.analysis.evidenceLedger} />

              <article className="panel flipPanel">
                <p className="panelLabel">FLIP CONDITION</p>
                <h3>이 사실이 나오면, 생각을 바꾸세요.</h3>
                <p className="microcopy">좋은 판단은 확신이 강한 판단이 아니라, 무엇이 나오면 틀렸다고 인정할지 미리 정한 판단입니다.</p>
                <ul>{result.analysis.flipConditions.map((x,i)=><li key={i}><span>{String(i+1).padStart(2,'0')}</span>{x}</li>)}</ul>
              </article>

              <ResultList label="COUNTER CASE" title="현재 결론을 가장 강하게 반박하면" items={result.analysis.counterarguments} tone="red" />
              <ResultList label="ASSUMPTION MINING" title="회사와 나에 대해 당연하다고 믿는 것" items={result.analysis.assumptions} />

              <article className="panel">
                <p className="panelLabel">REVERSIBILITY</p>
                <h3>이 커리어 결정은 얼마나 되돌릴 수 있을까?</h3>
                <div className="reversibility">
                  <strong className={`rev rev-${result.analysis.reversibility.level}`}>{result.analysis.reversibility.level}</strong>
                  <p>{result.analysis.reversibility.explanation}</p>
                </div>
                <div className="costBox"><b>되돌리는 비용</b><span>{result.analysis.reversibility.costToReverse}</span></div>
              </article>

              <article className="panel">
                <p className="panelLabel">TIMING TENSION</p>
                <h3>너무 빨라도, 너무 늦어도 비용이 생깁니다.</h3>
                <div className="tension"><div><b>너무 빨리 결정하면</b><p>{result.analysis.decisionTension.actTooSoon}</p></div><div><b>너무 오래 기다리면</b><p>{result.analysis.decisionTension.waitTooLong}</p></div></div>
              </article>

              <article className="panel full">
                <p className="panelLabel">BLIND SPOTS</p><h3>지금 시야 밖에 있는 변수</h3>
                <div className="chips">{result.analysis.blindSpots.map((x,i)=><span key={i}>{x}</span>)}</div>
              </article>

              <article className="panel full">
                <p className="panelLabel">POSSIBLE PATHS · NOT PREDICTIONS</p><h3>회사의 미래를 예측하지 않고, 내가 선택할 경로를 비교합니다.</h3>
                <div className="futureGrid">{result.analysis.futures.map((f,i)=><div className="future" key={i}><b>{String(i+1).padStart(2,'0')} · {f.title}</b><p>{f.description}</p><div className="up">＋ {f.upside}</div><div className="down">− {f.downside}</div></div>)}</div>
              </article>

              <article className="panel">
                <p className="panelLabel">PRE-MORTEM</p><h3>1년 뒤 이 선택이 실패했다면, 어디서 시작됐을까?</h3>
                <div className="timeline">{result.analysis.premortem.map((p,i)=><div key={i}><i>{i+1}</i><span><b>{p.step}</b><small>조기 신호 · {p.earlySignal}</small></span></div>)}</div>
              </article>

              <ResultList label="EVIDENCE CHECK" title="결정 전에 회사·리더에게 직접 확인할 것" items={result.analysis.evidenceToCheck} />

              <article className="panel actionPanel full">
                <p className="panelLabel">THE SMALLEST REVERSIBLE TEST</p>
                <h3>퇴사·입사부터 하지 말고, 먼저 하나를 검증하세요.</h3>
                <p className="bigAction">{result.analysis.reversibleExperiment}</p>
                <div className="rule"><b>실행 조건</b><span>{result.analysis.decisionRule}</span></div>
              </article>

              <article className="decisionCard full">
                <p className="panelLabel">EMPLOYEE DUE DILIGENCE CARD</p>
                <h3>{result.analysis.decisionCard.oneSentence}</h3>
                <div className="cardGrid">
                  <div><span>NEXT CHECK</span><p>{result.analysis.decisionCard.nextCheck}</p></div>
                  <div><span>STOP RULE</span><p>{result.analysis.decisionCard.stopRule}</p></div>
                </div>
                <p className="notice">{result.analysis.riskNotice}</p>
              </article>
            </div>
          </div>
        </section>
      )}

      <footer>
        <b>반대편</b>
        <span>Startup Employee Due Diligence · Falsify Before You Decide.</span>
        <small>로그인 없이 체험할 수 있습니다. 입력 내용은 서비스 DB에 별도로 저장하지 않도록 설계했으며, AI 분석 요청은 모델 제공 경로를 통해 처리될 수 있습니다. 회사명·실명·비공개 경영정보는 입력하지 마세요.</small><div className="footerLinks"><a href="/methodology">방법론</a><a href="/privacy">프라이버시 원칙</a><a href="https://github.com/Maiven/tetrisai" target="_blank" rel="noreferrer">GitHub</a></div>
      </footer>

      {loading && <div className="loading"><div><span className="spinner" /><h3>직원 편에서 회사를 실사하고 있습니다.</h3><p>회사 → 역할 → 리더 → 보상 → 학습 → 반증 조건</p><small>AI가 퇴사·입사를 대신 결정하지 않습니다.</small></div></div>}
    </main>
  );
}

function ContextSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="contextSelect">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((x) => <option key={x} value={x}>{x}</option>)}
      </select>
    </label>
  );
}

function ResultList({ label, title, items, tone = '' }: { label: string; title: string; items: string[]; tone?: string }) {
  return <article className={`panel ${tone}`}><p className="panelLabel">{label}</p><h3>{title}</h3><ul>{items.map((x,i)=><li key={i}><span>{String(i+1).padStart(2,'0')}</span>{x}</li>)}</ul></article>;
}

function EvidenceLedger({ items }: { items: EvidenceItem[] }) {
  return (
    <article className="panel ledger">
      <p className="panelLabel">EVIDENCE LEDGER</p>
      <h3>무엇을 알고, 무엇을 믿고, 무엇을 모르는가</h3>
      <div className="ledgerList">
        {items.map((x, i) => (
          <div key={i} className="ledgerRow">
            <span className={`status status-${x.status}`}>{x.status}</span>
            <div><b>{x.claim}</b><p>{x.why}</p></div>
          </div>
        ))}
      </div>
    </article>
  );
}

function StartupDiligence({ items }: { items: DiligenceItem[] }) {
  return (
    <article className="startupDiligence">
      <div className="diligenceHead">
        <div><p className="panelLabel">STARTUP 5-LENS DUE DILIGENCE</p><h3>회사보다 먼저, 내 커리어가 투자할 곳을 실사합니다.</h3></div>
        <span>Employee-side</span>
      </div>
      <div className="diligenceGrid">
        {items.map((x, i) => (
          <section key={x.dimension} className="diligenceCard">
            <div className="diligenceTop"><i>{String(i + 1).padStart(2, '0')}</i><b>{x.dimension}</b><span className={`dueStatus due-${x.status.replace(' ', '-')}`}>{x.status}</span></div>
            <p>{x.signal}</p>
            <div className="missing"><small>아직 필요한 증거</small><span>{x.missingEvidence}</span></div>
            <div className="ask"><small>직접 물어볼 질문</small><strong>{x.questionToAsk}</strong></div>
          </section>
        ))}
      </div>
    </article>
  );
}
