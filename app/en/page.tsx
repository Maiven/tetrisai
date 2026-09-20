'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

type Dimension =
  | '회사 생존 신호'
  | '역할의 실제'
  | '리더·의사결정권'
  | '현금·지분 보상'
  | '학습·다음 선택지';

type DiligenceItem = {
  dimension: Dimension;
  status: '확인됨' | '주의' | '정보 부족' | '검증 우선';
  signal: string;
  missingEvidence: string;
  questionToAsk: string;
  askWho: '채용담당자' | '직속리더' | '현직자' | '공식문서/전문가';
};

type Analysis = {
  reframedDecision: string;
  realQuestion: string;
  assumptions: string[];
  counterarguments: string[];
  blindSpots: string[];
  evidenceLedger: { claim: string; status: '사실' | '가정' | '미확인'; why: string }[];
  startupDiligence: DiligenceItem[];
  realityCheck: { negativePreview: string; alternativeQuality: string; promiseGap: string };
  sourceAudit: {
    present: boolean;
    claims: {
      dimension: Dimension;
      claim: string;
      classification: '문서상 약속' | '구체 조건' | '모호한 표현';
      verificationQuestion: string;
    }[];
    missingTerms: string[];
    note: string;
  };
  flipConditions: string[];
  reversibility: { level: '높음' | '중간' | '낮음'; explanation: string; costToReverse: string };
  decisionTension: { actTooSoon: string; waitTooLong: string };
  futures: { title: string; description: string; upside: string; downside: string }[];
  premortem: { step: string; earlySignal: string }[];
  evidenceToCheck: string[];
  verificationSprint: { horizon: '지금 10분' | '24시간 안' | '7일 안'; action: string; evidence: string }[];
  reversibleExperiment: string;
  decisionRule: string;
  decisionCard: { oneSentence: string; nextCheck: string; stopRule: string };
  riskNotice: string;
};

type GlobalResponseSignal = 'not_asked' | 'concrete' | 'vague' | 'declined';

type Result = {
  mode: 'ai' | 'fallback' | 'sample';
  model: string;
  analysis: Analysis;
  ontologyGraph?: {
    ontologyVersion: string;
    nodes: { id: string; type: string; label: string; provenance: string }[];
    edges: { source: string; relation: string; target: string }[];
  };
};

type PublicResearch = {
  research: {
    overview: string;
    signals: {
      dimension: Dimension;
      finding: string;
      evidenceLevel: '공개 확인' | '간접 신호' | '확인 안 됨' | '충돌';
      implication: string;
      caution: string;
    }[];
    questionsToVerify: string[];
    freshnessNote: string;
  };
  sources: { id: string; title: string; url: string }[];
  searchedAt: string;
  note: string;
};

type Context = {
  decisionType: string;
  stage: string;
  role: string;
  headcount: string;
  initialLean: string;
  region: string;
};

const DIMENSION: Record<Dimension, string> = {
  '회사 생존 신호': 'Company viability',
  '역할의 실제': 'Role reality',
  '리더·의사결정권': 'Leadership & decision rights',
  '현금·지분 보상': 'Cash & equity',
  '학습·다음 선택지': 'Learning & future options',
};

const STATUS: Record<DiligenceItem['status'], string> = {
  '확인됨': 'Verified',
  '주의': 'Caution',
  '정보 부족': 'Missing info',
  '검증 우선': 'Verify first',
};

const HORIZON: Record<Analysis['verificationSprint'][number]['horizon'], string> = {
  '지금 10분': 'Next 10 minutes',
  '24시간 안': 'Within 24 hours',
  '7일 안': 'Within 7 days',
};

const CLASSIFICATION: Record<Analysis['sourceAudit']['claims'][number]['classification'], string> = {
  '문서상 약속': 'Documented promise',
  '구체 조건': 'Concrete term',
  '모호한 표현': 'Ambiguous wording',
};

const ASK_WHO: Record<DiligenceItem['askWho'], string> = {
  '채용담당자': 'Recruiter / People team',
  '직속리더': 'Hiring manager',
  '현직자': 'Current employee',
  '공식문서/전문가': 'Official docs / qualified expert',
};

