'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';

type Future = { title: string; description: string; upside: string; downside: string };
type Premortem = { step: string; earlySignal: string };
type Analysis = {
  reframedDecision: string;
  realQuestion: string;
  assumptions: string[];
  counterarguments: string[];
  blindSpots: string[];
  futures: Future[];
  premortem: Premortem[];
  evidenceToCheck: string[];
  reversibleExperiment: string;
  decisionRule: string;
  riskNotice: string;
};
type ApiResult = { mode: 'ai' | 'fallback'; model: string; analysis: Analysis };

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
  const resultsRef = useRef<HTMLElement | null>(null);
  const count = useMemo(() => question.length, [question]);

  async function analyze(value?: string) {
    const q = (value ?? question).trim();
    setError('');
    if (q.length < 8) {
      setError('조금 더 구체적으로 적어주세요. 8자 이상이면 좋습니다.');
      return;
    }
    setQuestion(q);
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
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

  return (
    <main>
      <section className="hero" id="top">
        <nav>
          <a href="#top" className="brand" aria-label="반대편 홈">
            <span className="mark"><i /><i /></span>
            <span><strong>반대편</strong><small>Decision Mirror</small></span>
          </a>
          <div className="navlinks">
            <a href="#why">왜 반대편인가</a>
            <a href="#how">작동 방식</a>
            <button onClick={() => document.getElementById('decision-input')?.focus()}>지금 고민해보기 ↗</button>
          </div>
        </nav>

        <div className="heroGrid">
          <div className="copy">
            <p className="eyebrow">AI DECISION RED TEAM</p>
            <h1>당신의 결정에는<br />아직 보지 못한 <em>반대편</em>이 있다.</h1>
            <p className="lead">AI가 답을 대신 정하지 않습니다. 당신의 생각을 반박하고, 숨은 가정과 실패 경로를 찾아 더 넓게 판단하도록 돕습니다.</p>

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
                <span>{count}/700 · 개인정보·회사 비밀정보는 입력하지 마세요.</span>
                <button type="submit" disabled={loading}>{loading ? '분석 중…' : '반대편 보기 →'}</button>
              </div>
              {error && <p className="error">{error}</p>}
            </form>

            <div className="examples">
              <span>예시</span>
              {EXAMPLES.map((x) => <button key={x} onClick={() => analyze(x)}>{x}</button>)}
              <button className="demo" onClick={() => analyze(DEMO)}>▶ 로그인 없이 10초 데모</button>
            </div>
          </div>

          <div className="mirrorArt" aria-label="보이는 가능성과 보이지 않는 위험을 상징하는 두 개의 문">
            <div className="portal warm"><span>보이는 가능성</span><small>내가 기대하는 미래</small></div>
            <div className="mirror"><b>?</b><span>결정하기 전,<br />한 번 더 바라보세요.</span></div>
            <div className="portal cool"><span>보이지 않는 리스크</span><small>내가 놓친 반대편</small></div>
            <div className="person"><i /></div>
          </div>
        </div>

        <div className="trustline">
          <span>◉ 결론을 강요하지 않음</span>
          <span>◐ 숨은 가정과 반대 논리 탐색</span>
          <span>◎ 로그인·회원가입 없이 바로 체험</span>
        </div>
      </section>

      <section className="why section" id="why">
        <p className="eyebrow">THE PROBLEM</p>
        <h2>AI가 똑똑해질수록,<br />우리는 더 쉽게 확신할 수 있습니다.</h2>
        <p className="sectionLead">대부분의 AI는 사용자의 질문에 답합니다. 반대편은 질문 뒤에 숨어 있는 가정부터 의심합니다. 목표는 ‘정답 생성’이 아니라 ‘판단 오류의 조기 발견’입니다.</p>
        <div className="compare">
          <article><b>일반적인 생성형 AI</b><p>질문 → 장단점 → 추천 답변</p><strong>“무엇을 선택할까요?”</strong></article>
          <article className="accent"><b>반대편 · Decision Mirror</b><p>결정 → 가정 → 반박 → 실패경로 → 검증</p><strong>“무엇을 더 확인해야 할까요?”</strong></article>
        </div>
      </section>

      <section className="how section" id="how">
        <p className="eyebrow">HOW IT WORKS</p>
        <h2>하나의 결정을 다섯 각도에서 공격합니다.</h2>
        <div className="steps">
          {[
            ['01', 'Decision Reframe', '겉으로 보이는 선택을 실제 의사결정 문제로 다시 정의합니다.'],
            ['02', 'Assumption Mining', '사용자가 사실처럼 믿고 있는 숨은 가정을 추출합니다.'],
            ['03', 'Counter Agent', '내 결론과 반대되는 논리와 놓친 위험을 의도적으로 만듭니다.'],
            ['04', 'Pre-mortem', '실패했다고 가정한 뒤 원인과 조기 경보 신호를 거꾸로 찾습니다.'],
            ['05', 'Smallest Test', '결정을 확정하기 전에 가장 값싸고 되돌릴 수 있는 실험을 제안합니다.'],
          ].map(([n,t,d]) => <article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}
        </div>
      </section>

      {result && (
        <section className="results" ref={resultsRef}>
          <div className="resultsInner">
            <header className="resultHeader">
              <div>
                <span className={`mode ${result.mode}`}>{result.mode === 'ai' ? 'LIVE AI ANALYSIS' : 'SAFE FALLBACK MODE'}</span>
                <h2>당신의 결정, 반대편에서 다시 봤습니다.</h2>
                <p>{result.model}</p>
              </div>
              <button onClick={() => { setResult(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>새 결정 분석</button>
            </header>

            <article className="heroResult">
              <small>당신이 적은 결정</small>
              <h3>{question}</h3>
              <div className="reframe"><span>AI가 다시 정의한 진짜 질문</span><p>{result.analysis.realQuestion}</p></div>
            </article>

            <div className="resultGrid">
              <ResultList label="ASSUMPTION MINING" title="당연하다고 믿고 있는 것" items={result.analysis.assumptions} />
              <ResultList label="COUNTER AGENT" title="당신의 판단을 반박합니다" items={result.analysis.counterarguments} tone="red" />

              <article className="panel full">
                <p className="panelLabel">BLIND SPOTS</p><h3>지금 시야 밖에 있는 변수</h3>
                <div className="chips">{result.analysis.blindSpots.map((x,i)=><span key={i}>{x}</span>)}</div>
              </article>

              <article className="panel full">
                <p className="panelLabel">POSSIBLE FUTURES</p><h3>하나의 미래 대신 세 개의 경로</h3>
                <div className="futureGrid">{result.analysis.futures.map((f,i)=><div className="future" key={i}><b>{String(i+1).padStart(2,'0')} · {f.title}</b><p>{f.description}</p><div className="up">＋ {f.upside}</div><div className="down">− {f.downside}</div></div>)}</div>
              </article>

              <article className="panel">
                <p className="panelLabel">PRE-MORTEM</p><h3>1년 뒤 실패했다면, 어디서 시작됐을까?</h3>
                <div className="timeline">{result.analysis.premortem.map((p,i)=><div key={i}><i>{i+1}</i><span><b>{p.step}</b><small>조기 신호 · {p.earlySignal}</small></span></div>)}</div>
              </article>

              <ResultList label="EVIDENCE CHECK" title="결정 전에 확인할 데이터" items={result.analysis.evidenceToCheck} />

              <article className="panel actionPanel full">
                <p className="panelLabel">THE SMALLEST REVERSIBLE TEST</p>
                <h3>결정하지 말고, 먼저 이것을 검증하세요.</h3>
                <p className="bigAction">{result.analysis.reversibleExperiment}</p>
                <div className="rule"><b>판단 규칙</b><span>{result.analysis.decisionRule}</span></div>
                <p className="notice">{result.analysis.riskNotice}</p>
              </article>
            </div>
          </div>
        </section>
      )}

      <footer><b>반대편 · Decision Mirror</b><span>더 좋은 답보다, 더 넓은 판단을.</span><small>AI Championship 2026 prototype · 입력 내용은 서비스에서 별도로 저장하지 않도록 설계했습니다.</small></footer>

      {loading && <div className="loading"><div><span className="spinner" /><h3>당신의 판단을 반대편에서 보고 있습니다.</h3><p>가정 → 반대 논리 → 실패 경로 → 작은 실험</p><small>AI가 결론을 대신 내리지 않습니다.</small></div></div>}
    </main>
  );
}

function ResultList({ label, title, items, tone = '' }: { label: string; title: string; items: string[]; tone?: string }) {
  return <article className={`panel ${tone}`}><p className="panelLabel">{label}</p><h3>{title}</h3><ul>{items.map((x,i)=><li key={i}><span>{String(i+1).padStart(2,'0')}</span>{x}</li>)}</ul></article>;
}
