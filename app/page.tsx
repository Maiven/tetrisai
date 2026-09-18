'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';

type Future = { title: string; description: string; upside: string; downside: string };
type Premortem = { step: string; earlySignal: string };
type EvidenceItem = { claim: string; status: '사실' | '가정' | '미확인'; why: string };
type Analysis = {
  reframedDecision: string;
  realQuestion: string;
  assumptions: string[];
  counterarguments: string[];
  blindSpots: string[];
  evidenceLedger: EvidenceItem[];
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
  '연봉이 높은 스타트업으로 이직할까?',
  '데이터 분석가에서 AI PM으로 직무를 바꿀까?',
  '지금 창업하는 것이 맞을까?',
];

const DEMO = '현재 직장은 안정적이지만 성장 속도가 느립니다. 연봉이 15% 높은 초기 스타트업으로 이직할지 고민하고 있습니다.';

export default function Home() {
  const [question, setQuestion] = useState('');
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
    setQuestion(q || DEMO);
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q || DEMO, demo }),
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

  async function copySummary() {
    if (!result) return;
    const a = result.analysis;
    const summary = [
      '반대편 · 결정 검증 카드',
      '',
      `결정: ${question}`,
      `진짜 질문: ${a.realQuestion}`,
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
            <span><strong>반대편</strong><small>Falsify Before You Decide</small></span>
          </a>
          <div className="navlinks">
            <a href="#why">왜 필요한가</a>
            <a href="#how">검증 프로토콜</a>
            <button onClick={() => document.getElementById('decision-input')?.focus()}>내 결정 검증하기 ↗</button>
          </div>
        </nav>

        <div className="heroGrid">
          <div className="copy">
            <p className="eyebrow">AI DECISION FALSIFIER</p>
            <h1>결론이 맞다는 이유보다,<br /><em>틀렸다는 증거</em>부터 찾습니다.</h1>
            <p className="lead">반대편은 답을 대신 고르는 AI가 아닙니다. 사실·가정·미확인을 분리하고, 당신의 결론을 뒤집을 조건과 실패 신호를 찾아 결정 전에 검증하게 합니다.</p>

            <form className="decisionBox" onSubmit={submit}>
              <label htmlFor="decision-input">지금 고민하고 있는 결정을 한 문장으로 적어보세요.</label>
              <textarea
                id="decision-input"
                maxLength={700}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="예: 안정적인 회사를 떠나 성장 가능성이 높은 스타트업으로 이직할까?"
              />
              <div className="decisionActions">
                <span>{count}/700 · 이름, 연락처, 회사 비밀정보 등 민감정보는 입력하지 마세요.</span>
                <button type="submit" disabled={loading}>{loading ? '검증 중…' : '내 결론 공격하기 →'}</button>
              </div>
              {error && <p className="error">{error}</p>}
            </form>

            <div className="examples">
              <span>바로 체험</span>
              {EXAMPLES.map((x) => <button key={x} onClick={() => analyze(x)}>{x}</button>)}
              <button className="demo" onClick={() => analyze(DEMO, true)}>▶ 로그인 없이 10초 데모</button>
            </div>
          </div>

          <div className="mirrorArt" aria-label="확신과 반증 가능성을 상징하는 두 개의 경로">
            <div className="portal warm"><span>내가 믿는 결론</span><small>지금 보이는 이유</small></div>
            <div className="mirror"><b>?</b><span>무엇이 나오면<br />생각을 바꿀까?</span></div>
            <div className="portal cool"><span>결론을 깨는 증거</span><small>아직 확인하지 않은 것</small></div>
            <div className="person"><i /></div>
          </div>
        </div>

        <div className="trustline">
          <span>◉ 로그인·회원가입 없이 바로 체험</span>
          <span>◐ 사실 · 가정 · 미확인 분리</span>
          <span>◎ AI 장애 시에도 데모·Fallback 유지</span>
        </div>
      </section>

      <section className="why section" id="why">
        <p className="eyebrow">THE REAL PROBLEM</p>
        <h2>AI가 말을 잘할수록,<br />그럴듯한 확신도 더 쉽게 만들어집니다.</h2>
        <p className="sectionLead">중요한 결정에서 필요한 것은 또 하나의 추천이 아니라, 지금 믿고 있는 결론이 어디서 무너질 수 있는지를 먼저 보는 일입니다. 반대편은 ‘찬반 정리’가 아니라 <b>결론을 반증 가능한 상태로 바꾸는 것</b>을 제품의 핵심으로 둡니다.</p>
        <div className="compare">
          <article><b>일반적인 생성형 AI</b><p>질문 → 장단점 → 매끄러운 추천</p><strong>“그래서 무엇을 할까요?”</strong></article>
          <article className="accent"><b>반대편</b><p>결정 → 증거 분리 → 반증 → 실패 신호 → 작은 실험</p><strong>“무엇이 나오면 생각을 바꿀까요?”</strong></article>
        </div>
      </section>

      <section className="how section" id="how">
        <p className="eyebrow">FALSIFICATION PROTOCOL</p>
        <h2>확신을 키우기 전에,<br />결론을 여섯 번 검증합니다.</h2>
        <div className="steps six">
          {[
            ['01', 'Decision Reframe', '겉으로 보이는 선택을 실제로 감당해야 할 의사결정 문제로 다시 정의합니다.'],
            ['02', 'Evidence Ledger', '사용자 문장을 사실·가정·미확인으로 분리해 무엇을 실제로 아는지 보여줍니다.'],
            ['03', 'Counter Case', '현재 결론을 가장 강하게 반박할 수 있는 논리와 사각지대를 만듭니다.'],
            ['04', 'Flip Condition', '어떤 새로운 사실이 나오면 생각을 바꿔야 하는지 미리 정합니다.'],
            ['05', 'Pre-mortem', '이미 실패했다고 가정하고 원인과 조기 경보 신호를 거꾸로 찾습니다.'],
            ['06', 'Smallest Test', '큰 결정을 내리기 전에 가장 싸고 되돌릴 수 있는 검증 행동을 설계합니다.'],
          ].map(([n,t,d]) => <article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}
        </div>
        <div className="researchNote">
          <div><b>Research-grounded</b><span>Pre-mortem · Prospective hindsight</span></div>
          <p>실패를 미리 가정하고 원인을 역추적하는 pre-mortem과 prospective hindsight 연구에서 출발하되, 반대편은 이를 개인의 실제 결정에 맞는 검증 프로토콜로 재구성했습니다.</p>
          <div className="sourceLinks">
            <a href="https://hbr.org/2007/09/performing-a-project-premortem" target="_blank" rel="noreferrer">Gary Klein · HBR ↗</a>
            <a href="https://onlinelibrary.wiley.com/doi/10.1002/bdm.3960020103" target="_blank" rel="noreferrer">Mitchell, Russo & Pennington · JBDM ↗</a>
          </div>
        </div>

        <div className="engineBlock">
          <div className="engineIntro">
            <p className="eyebrow">WHY AI · HOW AI</p>
            <h3>자유로운 고민은 AI가 읽고,<br />판단 구조는 규칙이 통제합니다.</h3>
            <p>자연어로 들어오는 복잡한 맥락은 생성형 AI가 해석하지만, 결과는 미리 정의된 구조 안에서만 생성됩니다. 그래서 “그럴듯한 상담”보다 비교·검증 가능한 결과를 만듭니다.</p>
          </div>
          <div className="engineGrid">
            <div><span>01</span><b>Context Parsing</b><p>GPT-5.6 Sol이 사용자의 맥락과 실제 결정 변수를 구조화합니다.</p></div>
            <div><span>02</span><b>Structured Output</b><p>사실·가정·반증조건·pre-mortem을 고정 스키마로 반환합니다.</p></div>
            <div><span>03</span><b>Human Agency</b><p>AI가 A/B를 선택하지 않고 사용자가 확인할 증거와 중단 조건을 남깁니다.</p></div>
            <div><span>04</span><b>Failure-safe</b><p>AI 호출 실패 시에도 로컬 프레임워크와 즉시 데모로 핵심 경험을 유지합니다.</p></div>
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
                  {result.mode === 'ai' ? 'LIVE AI FALSIFICATION' : result.mode === 'demo' ? '10-SECOND DEMO' : 'SAFE FALLBACK MODE'}
                </span>
                <h2>확신이 아니라, 검증 가능한 결정으로 바꿨습니다.</h2>
                <p>{result.model}</p>
              </div>
              <div className="headerActions">
                <button onClick={copySummary}>{copied ? '복사 완료 ✓' : '결정 카드 복사'}</button>
                <button onClick={() => { setResult(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>새 결정 분석</button>
              </div>
            </header>

            <article className="heroResult">
              <small>당신이 적은 결정</small>
              <h3>{question}</h3>
              <div className="reframe"><span>다시 정의한 진짜 질문</span><p>{result.analysis.realQuestion}</p></div>
            </article>

            <div className="resultGrid">
              <EvidenceLedger items={result.analysis.evidenceLedger} />

              <article className="panel flipPanel">
                <p className="panelLabel">FLIP CONDITION</p>
                <h3>이 사실이 나오면, 생각을 바꾸세요.</h3>
                <p className="microcopy">좋은 판단은 확신이 강한 판단이 아니라, 무엇이 나오면 틀렸다고 인정할지 미리 정한 판단입니다.</p>
                <ul>{result.analysis.flipConditions.map((x,i)=><li key={i}><span>{String(i+1).padStart(2,'0')}</span>{x}</li>)}</ul>
              </article>

              <ResultList label="COUNTER CASE" title="현재 결론을 가장 강하게 반박하면" items={result.analysis.counterarguments} tone="red" />
              <ResultList label="ASSUMPTION MINING" title="당연하다고 믿고 있는 것" items={result.analysis.assumptions} />

              <article className="panel">
                <p className="panelLabel">REVERSIBILITY</p>
                <h3>이 결정은 얼마나 되돌릴 수 있을까?</h3>
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
                <p className="panelLabel">POSSIBLE PATHS · NOT PREDICTIONS</p><h3>미래를 예언하지 않고, 세 개의 경로를 비교합니다.</h3>
                <div className="futureGrid">{result.analysis.futures.map((f,i)=><div className="future" key={i}><b>{String(i+1).padStart(2,'0')} · {f.title}</b><p>{f.description}</p><div className="up">＋ {f.upside}</div><div className="down">− {f.downside}</div></div>)}</div>
              </article>

              <article className="panel">
                <p className="panelLabel">PRE-MORTEM</p><h3>1년 뒤 실패했다면, 어디서 시작됐을까?</h3>
                <div className="timeline">{result.analysis.premortem.map((p,i)=><div key={i}><i>{i+1}</i><span><b>{p.step}</b><small>조기 신호 · {p.earlySignal}</small></span></div>)}</div>
              </article>

              <ResultList label="EVIDENCE CHECK" title="결정 전에 직접 확인할 것" items={result.analysis.evidenceToCheck} />

              <article className="panel actionPanel full">
                <p className="panelLabel">THE SMALLEST REVERSIBLE TEST</p>
                <h3>결정하지 말고, 먼저 하나를 검증하세요.</h3>
                <p className="bigAction">{result.analysis.reversibleExperiment}</p>
                <div className="rule"><b>실행 조건</b><span>{result.analysis.decisionRule}</span></div>
              </article>

              <article className="decisionCard full">
                <p className="panelLabel">DECISION CARD</p>
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
        <span>Falsify Before You Decide.</span>
        <small>로그인 없이 체험할 수 있습니다. 입력 내용은 서비스 DB에 별도로 저장하지 않도록 설계했으며, AI 분석 요청은 모델 제공 경로를 통해 처리될 수 있습니다.</small>
      </footer>

      {loading && <div className="loading"><div><span className="spinner" /><h3>당신의 결론이 틀릴 수 있는 이유를 찾고 있습니다.</h3><p>사실/가정 분리 → 반증 조건 → 실패 신호 → 가장 작은 검증</p><small>AI가 결정을 대신 내리지 않습니다.</small></div></div>}
    </main>
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