const PUBLIC_LEVEL: Record<PublicResearch['research']['signals'][number]['evidenceLevel'], string> = {
  '공개 확인': 'Publicly confirmed',
  '간접 신호': 'Indirect signal',
  '확인 안 됨': 'Not publicly verified',
  '충돌': 'Conflicting sources',
};

const REGIONS = [
  'Not specified',
  'United States',
  'Canada',
  'United Kingdom',
  'European Union',
  'Korea',
  'Japan',
  'India',
  'Southeast Asia',
  'Australia / New Zealand',
  'Middle East',
  'Latin America',
  'Remote / multi-jurisdiction',
  'Other',
];

const QUICK_STARTS = [
  {
    label: 'I received a startup offer',
    meta: 'OFFER',
    question: 'I received an offer from a Series A startup with higher cash compensation and stock options. What should I verify before I accept?',
  },
  {
    label: 'My company feels unstable',
    meta: 'STAY / LEAVE',
    question: 'Fundraising is delayed and hiring has slowed. I need to decide whether to stay or leave. What evidence should I gather first?',
  },
  {
    label: 'My scope grew, but authority did not',
    meta: 'ROLE',
    question: 'I am being asked to take a lead role, but I am not sure the decision rights, compensation, and success criteria are actually changing. What should I verify?',
  },
  {
    label: 'I do not understand the equity',
    meta: 'EQUITY',
    question: 'A startup offered me stock options. What terms and real-world facts should I verify before I treat the equity as meaningful compensation?',
  },
];

const defaultContext: Context = {
  decisionType: 'Not specified',
  stage: 'Not specified',
  role: 'Not specified',
  headcount: 'Not specified',
  initialLean: 'Not sure yet',
  region: 'Not specified',
};

