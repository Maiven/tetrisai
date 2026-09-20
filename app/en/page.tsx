'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { decodeDiligencePayload, encodeDiligencePayload, type DiligenceResponsePayload } from '../../lib/diligence-share';

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
  axAudit: {
    exposureMode: '증강 중심' | '자동화 중심' | '혼합' | '정보 부족';
    exposureNote: string;
    delegationLevel: 'NON_AX' | 'LEVEL 1 정보 처리 위임' | 'LEVEL 2 업무 수행 위임' | 'LEVEL 3 목표 기반 계획·수행 위임' | '정보 부족';
    delegationNote: string;
    items: {
      area: '업무 재설계' | '조직 준비도' | '인간 판단·권한' | '역량 궤적' | '품질·책임';
      status: '확인됨' | '주의' | '정보 부족' | '검증 우선';
      signal: string;
      missingEvidence: string;
      questionToAsk: string;
      askWho: '채용담당자' | '직속리더' | '현직자' | '공식문서/전문가';
    }[];
    readinessFit: {
      state: '정렬 가능' | '개인 우위·조직 지연 가능' | '조직 우위·개인 적응 필요' | '양쪽 초기' | '정보 부족';
      note: string;
      verify: string;
    };
    twelveMonthScenario: { moreHuman: string; moreAI: string; watchFor: string };
    axRule: string;
  };
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

type GlobalResponseSignal = 'not_asked' | 'concrete' | 'vague' | 'declined' | 'link_pending';

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
  aiChange: string;
  personalAI: string;
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

const OFFICIAL_GUIDES: Record<string, { title: string; note: string; links: { label: string; url: string }[] }> = {
  'United States': {
    title: 'U.S. equity & role verification',
    note: 'Rule 701 may affect disclosures for private-company compensatory securities. Verify whether it applies to your grant and use official plan documents.',
    links: [
      { label: 'SEC · Rule 701', url: 'https://www.sec.gov/resources-small-businesses/exempt-offerings/employee-benefit-plans-rule-701-0' },
      { label: 'U.S. Department of Labor · O*NET', url: 'https://www.dol.gov/agencies/eta/onet' },
    ],
  },
  'United Kingdom': {
    title: 'UK equity verification',
    note: 'If the offer references EMI, verify the actual scheme and current HMRC rules rather than importing U.S. option assumptions.',
    links: [
      { label: 'HMRC · Enterprise Management Incentives', url: 'https://www.gov.uk/tax-employee-share-schemes/enterprise-management-incentives-emis' },
    ],
  },
  'European Union': {
    title: 'EU pay-transparency verification',
    note: 'EU rules create pre-employment pay-transparency rights, but national implementation details still matter. Verify the law in the country where you are applying.',
    links: [
      { label: 'EUR-Lex · Directive (EU) 2023/970', url: 'https://eur-lex.europa.eu/eli/dir/2023/970/oj/eng' },
      { label: 'European Commission · 2026 explainer', url: 'https://commission.europa.eu/news-and-media/news/new-eu-rules-pay-transparency-explained-2026-06-05_en' },
    ],
  },
  'Korea': {
    title: 'Korea venture-equity verification',
    note: 'Korean venture-company stock options have statutory rules, while the economic meaning of your own grant still depends on the company plan and grant terms.',
    links: [
      { label: 'Korea Law · Venture Business Act, Article 16-3', url: 'https://www.law.go.kr/lsInfoP.do?lsiSeq=271307' },
      { label: 'MSS · Venture company survey', url: 'https://www.mss.go.kr/site/smba/ex/bbs/View.do?bcIdx=1064346&cbIdx=86' },
    ],
  },
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
  {
    label: 'AI is changing the role',
    meta: 'AX',
    question: 'The company describes itself as AI-first and says agents are changing how the team works. Before I join, what should I verify about my real tasks, decision rights, skills, quality standards, and accountability?',
  },
];

const defaultContext: Context = {
  decisionType: 'Not specified',
  stage: 'Not specified',
  role: 'Not specified',
  headcount: 'Not specified',
  initialLean: 'Not sure yet',
  region: 'Not specified',
  aiChange: 'Not specified',
  personalAI: 'Not specified',
};