export default function GlobalPage() {
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState<Context>(defaultContext);
  const [sourceExcerpt, setSourceExcerpt] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState<Record<string, string>>({});
  const [responseSignals, setResponseSignals] = useState<Record<string, GlobalResponseSignal>>({});
  const [publicCompany, setPublicCompany] = useState('');
  const [publicWebsite, setPublicWebsite] = useState('');
  const [publicResearch, setPublicResearch] = useState<PublicResearch | null>(null);
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicError, setPublicError] = useState('');
  const [saved, setSaved] = useState(false);
  const resultsRef = useRef<HTMLElement | null>(null);

  const evidenceCount = useMemo(
    () => Object.values(responseSignals).filter((x) => x === 'concrete').length,
    [responseSignals],
  );
  const frictionCount = useMemo(
    () => Object.values(responseSignals).filter((x) => x === 'vague' || x === 'declined').length,
    [responseSignals],
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem('bandaepyeon:global-passport');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data.question === 'string') {
        setQuestion(data.question);
        if (data.context) setContext(data.context);
        if (data.evidenceNotes) setEvidenceNotes(data.evidenceNotes);
        if (data.responseSignals) setResponseSignals(data.responseSignals);
        setSaved(true);
      }
    } catch {
      // local-only persistence is optional
    }
  }, []);

  function contextPayload() {
    return {
      decisionType: context.decisionType === 'Not specified' ? '' : context.decisionType,
      stage: context.stage === 'Not specified' ? '' : context.stage,
      role: context.role === 'Not specified' ? '' : context.role,
      headcount: context.headcount === 'Not specified' ? '' : context.headcount,
      initialLean: context.initialLean,
      region: context.region === 'Not specified' ? '' : context.region,
    };
  }

  function publicEvidencePayload() {
    if (!publicResearch) return [];
    return publicResearch.research.signals
      .filter((x) => x.evidenceLevel !== '확인 안 됨')
      .map((x) => `${x.dimension}: ${x.finding} [${x.evidenceLevel}] · caution: ${x.caution}`);
  }

  async function analyze(
    value?: string,
    verifiedEvidence: string[] = [],
    publicEvidence: string[] = publicEvidencePayload(),
    transparencySignals: string[] = [],
  ) {
    const q = (value ?? question).trim();
    setError('');
    if (q.length < 8) {
      setError('Describe the decision with a little more context.');
      return;
    }
    setQuestion(q);
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          context: contextPayload(),
          verifiedEvidence,
          publicEvidence,
          transparencySignals,
          sourceExcerpt,
          language: 'en',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'The diligence could not be completed.');
      setResult(data);
      requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    analyze();
  }

  async function reanalyze() {
    const verified = Object.entries(responseSignals)
      .filter(([, signal]) => signal === 'concrete')
      .map(([dimension]) => {
        const note = evidenceNotes[dimension]?.trim();
        return `${dimension}: concrete answer received${note ? ` · ${note}` : ''}`;
      });

    const transparency = Object.entries(responseSignals)
      .filter(([, signal]) => signal === 'vague' || signal === 'declined')
      .map(([dimension, signal]) => {
        const label = signal === 'vague' ? 'vague answer' : 'answer declined';
        const note = evidenceNotes[dimension]?.trim();
        return `${dimension}: ${label}${note ? ` · ${note}` : ''}`;
      });

    for (const [dimension, note] of Object.entries(evidenceNotes)) {
      if (!note.trim() || responseSignals[dimension]) continue;
      transparency.push(`${dimension}: user note with unclassified verification level · ${note.trim()}`);
    }

    if (!verified.length && !transparency.length) {
      setError('Mark how the company responded, or add an anonymized note about what you learned.');
      return;
    }
    await analyze(question, verified, publicEvidencePayload(), transparency);
  }

  async function researchPublicEvidence() {
    setPublicError('');
    if (publicCompany.trim().length < 2) {
      setPublicError('Enter a publicly searchable company name.');
      return;
    }
    setPublicLoading(true);
    try {
      const res = await fetch('/api/public-evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: publicCompany.trim(),
          website: publicWebsite.trim(),
          role: context.role,
          region: context.region,
          language: 'en',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Public research failed.');
      setPublicResearch(data);
    } catch (e) {
      setPublicError(e instanceof Error ? e.message : 'Public research failed.');
    } finally {
      setPublicLoading(false);
    }
  }

  function savePassport() {
    try {
      localStorage.setItem('bandaepyeon:global-passport', JSON.stringify({
        question,
        context,
        evidenceNotes,
        responseSignals,
        savedAt: new Date().toISOString(),
        revisitAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      }));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  async function copyQuestion(text: string) {
    await navigator.clipboard.writeText(text);
  }

  async function copyDiligenceRequest(items: DiligenceItem[]) {
    const rank: Record<DiligenceItem['status'], number> = { '검증 우선': 0, '정보 부족': 1, '주의': 2, '확인됨': 3 };
    const top = [...items].sort((a, b) => rank[a.status] - rank[b.status]).slice(0, 3);
    const request = [
      'Hi — I am reviewing the offer and want to make sure I understand the role and expectations accurately before I decide. Could I clarify three things?',
      '',
      ...top.map((x, i) => `${i + 1}. ${x.questionToAsk}`),
      '',
      'I am not asking for confidential information. Concrete examples or the most specific shareable answer would be very helpful.',
      'Thank you.',
    ].join('\n');
    await navigator.clipboard.writeText(request);
  }

  async function copyQuestionPack(items: DiligenceItem[]) {
    const rank: Record<DiligenceItem['status'], number> = { '검증 우선': 0, '정보 부족': 1, '주의': 2, '확인됨': 3 };
    const top = [...items].sort((a, b) => rank[a.status] - rank[b.status]).slice(0, 3);
    const pack = [
      'Bandaepyeon · 3 questions to ask before I decide',
      '',
      ...top.map((x, i) => `${i + 1}. [${DIMENSION[x.dimension]}] ${x.questionToAsk}`),
      '',
      'Get the answers first. Then update the decision.',
    ].join('\n');
    await navigator.clipboard.writeText(pack);
  }

  return (
    <main className="globalProduct" lang="en">
      <section className="globalHero">
        <nav className="globalNav">
          <a className="globalBrand" href="/en">
            <span className="mark"><i /><i /></span>
            <span><strong>Bandaepyeon</strong><small>Decision Due Diligence</small></span>
          </a>
          <div>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="/en/methodology">Research</a>
            <a className="localeSwitch" href="/">한국어</a>
          </div>
        </nav>

        <div className="globalHeroGrid">
          <div className="globalHeroCopy">
            <p className="eyebrow">STARTUP OFFER & CAREER DUE DILIGENCE · GLOBAL</p>
            <h1>Got a startup offer?<br /><em>Before you say yes, find what is still unproven.</em></h1>
            <p className="globalLead">
              Salary and equity are the visible part of the offer. The expensive mistakes usually hide in
              <b> runway, real decision rights, manager behavior, equity terms, and what you will actually learn.</b>
              Bandaepyeon turns those unknowns into questions you can use today.
            </p>

            <div className="heroOutcomeStrip globalOutcomeStrip">
              <div><span>01</span><b>3 questions to ask today</b><small>Recruiter, manager, or current employee</small></div>
              <div><span>02</span><b>Your flip conditions</b><small>What evidence should change your mind</small></div>
              <div><span>03</span><b>A 7-day evidence sprint</b><small>Move from AI output to real-world verification</small></div>
            </div>

            <div className="globalProofRow">
              <span>No login</span><span>No recommendation score</span><span>Public evidence + real questions</span>
            </div>

            <form className="globalDecisionBox" onSubmit={submit}>
              <label htmlFor="global-decision">Have an offer? Describe it in one sentence. Other startup career decisions work too.</label>
              <textarea
                id="global-decision"
                value={question}
                maxLength={700}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Example: I have a Series A offer with better cash and equity, but I am unsure about runway, my actual decision rights, and whether the role will accelerate my career."
              />

              <details className="globalContext">
                <summary>Optional context · make the diligence more specific</summary>
                <div className="globalContextGrid">
                  <GlobalSelect label="Region / jurisdiction" value={context.region} options={REGIONS} onChange={(v) => setContext({ ...context, region: v })} />
                  <GlobalSelect label="Company stage" value={context.stage} options={['Not specified','Pre-seed','Seed','Series A','Series B','Series C+','Bootstrapped / unknown']} onChange={(v) => setContext({ ...context, stage: v })} />
                  <GlobalSelect label="Role" value={context.role} options={['Not specified','Product / PM','Data / AI','Engineering','Design','Growth / Marketing','Sales / BD','Operations / People','Leadership','Other']} onChange={(v) => setContext({ ...context, role: v })} />
                  <GlobalSelect label="Company size" value={context.headcount} options={['Not specified','1–19','20–100','101–250','251+','Unknown']} onChange={(v) => setContext({ ...context, headcount: v })} />
                  <GlobalSelect label="My current lean" value={context.initialLean} options={['Not sure yet','Leaning yes / accept','Leaning no / stay','Leaning toward another option']} onChange={(v) => setContext({ ...context, initialLean: v })} />
                </div>
                <label className="globalSourceInput">
                  <span>Public job description or sanitized offer summary · optional</span>
                  <textarea
                    value={sourceExcerpt}
                    maxLength={4000}
                    onChange={(e) => setSourceExcerpt(e.target.value)}
                    placeholder="Remove names, confidential financials, customer data, and contract text. Paste only role, scope, compensation, equity, or growth claims you want audited."
                  />
                </label>
              </details>

              <div className="globalDecisionActions">
                <small>Do not enter confidential company information or personal identifiers.</small>
                <button type="submit" disabled={loading}>{loading ? 'Running diligence…' : 'Diligence before I say yes →'}</button>
              </div>
              {error && <p className="globalError">{error}</p>}
            </form>

            <div className="globalQuickStarts">
              {QUICK_STARTS.map((x) => (
                <button key={x.meta} onClick={() => analyze(x.question)}>
                  <small>{x.meta}</small><b>{x.label}</b><span>Start →</span>
                </button>
              ))}
            </div>
          </div>

          <div className="globalWorkbench">
            <div className="globalWorkbenchTop">
              <span>DECISION WORKBENCH</span><i>Evidence-first</i>
            </div>
            <div className="globalExampleDecision">
              <small>Decision</small>
              <b>Should I accept a Series A startup offer?</b>
            </div>
            {[
              ['Company viability','VERIFY FIRST'],
              ['Role reality','MISSING INFO'],
              ['Leadership & decision rights','MISSING INFO'],
              ['Cash & equity','VERIFY FIRST'],
              ['Learning & future options','CAUTION'],
            ].map(([a,b]) => <div className="globalLensRow" key={a}><span>{a}</span><b>{b}</b></div>)}
            <div className="globalFlip">
              <small>FLIP CONDITION</small>
              <p>If runway, actual decision rights, and equity terms remain unclear, do not treat “high growth” as sufficient evidence.</p>
            </div>
            <div className="globalLoopPreview">
              <span><b>10 min</b>Frame questions</span><i>→</i><span><b>24 h</b>Get answers</span><i>→</i><span><b>7 days</b>Re-diligence</span>
            </div>
          </div>
        </div>
      </section>

      <section className="globalWhy" id="how">
        <p className="eyebrow">WHY THIS EXISTS</p>
        <h2>A startup offer is not just compensation.<br />It is a portfolio allocation of your career.</h2>
        <div className="globalValueGrid">
          <article><span>01</span><h3>Separate story from evidence</h3><p>Funding stage, brand, title, and equity count can look precise while leaving the most important questions unanswered.</p></article>
          <article><span>02</span><h3>Ask the questions companies rarely volunteer</h3><p>Runway milestones, decision rights, failure cases, manager behavior, vesting and exercise terms, and what you will actually learn.</p></article>
          <article><span>03</span><h3>Update the decision when reality changes</h3><p>New public evidence and answers from recruiters, managers, and employees re-enter the same Decision Graph.</p></article>
        </div>
      </section>

      <section className="globalCategory">
        <p className="eyebrow">NEW CATEGORY · CANDIDATE DILIGENCE PROTOCOL</p>
        <h2>Not more career advice.<br />A standard way to exchange evidence before you accept.</h2>
        <p>Reviews, compensation benchmarks, AI, and human coaching each solve valuable parts of the problem. Bandaepyeon connects the missing workflow: <b>candidate asks → company responds → response quality is recorded → evidence updates → the decision changes.</b></p>
        <div className="categoryProtocol globalCategoryProtocol">
          <div><i>1</i><b>Candidate asks</b><span>Structured diligence request</span></div><em>→</em>
          <div><i>2</i><b>Company responds</b><span>Concrete, vague, or unavailable</span></div><em>→</em>
          <div><i>3</i><b>Evidence separates</b><span>Fact vs transparency signal</span></div><em>→</em>
          <div><i>4</i><b>Decision updates</b><span>Re-diligence before commitment</span></div>
        </div>
        <p className="categoryResearch">A 2026 AEJ: Applied Economics field experiment found that giving applicants better startup-quality information materially shifted where they applied, while broader overoptimism about startup success remained. <a href="https://www.aeaweb.org/articles?id=10.1257%2Fapp.20240722" target="_blank" rel="noreferrer">Research ↗</a></p>
      </section>

      {result && (
        <section className="globalResults" ref={resultsRef}>
          <div className="globalResultsInner">
            <header className="globalResultHeader">
              <div>
                <span>{result.mode === 'ai' ? 'LIVE DUE DILIGENCE' : result.mode === 'fallback' ? 'SAFE LOCAL FRAMEWORK' : 'GUIDED DUE DILIGENCE'}</span>
                <h2>What you still need to know.</h2>
                <p>{result.analysis.realQuestion}</p>
              </div>
              <button onClick={() => { setResult(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>New decision</button>
            </header>

            <GlobalDecisionGap items={result.analysis.startupDiligence} onCopyPack={copyQuestionPack} onCopyRequest={copyDiligenceRequest} />

            <div className="globalNextRow">
              <article><span>NEXT CHECK</span><b>{result.analysis.decisionCard.nextCheck}</b></article>
              <article><span>FIRST 10 MINUTES</span><b>{result.analysis.verificationSprint[0]?.action}</b></article>
              <article><span>STOP RULE</span><b>{result.analysis.decisionCard.stopRule}</b></article>
            </div>

            <section className="globalFiveLens">
              <div className="globalSectionHead">
                <span>5-LENS DUE DILIGENCE</span>
                <h3>Do not rate the startup. Verify the relationship you are about to enter.</h3>
              </div>
              <div className="globalLensGrid">
                {result.analysis.startupDiligence.map((x, i) => (
                  <article key={x.dimension}>
                    <div className="globalLensTop"><i>{String(i + 1).padStart(2,'0')}</i><b>{DIMENSION[x.dimension]}</b><span>{STATUS[x.status]}</span></div>
                    <p>{x.signal}</p>
                    <small>MISSING EVIDENCE</small>
                    <strong>{x.missingEvidence}</strong>
                    <div className="globalQuestion">
                      <small>QUESTION TO ASK · {ASK_WHO[x.askWho]}</small>
                      <p>{x.questionToAsk}</p>
                      <button onClick={() => copyQuestion(x.questionToAsk)}>Copy</button>
                    </div>
                    <label className="globalEvidenceNote">
                      <span>What did you actually learn?</span>
                      <div className="globalResponseSignal">
                        {[
                          ['not_asked', 'Not asked'],
                          ['concrete', 'Concrete'],
                          ['vague', 'Vague'],
                          ['declined', 'Declined'],
                        ].map(([value, label]) => (
                          <button
                            key={value}
                            className={(responseSignals[x.dimension] ?? 'not_asked') === value ? 'active' : ''}
                            onClick={() => setResponseSignals({ ...responseSignals, [x.dimension]: value as GlobalResponseSignal })}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <textarea
                        maxLength={300}
                        value={evidenceNotes[x.dimension] ?? ''}
                        onChange={(e) => setEvidenceNotes({ ...evidenceNotes, [x.dimension]: e.target.value })}
                        placeholder="Anonymized note: specific milestone shared / answer remained vague / authority narrower than expected."
                      />
                    </label>
                  </article>
                ))}
              </div>
              <div className="globalEvidenceLoop">
                <div><strong>{evidenceCount}</strong><span>/ 5 with concrete answers</span></div>
                <p>Response friction: {frictionCount}. Vague or declined answers are signals to investigate, not proof that the company is bad.</p>
                <button onClick={reanalyze} disabled={!evidenceCount || loading}>Re-diligence with new evidence →</button>
              </div>
            </section>

            {result.analysis.sourceAudit.present && (
              <section className="globalAudit">
                <div className="globalSectionHead"><span>SOURCE AUDIT</span><h3>What the document promises — and what reality still needs to prove.</h3></div>
                <div className="globalAuditGrid">
                  {result.analysis.sourceAudit.claims.map((x, i) => (
                    <article key={i}>
                      <div><b>{DIMENSION[x.dimension]}</b><span>{CLASSIFICATION[x.classification]}</span></div>
                      <p>{x.claim}</p>
                      <small>VERIFY IN REALITY</small>
                      <strong>{x.verificationQuestion}</strong>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <section className="globalReality">
              <div className="globalSectionHead"><span>REALITY CHECK</span><h3>Ask for the part of the story that is hardest to market.</h3></div>
              <div>
                <article><span>NEGATIVE PREVIEW</span><p>{result.analysis.realityCheck.negativePreview}</p></article>
                <article><span>ALTERNATIVE QUALITY</span><p>{result.analysis.realityCheck.alternativeQuality}</p></article>
                <article><span>PROMISE GAP</span><p>{result.analysis.realityCheck.promiseGap}</p></article>
              </div>
            </section>

            <GlobalPublicEvidence
              region={context.region}
              role={context.role}
              company={publicCompany}
              website={publicWebsite}
              result={publicResearch}
              loading={publicLoading}
              error={publicError}
              setCompany={setPublicCompany}
              setWebsite={setPublicWebsite}
              onSearch={researchPublicEvidence}
              onApply={() => analyze(question, [], publicEvidencePayload())}
            />

            <section className="globalFlipSection">
              <div className="globalSectionHead"><span>FLIP CONDITIONS</span><h3>Decide what evidence would make you change your mind — before you see it.</h3></div>
              <div>{result.analysis.flipConditions.map((x, i) => <p key={i}><b>{String(i + 1).padStart(2,'0')}</b>{x}</p>)}</div>
            </section>

            <section className="globalSprint">
              <div className="globalSectionHead"><span>VERIFICATION SPRINT</span><h3>Move from AI output to real-world evidence.</h3></div>
              <div className="globalSprintGrid">
                {result.analysis.verificationSprint.map((x, i) => (
                  <article key={x.horizon}><span>{String(i + 1).padStart(2,'0')} · {HORIZON[x.horizon]}</span><p>{x.action}</p><small>DONE WHEN</small><b>{x.evidence}</b></article>
                ))}
              </div>
            </section>

            <section className="globalDecisionCard">
              <span>DECISION DUE DILIGENCE CARD</span>
              <h3>{result.analysis.decisionCard.oneSentence}</h3>
              <div><article><small>NEXT CHECK</small><p>{result.analysis.decisionCard.nextCheck}</p></article><article><small>STOP RULE</small><p>{result.analysis.decisionCard.stopRule}</p></article></div>
              <p className="globalRisk">{result.analysis.riskNotice}</p>
              <button onClick={savePassport}>{saved ? 'Saved on this device ✓' : 'Save 7-day Decision Passport on this device'}</button>
            </section>
          </div>
        </section>
      )}

      <section className="globalPricing" id="pricing">
        <p className="eyebrow">GLOBAL COMMERCIAL MODEL</p>
        <h2>Pay for a high-stakes decision.<br />Not another monthly AI subscription.</h2>
        <div className="globalLaunchBanner"><span>LAUNCH ACCESS</span><b>Full Deep Diligence is currently open while we validate the global workflow.</b><small>Commercial pricing shown below is the planned founding offer.</small></div>
        <div className="globalPricingGrid">
          <article><span>FREE</span><h3>Decision Check</h3><strong>$0</strong><p>5-Lens structure, first verification questions, and flip conditions.</p><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Start free →</button></article>
          <article className="globalFeaturedPlan"><span>ONE DECISION · 7 DAYS</span><h3>Deep Diligence Pass</h3><strong>$19 <small>founding price</small></strong><p>Source Audit, public evidence research, Evidence Loop, verification sprint, and Decision Passport. Local taxes and any required taxes/fees vary by market.</p><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Use Launch Access →</button></article>
          <article><span>B2B2C</span><h3>Sponsored Access</h3><strong>Pilot</strong><p>For recruiting platforms, accelerators, VC portfolios, and career communities. Sponsors never see individual decision content.</p><a href="https://github.com/Maiven/tetrisai/issues/new?title=Partnership%20inquiry" target="_blank" rel="noreferrer">Partnership inquiry →</a></article>
        </div>
      </section>

      <section className="globalTrust">
        <p className="eyebrow">GLOBAL TRUST PRINCIPLE</p>
        <h2>Your career decision is not your employer's dataset.</h2>
        <p>Personal decision content is not designed for employer surveillance. Region-specific equity, tax, employment, and securities questions are treated as items to verify with official documents and qualified local professionals — not as facts the model can safely invent.</p>
        <div><a href="/en/privacy">Privacy principles</a><a href="/en/terms">Terms</a><a href="/en/methodology">Research & methodology</a><a href="/api/ontology">Ontology JSON-LD</a><a href="/">한국어</a></div>
      </section>

      <footer className="globalFooter">
        <b>Bandaepyeon</b><span>Decision Due Diligence for startup careers.</span><small>Built for evidence, not AI certainty.</small>
      </footer>

      {loading && (
        <div className="loading" role="status">
          <div className="loadingCard">
            <div className="loadingMark"><span /><span /></div>
            <p className="loadingEyebrow">DUE DILIGENCE IN PROGRESS</p>
            <h3>Finding what still needs to be proven.</h3>
            <div className="loadingTrack"><i /></div>
            <div className="loadingSteps"><span className="active">Context</span><span>5-Lens</span><span>Counter-case</span><span>Next action</span></div>
            <small>No recommendation score. Unknowns stay unknown until evidence closes them.</small>
          </div>
        </div>
      )}
    </main>
  );
}

function GlobalDecisionGap({
  items,
  onCopyPack,
  onCopyRequest,
}: {
  items: DiligenceItem[];
  onCopyPack: (items: DiligenceItem[]) => void;
  onCopyRequest: (items: DiligenceItem[]) => void;
}) {
  const rank: Record<DiligenceItem['status'], number> = { '검증 우선': 0, '정보 부족': 1, '주의': 2, '확인됨': 3 };
  const top = [...items].sort((a, b) => rank[a.status] - rank[b.status]).slice(0, 3);
  const unresolved = items.filter((x) => x.status !== '확인됨').length;

  return (
    <article className="decisionGap globalDecisionGap">
      <div className="decisionGapLead">
        <p className="panelLabel">DECISION GAP · BEFORE YOU SAY YES</p>
        <h3>{unresolved > 0 ? `You are still carrying ${unresolved} unverified areas into this decision.` : 'All five core lenses have direct evidence.'}</h3>
        <p>Start with these three questions. A <b>specific answer</b> is more useful than a reassuring one.</p>
      </div>
      <div className="decisionGapQuestions">
        {top.map((x, i) => (
          <div key={x.dimension}>
            <span>{String(i + 1).padStart(2, '0')} · {DIMENSION[x.dimension]}</span>
            <small className="askWho">Ask · {ASK_WHO[x.askWho]}</small>
            <p>{x.questionToAsk}</p>
          </div>
        ))}
      </div>
      <div className="decisionGapActions">
        <button onClick={() => onCopyPack(items)}>Copy 3 questions</button>
        <button className="primary" onClick={() => onCopyRequest(items)}>Copy a recruiter-ready diligence request →</button>
      </div>
    </article>
  );
}

function GlobalSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label><span>{label}</span><select value={value} onChange={(e) => onChange(e.target.value)}>{options.map((x) => <option key={x}>{x}</option>)}</select></label>;
}

function GlobalPublicEvidence({
  region, role, company, website, result, loading, error, setCompany, setWebsite, onSearch, onApply,
}: {
  region: string; role: string; company: string; website: string; result: PublicResearch | null; loading: boolean; error: string;
  setCompany: (v: string) => void; setWebsite: (v: string) => void; onSearch: () => void; onApply: () => void;
}) {
  return (
    <section className="globalPublic">
      <div className="globalSectionHead"><span>PUBLIC EVIDENCE AGENT</span><h3>Research what the public record can — and cannot — tell you.</h3></div>
      <div className="globalPublicForm">
        <label><span>Company</span><input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Publicly searchable company name" /></label>
        <label><span>Official site / careers page · optional</span><input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." /></label>
        <button onClick={onSearch} disabled={loading}>{loading ? 'Researching…' : 'Research public evidence →'}</button>
      </div>
      <small className="globalPublicHint">Context: {region === 'Not specified' ? 'region not specified' : region} · {role === 'Not specified' ? 'role not specified' : role}. Never paste confidential financials, customer data, or private contracts.</small>
      {error && <p className="globalError">{error}</p>}
      {result && (
        <div className="globalPublicResult">
          <div className="globalPublicOverview"><p>{result.research.overview}</p><small>{result.research.freshnessNote}</small></div>
          <div className="globalPublicSignals">
            {result.research.signals.map((x, i) => <article key={i}><div><b>{DIMENSION[x.dimension]}</b><span>{PUBLIC_LEVEL[x.evidenceLevel]}</span></div><p>{x.finding}</p><small>Why it matters · {x.implication}</small><small>Caution · {x.caution}</small></article>)}
          </div>
          <div className="globalSources">{result.sources.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a>)}</div>
          <button className="globalApplyEvidence" onClick={onApply}>Apply public signals and re-diligence →</button>
        </div>
      )}
    </section>
  );
}