export default function GlobalPage() {
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState<Context>(defaultContext);
  const [sourceExcerpt, setSourceExcerpt] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [previousResult, setPreviousResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState<Record<string, string>>({});
  const [importedResponseCount, setImportedResponseCount] = useState(0);
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
  const pendingResponseCount = useMemo(
    () => Object.values(responseSignals).filter((x) => x === 'link_pending').length,
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
        if (typeof data.sourceExcerpt === 'string') setSourceExcerpt(data.sourceExcerpt);
        setSaved(true);
      }
    } catch {
      // local-only persistence is optional
    }
  }, []);

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('response');
    if (!token) return;
    const decoded = decodeDiligencePayload(token);
    if (!decoded || decoded.type !== 'response' || decoded.returnPath !== '/en') return;

    const roleLabel: Record<DiligenceResponsePayload['responderRole'], string> = {
      recruiter: 'Recruiter / People',
      hiring_manager: 'Hiring manager',
      current_employee: 'Current employee',
      other: 'Other responder',
    };

    const notes: Record<string, string> = {};
    const signals: Record<string, GlobalResponseSignal> = {};
    decoded.answers.forEach((answer) => {
      const statusLabel =
        answer.status === 'concrete' ? 'marked concrete by responder' :
        answer.status === 'vague' ? 'marked partial/vague by responder' :
        'marked unavailable/declined by responder';
      notes[answer.dimension] = `[${roleLabel[decoded.responderRole]} · ${statusLabel}] ${answer.answer || 'No additional text'}`;
      signals[answer.dimension] = 'link_pending';
    });

    setEvidenceNotes((prev) => ({ ...prev, ...notes }));
    setResponseSignals((prev) => ({ ...prev, ...signals }));
    setImportedResponseCount(decoded.answers.length);

    const cleanUrl = new URL(window.location.href);
    window.history.replaceState({}, '', `${cleanUrl.pathname}${cleanUrl.search}`);
  }, []);

  function contextPayload() {
    return {
      decisionType: context.decisionType === 'Not specified' ? '' : context.decisionType,
      stage: context.stage === 'Not specified' ? '' : context.stage,
      role: context.role === 'Not specified' ? '' : context.role,
      headcount: context.headcount === 'Not specified' ? '' : context.headcount,
      initialLean: context.initialLean,
      region: context.region === 'Not specified' ? '' : context.region,
      aiChange: context.aiChange === 'Not specified' ? '' : context.aiChange,
      personalAI: context.personalAI === 'Not specified' ? '' : context.personalAI,
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
      const isReDiligence = verifiedEvidence.length > 0 || publicEvidence.length > 0 || transparencySignals.length > 0;
      setPreviousResult(isReDiligence && result ? result : null);
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
      .filter(([, signal]) => signal === 'vague' || signal === 'declined' || signal === 'link_pending')
      .map(([dimension, signal]) => {
        const label =
          signal === 'vague' ? 'vague answer' :
          signal === 'declined' ? 'answer declined' :
          'external response link received; responder identity and answer quality not yet confirmed';
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
        sourceExcerpt,
        savedAt: new Date().toISOString(),
        revisitAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        reviewAt30: new Date(Date.now() + 30 * 86400000).toISOString(),
        reviewAt90: new Date(Date.now() + 90 * 86400000).toISOString(),
      }));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  async function copyQuestion(text: string) {
    await navigator.clipboard.writeText(text);
  }

  async function copyExpectationMemo(items: DiligenceItem[], audit: Analysis['sourceAudit']) {
    const lines = items.map((x) => {
      const signal = responseSignals[x.dimension] ?? 'not_asked';
      const note = evidenceNotes[x.dimension]?.trim();
      const claims = audit.claims.filter((claim) => claim.dimension === x.dimension).map((claim) => claim.claim);
      const evidence =
        signal === 'concrete' && note
          ? `directly verified: ${note}`
          : claims.length
            ? `documented promise: ${claims.join(' / ')}`
            : signal === 'vague'
              ? `vague answer — follow-up required${note ? ` · ${note}` : ''}`
              : signal === 'declined'
                ? `answer unavailable/declined — verify via another source${note ? ` · ${note}` : ''}`
                : 'unresolved';
      return `- ${DIMENSION[x.dimension]}: ${evidence}`;
    });

    const memo = [
      'Bandaepyeon · Pre-acceptance Expectation Memo',
      '',
      'Before I accept, this is my current understanding of the role and terms. Please correct anything I have misunderstood.',
      '',
      ...lines,
      '',
      'This is not a legal contract. It is a written expectation check to reduce avoidable gaps after joining.',
      'Revisit at 30 and 90 days against actual experience.',
    ].join('\n');

    await navigator.clipboard.writeText(memo);
  }

  async function createDiligenceShareLink(items: DiligenceItem[]) {
    const rank: Record<DiligenceItem['status'], number> = { '검증 우선': 0, '정보 부족': 1, '주의': 2, '확인됨': 3 };
    const top = [...items].sort((a, b) => rank[a.status] - rank[b.status]).slice(0, 3);
    const requestId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now());
    const payload = {
      v: 1 as const,
      type: 'request' as const,
      requestId,
      locale: 'en' as const,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      returnPath: '/en' as const,
      questions: top.map((x) => ({ dimension: x.dimension, question: x.questionToAsk, askWho: ASK_WHO[x.askWho] })),
    };
    savePassport();
    const link = `${window.location.origin}/request#payload=${encodeDiligencePayload(payload)}`;
    await navigator.clipboard.writeText(link);
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

            {importedResponseCount > 0 && (
              <div className="importedResponseBanner globalImportedResponse">
                <div><span>EXTERNAL RESPONSE IMPORTED</span><b>{importedResponseCount} company responses are ready for review.</b><small>The responder identity is not authenticated. Classify each response before promoting it to evidence.</small></div>
                <button onClick={() => document.getElementById('global-decision')?.focus()}>Review responses →</button>
              </div>
            )}

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
                  <GlobalSelect label="AX / AI work change" value={context.aiChange} options={['Not specified','Some AI tools only','Some tasks automated','Agent workflow in production','Role / process redesign underway','Unknown']} onChange={(v) => setContext({ ...context, aiChange: v })} />
                  <GlobalSelect label="My AI work practice" value={context.personalAI} options={['Not specified','Rarely use AI','Use AI as a personal copilot','Automate repeatable work','Design / operate agent workflows','Not sure']} onChange={(v) => setContext({ ...context, personalAI: v })} />
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
              <button onClick={() => { setResult(null); setPreviousResult(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>New decision</button>
            </header>

            <GlobalDecisionGap
              items={result.analysis.startupDiligence}
              onCopyPack={copyQuestionPack}
              onCopyRequest={copyDiligenceRequest}
              onCreateShare={createDiligenceShareLink}
            />

            {previousResult && <GlobalDecisionDelta before={previousResult.analysis} after={result.analysis} />}

            <GlobalEvidenceStandard />

            <GlobalEvidenceRouter />

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
                      {responseSignals[x.dimension] === 'link_pending' && (
                        <p className="pendingExternalResponse">An external link response arrived. The responder is not authenticated; review the text and classify it yourself before treating it as evidence.</p>
                      )}
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
                <p>Concrete: {evidenceCount} · response friction: {frictionCount} · pending link responses: {pendingResponseCount}. Vague, declined, or unauthenticated answers are signals to investigate — not proof the company is bad.</p>
                <button onClick={reanalyze} disabled={(evidenceCount === 0 && frictionCount === 0 && pendingResponseCount === 0) || loading}>Re-diligence with new evidence →</button>
              </div>
            </section>

            <GlobalAXRoleAudit audit={result.analysis.axAudit} onCopyQuestion={copyQuestion} />

            <GlobalExpectationMemo
              items={result.analysis.startupDiligence}
              audit={result.analysis.sourceAudit}
              notes={evidenceNotes}
              responseSignals={responseSignals}
              onCopy={() => copyExpectationMemo(result.analysis.startupDiligence, result.analysis.sourceAudit)}
            />

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

            <OfficialSourceGuide region={context.region} />

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

function GlobalDecisionDelta({ before, after }: { before: Analysis; after: Analysis }) {
  const beforeMap = new Map(before.startupDiligence.map((x) => [x.dimension, x]));
  const changes = after.startupDiligence
    .map((next) => {
      const prev = beforeMap.get(next.dimension);
      if (!prev) return null;
      const statusChanged = prev.status !== next.status;
      const evidenceChanged = prev.missingEvidence !== next.missingEvidence || prev.signal !== next.signal;
      if (!statusChanged && !evidenceChanged) return null;
      return { prev, next, statusChanged };
    })
    .filter(Boolean) as { prev: DiligenceItem; next: DiligenceItem; statusChanged: boolean }[];

  return (
    <article className="decisionDelta globalDecisionDelta">
      <div className="deltaHead">
        <div>
          <p className="panelLabel">DECISION DELTA · WHAT CHANGED</p>
          <h3>See exactly how the decision structure changed after new evidence arrived.</h3>
        </div>
        <span>{changes.length} lenses updated</span>
      </div>
      {changes.length > 0 ? (
        <div className="deltaGrid">
          {changes.map(({ prev, next, statusChanged }) => (
            <div key={next.dimension}>
              <b>{DIMENSION[next.dimension]}</b>
              <div className="deltaStatus">
                <span>{STATUS[prev.status]}</span><i>→</i><span className="after">{STATUS[next.status]}</span>
              </div>
              <p>{statusChanged ? next.signal : next.missingEvidence}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="deltaNoChange">The lens status has not changed yet. That does not mean the new information was useless; the material uncertainty may still be unresolved.</p>
      )}
      {before.realQuestion !== after.realQuestion && (
        <div className="deltaQuestion"><small>REAL QUESTION UPDATED</small><p>{after.realQuestion}</p></div>
      )}
    </article>
  );
}

function GlobalEvidenceRouter() {
  const routes = [
    {
      lens: 'Company viability',
      best: 'Company sources → private-market data → hiring signals',
      links: [
        ['PitchBook', 'https://pitchbook.com/use-cases/due-diligence'],
        ['Crunchbase', 'https://www.crunchbase.com/'],
        ['Wellfound', 'https://wellfound.com/'],
      ],
      note: 'Funding announcements are public signals, not proof of current runway.',
    },
    {
      lens: 'Role & team structure',
      best: 'Hiring manager → org chart → job description',
      links: [
        ['The Org', 'https://theorg.com/for-candidates'],
        ['Wellfound', 'https://wellfound.com/jobs/'],
      ],
      note: 'Verify reporting lines, decision rights, and 90-day outcomes rather than relying on title alone.',
    },
    {
      lens: 'Cash compensation',
      best: 'Offer document → benchmark → human negotiation support',
      links: [
        ['Levels.fyi', 'https://www.levels.fyi/'],
        ['Wellfound Salary Data', 'https://wellfound.com/hiring-data'],
        ['Rora', 'https://www.teamrora.com/'],
      ],
      note: 'Market data is a benchmark, not an automatic fair-value answer for your exact role.',
    },
    {
      lens: 'Equity',
      best: 'Grant/plan docs → regulator → specialist tool or expert',
      links: [
        ['Secfi', 'https://secfi.com/tools/equity-planner'],
        ['Carta', 'https://carta.com/'],
      ],
      note: 'Do not turn option count or hypothetical future valuation into cash-equivalent certainty.',
    },
    {
      lens: 'Culture & leadership',
      best: 'Current-employee examples → org structure → multiple review sources',
      links: [
        ['Glassdoor', 'https://www.glassdoor.com/'],
        ['Blind', 'https://www.teamblind.com/'],
        ['Welcome to the Jungle', 'https://www.welcometothejungle.com/en-GB'],
      ],
      note: 'Anonymous reviews are context signals. Verify role-specific claims with people closer to your actual team.',
    },
  ] as const;

  return (
    <details className="evidenceRouter globalEvidenceRouter">
      <summary>
        <span><b>Where should I verify this?</b><small>Route each unknown to the strongest available source.</small></span>
        <em>Open Evidence Router</em>
      </summary>
      <div className="routerGrid">
        {routes.map((route) => (
          <article key={route.lens}>
            <span>{route.lens}</span>
            <b>{route.best}</b>
            <div>{route.links.map(([label, url]) => <a key={url} href={url} target="_blank" rel="noreferrer">{label} ↗</a>)}</div>
            <small>{route.note}</small>
          </article>
        ))}
      </div>
      <p className="routerNotice">External services are examples of verification starting points, not Bandaepyeon partners. Availability, pricing, and regional access may vary.</p>
    </details>
  );
}

const AX_AREA: Record<Analysis['axAudit']['items'][number]['area'], string> = {
  '업무 재설계': 'Work redesign',
  '조직 준비도': 'Organization readiness',
  '인간 판단·권한': 'Human judgment & agency',
  '역량 궤적': 'Skill trajectory',
  '품질·책임': 'Quality & accountability',
};

const AX_MODE: Record<Analysis['axAudit']['exposureMode'], string> = {
  '증강 중심': 'Augmentation-leaning',
  '자동화 중심': 'Automation-leaning',
  '혼합': 'Mixed',
  '정보 부족': 'Insufficient evidence',
};

const AX_DELEGATION: Record<Analysis['axAudit']['delegationLevel'], string> = {
  'NON_AX': 'NON-AX · no material delegation verified',
  'LEVEL 1 정보 처리 위임': 'L1 · information processing delegated',
  'LEVEL 2 업무 수행 위임': 'L2 · bounded task execution delegated',
  'LEVEL 3 목표 기반 계획·수행 위임': 'L3 · goal-based planning & execution delegated',
  '정보 부족': 'Insufficient evidence',
};

const AX_FIT: Record<Analysis['axAudit']['readinessFit']['state'], string> = {
  '정렬 가능': 'Potentially aligned',
  '개인 우위·조직 지연 가능': 'Individual ahead · organization may lag',
  '조직 우위·개인 적응 필요': 'Organization ahead · individual adaptation needed',
  '양쪽 초기': 'Both still early',
  '정보 부족': 'Insufficient evidence',
};

function GlobalAXRoleAudit({
  audit,
  onCopyQuestion,
}: {
  audit: Analysis['axAudit'];
  onCopyQuestion: (text: string) => void;
}) {
  return (
    <article className="axAudit globalAxAudit">
      <div className="axAuditHead">
        <div>
          <p className="panelLabel">AX ROLE REALITY · AI TRANSFORMATION</p>
          <h3>Do not ask whether the company “uses AI.” Diligence how AI changes your actual work.</h3>
          <p>{audit.exposureNote}</p>
        </div>
        <span className="axMode">{AX_MODE[audit.exposureMode]}</span>
      </div>

      <div className="axDelegation">
        <div><span>DELEGATION DEPTH</span><b>{AX_DELEGATION[audit.delegationLevel]}</b></div>
        <p>{audit.delegationNote}</p>
      </div>

      <div className="axFit">
        <div><span>INDIVIDUAL × ORGANIZATION FIT</span><b>{AX_FIT[audit.readinessFit.state]}</b></div>
        <p>{audit.readinessFit.note}</p>
        <small>{audit.readinessFit.verify}</small>
      </div>

      <div className="axAuditGrid">
        {audit.items.map((item, index) => (
          <section key={item.area}>
            <div className="axCardTop">
              <i>{String(index + 1).padStart(2, '0')}</i>
              <b>{AX_AREA[item.area]}</b>
              <span>{STATUS[item.status]}</span>
            </div>
            <p>{item.signal}</p>
            <div className="axMissing"><small>EVIDENCE NEEDED</small><strong>{item.missingEvidence}</strong></div>
            <div className="axQuestion">
              <small>ASK · {ASK_WHO[item.askWho]}</small>
              <p>{item.questionToAsk}</p>
              <button onClick={() => onCopyQuestion(item.questionToAsk)}>Copy AX question</button>
            </div>
          </section>
        ))}
      </div>

      <div className="axScenario">
        <article><span>MORE HUMAN</span><p>{audit.twelveMonthScenario.moreHuman}</p></article>
        <article><span>MORE AI / AGENT</span><p>{audit.twelveMonthScenario.moreAI}</p></article>
        <article><span>WATCH FOR</span><p>{audit.twelveMonthScenario.watchFor}</p></article>
      </div>

      <div className="axRule">
        <b>AX RULE</b>
        <p>{audit.axRule}</p>
        <small>AI exposure is not a layoff probability. Verify tasks, workflows, decision rights, quality controls, and learning systems.</small>
      </div>
    </article>
  );
}

function GlobalEvidenceStandard() {
  return (
    <details className="evidenceStandard globalEvidenceStandard">
      <summary>
        <span><b>What counts as evidence?</b><small>AI output is not evidence. Provenance matters.</small></span>
        <em>Evidence standard</em>
      </summary>
      <div className="evidenceLadder">
        <div className="tier strong"><span>01</span><b>Official plan / contract / regulator</b><small>Strongest starting point; applicability still matters.</small></div>
        <div className="tier strong"><span>02</span><b>Concrete answer from accountable owner</b><small>Specific criteria, numbers, examples, or documented terms.</small></div>
        <div className="tier"><span>03</span><b>Concrete current-employee example</b><small>Useful for real behavior and decision-rights evidence.</small></div>
        <div className="tier"><span>04</span><b>Verifiable company public source</b><small>Careers page, official release, filing, or company documentation.</small></div>
        <div className="tier weak"><span>05</span><b>Third-party article / anonymous review</b><small>Context signal, not standalone proof.</small></div>
        <div className="tier ai"><span>—</span><b>AI inference</b><small>Never evidence. It only helps structure what to verify.</small></div>
      </div>
    </details>
  );
}

function GlobalExpectationMemo({
  items,
  audit,
  notes,
  responseSignals,
  onCopy,
}: {
  items: DiligenceItem[];
  audit: Analysis['sourceAudit'];
  notes: Record<string, string>;
  responseSignals: Record<string, GlobalResponseSignal>;
  onCopy: () => void;
}) {
  return (
    <article className="expectationMemo globalExpectationMemo">
      <div className="expectationHead">
        <div>
          <p className="panelLabel">EXPECTATION MEMO · BEFORE ACCEPTING</p>
          <h3>Turn offer promises into expectations you can review after joining.</h3>
          <p>Capture what is verified, what is only documented, and what is unresolved. Revisit the memo at day 30 and day 90.</p>
        </div>
        <button onClick={onCopy}>Copy expectation memo →</button>
      </div>
      <div className="expectationRows">
        {items.map((item) => {
          const signal = responseSignals[item.dimension] ?? 'not_asked';
          const note = notes[item.dimension]?.trim();
          const claims = audit.claims.filter((claim) => claim.dimension === item.dimension);
          const state =
            signal === 'concrete'
              ? 'Directly verified'
              : claims.length
                ? 'Documented promise'
                : signal === 'vague' || signal === 'declined'
                  ? 'Follow-up needed'
                  : 'Unresolved';
          const content =
            signal === 'concrete' && note
              ? note
              : claims.length
                ? claims.map((claim) => claim.claim).join(' · ')
                : note || item.missingEvidence;
          return (
            <div key={item.dimension}>
              <span>{DIMENSION[item.dimension]}</span>
              <b>{state}</b>
              <p>{content}</p>
            </div>
          );
        })}
      </div>
      <div className="expectationReview"><span>DAY 30</span><b>Role · manager · decision rights</b><i>→</i><span>DAY 90</span><b>Outcomes · compensation · learning</b></div>
      <small>This is not a legal contract. Official documents and qualified local professionals control regulated questions.</small>
    </article>
  );
}

function OfficialSourceGuide({ region }: { region: string }) {
  const guide = OFFICIAL_GUIDES[region];
  if (!guide) return null;
  return (
    <article className="officialSourceGuide">
      <div>
        <p className="panelLabel">OFFICIAL VERIFICATION STARTING POINTS</p>
        <h3>{guide.title}</h3>
        <p>{guide.note}</p>
      </div>
      <div className="officialLinks">
        {guide.links.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label} ↗</a>)}
      </div>
      <small>Reference links are a starting point, not individualized legal or tax advice. Verify current applicability in your jurisdiction.</small>
    </article>
  );
}

function GlobalDecisionGap({
  items,
  onCopyPack,
  onCopyRequest,
  onCreateShare,
}: {
  items: DiligenceItem[];
  onCopyPack: (items: DiligenceItem[]) => void;
  onCopyRequest: (items: DiligenceItem[]) => void;
  onCreateShare: (items: DiligenceItem[]) => void;
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
      <div className="decisionGapActions shareActions">
        <button onClick={() => onCopyPack(items)}>Copy questions</button>
        <button onClick={() => onCopyRequest(items)}>Copy message</button>
        <button className="primary" onClick={() => onCreateShare(items)}>Create company response link →</button>
      </div>
      <p className="sharePrivacyNote">The share link contains only the selected questions — not your private decision prompt or AI analysis.</p>
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
