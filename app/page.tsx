'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { decodeDiligencePayload, encodeDiligencePayload, type DiligenceResponsePayload } from '../lib/diligence-share';

type Future = { title: string; description: string; upside: string; downside: string };
type Premortem = { step: string; earlySignal: string };
type EvidenceItem = { claim: string; status: '사실' | '가정' | '미확인'; why: string };
type DiligenceItem = {
  dimension: '회사 생존 신호' | '역할의 실제' | '리더·의사결정권' | '현금·지분 보상' | '학습·다음 선택지';
  status: '확인됨' | '주의' | '정보 부족' | '검증 우선';
  signal: string;
  missingEvidence: string;
  questionToAsk: string;
  askWho: '채용담당자' | '직속리더' | '현직자' | '공식문서/전문가';
};
type StartupContext = { decisionType: string; stage: string; role: string; headcount: string; initialLean: string };
type Analysis = {
  reframedDecision: string;
  realQuestion: string;
  assumptions: string[];
  counterarguments: string[];
  blindSpots: string[];
  evidenceLedger: EvidenceItem[];
  startupDiligence: DiligenceItem[];
  realityCheck: { negativePreview: string; alternativeQuality: string; promiseGap: string };
  sourceAudit: {
    present: boolean;
    claims: {
      dimension: DiligenceItem['dimension'];
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
  futures: Future[];
  premortem: Premortem[];
  evidenceToCheck: string[];
  verificationSprint: { horizon: '지금 10분' | '24시간 안' | '7일 안'; action: string; evidence: string }[];
  reversibleExperiment: string;
  decisionRule: string;
  decisionCard: { oneSentence: string; nextCheck: string; stopRule: string };
  riskNotice: string;
};
type OntologyNode = {
  id: string;
  type: 'Decision' | 'Dimension' | 'Claim' | 'Evidence' | 'Unknown' | 'Question' | 'ResponseSignal' | 'FlipCondition' | 'VerificationAction';
  label: string;
  status?: string;
  provenance: 'user_input' | 'user_verified' | 'public_source' | 'user_reported_response' | 'model_structured' | 'system_ontology';
  dimension?: string;
};
type OntologyEdge = {
  source: string;
  relation: 'HAS_DIMENSION' | 'HAS_CLAIM' | 'REQUIRES_EVIDENCE' | 'ASKS' | 'VERIFIED_BY' | 'PUBLICLY_SUPPORTED_BY' | 'RESPONDED_WITH' | 'COULD_FLIP' | 'LEADS_TO_ACTION';
  target: string;
};
type DecisionGraph = { ontologyVersion: string; nodes: OntologyNode[]; edges: OntologyEdge[] };
type ApiResult = {
  mode: 'ai' | 'fallback' | 'sample';
  model: string;
  analysis: Analysis;
  ontologyGraph?: DecisionGraph;
  ontologyValidation?: { valid: boolean; violations: string[] };
  ontologyVersion?: string;
};

type PublicEvidenceResult = {
  research: {
    overview: string;
    signals: {
      dimension: DiligenceItem['dimension'];
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

type ResponseSignal = '아직 안 물음' | '구체적 답변' | '모호한 답변' | '답변 회피' | '링크 응답·확인 필요';

type SavedPassport = {
  id: string;
  question: string;
  context: StartupContext;
  evidenceNotes: Record<string, string>;
  responseSignals: Record<string, ResponseSignal>;
  sourceExcerpt: string;
  savedAt: string;
  revisitAt: string;
  reviewAt30: string;
  reviewAt90: string;
};

const QUICK_STARTS = [
  {
    label: '오퍼를 받았어요',
    meta: 'JOIN',
    question: 'Series A 스타트업 오퍼를 받았는데 연봉과 스톡옵션만 보고 결정해도 될지 고민입니다. 무엇을 확인해야 할까요?',
  },
  {
    label: '회사 상황이 불안해요',
    meta: 'STAY / LEAVE',
    question: '투자 지연과 채용 동결이 반복되고 있습니다. 지금 회사를 계속 다닐지 무엇을 확인하고 판단해야 할까요?',
  },
  {
    label: '역할만 커졌어요',
    meta: 'ROLE',
    question: '리드 역할을 제안받았지만 실제 권한과 보상이 따라오는지 모르겠습니다. 무엇을 확인해야 할까요?',
  },
  {
    label: '스톡옵션이 궁금해요',
    meta: 'EQUITY',
    question: '스타트업 스톡옵션을 제안받았습니다. 옵션 개수 말고 어떤 조건을 확인해야 의사결정을 할 수 있을까요?',
  },
];

const DECISION_TYPES = ['선택 안 함', '스타트업 합류', '잔류 vs 이직', '역할·승진', '보상·스톡옵션', '조직개편·리더변경', '팀·프로젝트 결정'];
const STAGES = ['선택 안 함', 'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', '투자단계 모름/비VC'];
const ROLES = ['선택 안 함', 'Product/PM', 'Data/AI', 'Engineering', 'Design', 'Growth/Marketing', 'BD/Sales', 'Operations/People', 'Founder/Lead', 'Other'];
const HEADCOUNTS = ['선택 안 함', '1~19명', '20~50명', '51~200명', '201명 이상', '모름'];
const INITIAL_LEANS = ['선택 안 함', '실행/합류 쪽', '보류/잔류 쪽', '반대 선택지 쪽', '아직 모름'];

const SAMPLE = '현재 직장은 안정적이지만 성장 속도가 느립니다. 연봉이 15% 높은 Series A 스타트업으로 이직 제안을 받았고 스톡옵션도 있습니다.';
const SAMPLE_CONTEXT: StartupContext = {
  decisionType: '스타트업 합류',
  stage: 'Series A',
  role: 'Data/AI',
  headcount: '51~200명',
  initialLean: '실행/합류 쪽',
};

export default function Home() {
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState<StartupContext>({
    decisionType: '선택 안 함',
    stage: '선택 안 함',
    role: '선택 안 함',
    headcount: '선택 안 함',
    initialLean: '선택 안 함',
  });
  const [result, setResult] = useState<ApiResult | null>(null);
  const [previousResult, setPreviousResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [evidenceNotes, setEvidenceNotes] = useState<Record<string, string>>({});
  const [responseSignals, setResponseSignals] = useState<Record<string, ResponseSignal>>({});
  const [evidenceLoopMessage, setEvidenceLoopMessage] = useState('');
  const [importedResponseCount, setImportedResponseCount] = useState(0);
  const [reflection, setReflection] = useState('');
  const [publicCompany, setPublicCompany] = useState('');
  const [publicWebsite, setPublicWebsite] = useState('');
  const [publicResearch, setPublicResearch] = useState<PublicEvidenceResult | null>(null);
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicError, setPublicError] = useState('');
  const [sourceExcerpt, setSourceExcerpt] = useState('');
  const [passport, setPassport] = useState<SavedPassport | null>(null);
  const [passportMessage, setPassportMessage] = useState('');
  const [resultDepth, setResultDepth] = useState<'essential' | 'full'>('essential');
  const resultsRef = useRef<HTMLElement | null>(null);
  const count = useMemo(() => question.length, [question]);
  const evidenceCount = useMemo(
    () => Object.values(responseSignals).filter((x) => x === '구체적 답변').length,
    [responseSignals],
  );
  const frictionCount = useMemo(
    () => Object.values(responseSignals).filter((x) => x === '모호한 답변' || x === '답변 회피').length,
    [responseSignals],
  );
  const pendingResponseCount = useMemo(
    () => Object.values(responseSignals).filter((x) => x === '링크 응답·확인 필요').length,
    [responseSignals],
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('bandaepyeon:passport');
      if (raw) setPassport(JSON.parse(raw) as SavedPassport);
    } catch {
      // local-only convenience; ignore corrupted storage
    }
  }, []);

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('response');
    if (!token) return;
    const decoded = decodeDiligencePayload(token);
    if (!decoded || decoded.type !== 'response' || decoded.returnPath !== '/') return;

    const roleLabel: Record<DiligenceResponsePayload['responderRole'], string> = {
      recruiter: '채용담당자/People',
      hiring_manager: '직속리더',
      current_employee: '현직자',
      other: '기타 응답자',
    };

    const notes: Record<string, string> = {};
    const signals: Record<string, ResponseSignal> = {};
    decoded.answers.forEach((answer) => {
      const statusLabel =
        answer.status === 'concrete' ? '구체적 답변으로 표시됨' :
        answer.status === 'vague' ? '일부/모호한 답변으로 표시됨' :
        '공유 어려움/답변 불가로 표시됨';
      notes[answer.dimension] = `[${roleLabel[decoded.responderRole]} · ${statusLabel}] ${answer.answer || '추가 내용 없음'}`;
      signals[answer.dimension] = '링크 응답·확인 필요';
    });

    setEvidenceNotes((prev) => ({ ...prev, ...notes }));
    setResponseSignals((prev) => ({ ...prev, ...signals }));
    setImportedResponseCount(decoded.answers.length);
    setEvidenceLoopMessage(`외부 응답 ${decoded.answers.length}개를 가져왔습니다. 링크는 응답자 신원을 인증하지 않으므로 내용을 확인한 뒤 각 Lens의 답변 상태를 직접 분류해주세요.`);

    const cleanUrl = new URL(window.location.href);
    window.history.replaceState({}, '', `${cleanUrl.pathname}${cleanUrl.search}`);
  }, []);

  function publicEvidencePayload(source = publicResearch): string[] {
    if (!source) return [];
    return source.research.signals
      .filter((x) => x.evidenceLevel !== '확인 안 됨')
      .map((x) => `${x.dimension}: ${x.finding} [${x.evidenceLevel}] · 주의: ${x.caution}`);
  }

  async function analyze(
    value?: string,
    sample = false,
    verifiedEvidence: string[] = [],
    publicEvidence: string[] = [],
    transparencySignals: string[] = [],
  ) {
    const q = (value ?? question).trim();
    setError('');
    if (!sample && q.length < 8) {
      setError('조금 더 구체적으로 적어주세요. 8자 이상이면 좋습니다.');
      return;
    }

    const activeContext = sample ? SAMPLE_CONTEXT : context;
    if (sample) setContext(SAMPLE_CONTEXT);
    setQuestion(q || SAMPLE);
    if (verifiedEvidence.length === 0 && publicEvidence.length === 0 && transparencySignals.length === 0) {
      setReflection('');
      setEvidenceNotes({});
      setResponseSignals({});
      setEvidenceLoopMessage('');
    }
    setLoading(true);

    try {
      const normalizedContext = Object.fromEntries(
        Object.entries(activeContext).filter(([, v]) => v && v !== '선택 안 함'),
      );

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q || SAMPLE,
          sample,
          context: normalizedContext,
          verifiedEvidence,
          publicEvidence,
          transparencySignals,
          sourceExcerpt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '분석에 실패했습니다.');
      const isReDiligence = verifiedEvidence.length > 0 || publicEvidence.length > 0 || transparencySignals.length > 0;
      setPreviousResult(isReDiligence && result ? result : null);
      setResult(data);
      setResultDepth('essential');
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

  function updateEvidenceNote(dimension: string, value: string) {
    setEvidenceNotes((prev) => ({ ...prev, [dimension]: value.slice(0, 300) }));
    setEvidenceLoopMessage('');
  }

  function updateResponseSignal(dimension: string, signal: ResponseSignal) {
    setResponseSignals((prev) => ({ ...prev, [dimension]: signal }));
    setEvidenceLoopMessage('');
  }

  async function reanalyzeWithEvidence() {
    const verifiedEvidence = Object.entries(responseSignals)
      .filter(([, signal]) => signal === '구체적 답변')
      .map(([dimension]) => {
        const note = evidenceNotes[dimension]?.trim();
        return `${dimension}: 구체적 답변을 받음${note ? ` · ${note}` : ''}`;
      });

    const transparencySignals = Object.entries(responseSignals)
      .filter(([, signal]) => signal === '모호한 답변' || signal === '답변 회피' || signal === '링크 응답·확인 필요')
      .map(([dimension, signal]) => {
        const note = evidenceNotes[dimension]?.trim();
        const suffix = signal === '링크 응답·확인 필요' ? ' (외부 응답 링크 · 신원/정확성 미확인)' : '';
        return `${dimension}: ${signal}${suffix}${note ? ` · ${note}` : ''}`;
      });

    for (const [dimension, note] of Object.entries(evidenceNotes)) {
      if (!note.trim()) continue;
      if (responseSignals[dimension]) continue;
      transparencySignals.push(`${dimension}: 사용자 메모(검증 수준 미지정) · ${note.trim()}`);
    }

    if (verifiedEvidence.length === 0 && transparencySignals.length === 0) {
      setEvidenceLoopMessage('질문한 뒤 받은 답의 상태를 표시하거나, 익명화한 답변 요지를 적어주세요.');
      return;
    }

    setEvidenceLoopMessage(`구체적 답변 ${verifiedEvidence.length}개와 투명성 신호 ${transparencySignals.length}개를 반영해 다시 실사합니다.`);
    await analyze(question, false, verifiedEvidence, publicEvidencePayload(), transparencySignals);
  }

  async function copyQuestion(text: string) {
    await navigator.clipboard.writeText(text);
    setEvidenceLoopMessage('질문을 복사했습니다. 실제 담당자·리더·현직자에게 확인해보세요.');
  }

  async function copyExpectationMemo(items: DiligenceItem[], audit: Analysis['sourceAudit']) {
    const lines = items.map((x) => {
      const signal = responseSignals[x.dimension] ?? '아직 안 물음';
      const note = evidenceNotes[x.dimension]?.trim();
      const docClaims = audit.claims.filter((claim) => claim.dimension === x.dimension).map((claim) => claim.claim);
      const evidence =
        signal === '구체적 답변' && note
          ? `직접 확인: ${note}`
          : docClaims.length
            ? `문서상 약속: ${docClaims.join(' / ')}`
            : signal === '모호한 답변' || signal === '답변 회피'
              ? `${signal}: 추가 확인 필요${note ? ` · ${note}` : ''}`
              : '미확인';
      return `- ${x.dimension}: ${evidence}`;
    });

    const memo = [
      '반대편 · 합류 전 기대치 확인 메모',
      '',
      '오퍼 수락 전 제가 이해한 역할과 조건을 아래처럼 정리했습니다. 제가 잘못 이해한 부분이 있다면 수정 부탁드립니다.',
      '',
      ...lines,
      '',
      '이 메모는 법적 계약이 아니라, 입사 후 기대치 차이를 줄이기 위한 확인용 기록입니다.',
      '합류 후 30일 / 90일 시점에 실제 경험과 비교해 다시 점검합니다.',
    ].join('\n');

    await navigator.clipboard.writeText(memo);
    setEvidenceLoopMessage('합류 전 기대치 확인 메모를 복사했습니다.');
  }

  async function createDiligenceShareLink(items: DiligenceItem[]) {
    const rank: Record<DiligenceItem['status'], number> = { '검증 우선': 0, '정보 부족': 1, '주의': 2, '확인됨': 3 };
    const priority = [...items].sort((a, b) => rank[a.status] - rank[b.status]).slice(0, 3);
    const requestId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now());
    const payload = {
      v: 1 as const,
      type: 'request' as const,
      requestId,
      locale: 'ko' as const,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      returnPath: '/' as const,
      questions: priority.map((x) => ({ dimension: x.dimension, question: x.questionToAsk, askWho: x.askWho })),
    };
    savePassport();
    const link = `${window.location.origin}/request#payload=${encodeDiligencePayload(payload)}`;
    await navigator.clipboard.writeText(link);
    setEvidenceLoopMessage('회사에 보낼 실사 링크를 복사했습니다. 링크에는 질문 3개만 포함되고, 개인 고민·AI 분석은 포함되지 않습니다.');
  }

  async function copyDiligenceRequest(items: DiligenceItem[]) {
    const rank: Record<DiligenceItem['status'], number> = { '검증 우선': 0, '정보 부족': 1, '주의': 2, '확인됨': 3 };
    const priority = [...items].sort((a, b) => rank[a.status] - rank[b.status]).slice(0, 3);
    const request = [
      '안녕하세요. 오퍼(또는 역할)를 검토하면서 입사 후 기대치와 조건을 정확히 이해하고 싶어 몇 가지 확인드립니다.',
      '',
      ...priority.map((x, i) => `${i + 1}. ${x.questionToAsk}`),
      '',
      '민감한 내부정보를 요청드리려는 목적은 아니며, 공개·공유 가능한 범위에서 구체적인 기준이나 사례를 알려주시면 결정에 큰 도움이 될 것 같습니다.',
      '감사합니다.',
    ].join('\n');
    await navigator.clipboard.writeText(request);
    setEvidenceLoopMessage('채용담당자·리더에게 보낼 수 있는 실사 요청문을 복사했습니다.');
  }

  async function copyQuestionPack(items: DiligenceItem[]) {
    const priority = [...items]
      .sort((a, b) => {
        const rank: Record<DiligenceItem['status'], number> = { '검증 우선': 0, '정보 부족': 1, '주의': 2, '확인됨': 3 };
        return rank[a.status] - rank[b.status];
      })
      .slice(0, 3);
    const pack = [
      '반대편 · 오늘 확인할 질문 3개',
      '',
      ...priority.map((x, i) => `${i + 1}. [${x.dimension}] ${x.questionToAsk}`),
      '',
      '결론을 먼저 정하지 말고, 답을 받은 뒤 다시 판단하세요.',
    ].join('\n');
    await navigator.clipboard.writeText(pack);
    setEvidenceLoopMessage('오늘 확인할 질문 3개를 한 번에 복사했습니다.');
  }

  async function researchPublicEvidence() {
    setPublicError('');
    if (publicCompany.trim().length < 2) {
      setPublicError('공개 검색할 회사명을 입력해주세요.');
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
          role: context.role !== '선택 안 함' ? context.role : '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '공개 자료 검색에 실패했습니다.');
      setPublicResearch(data);
    } catch (e) {
      setPublicError(e instanceof Error ? e.message : '공개 자료 검색을 완료하지 못했습니다.');
    } finally {
      setPublicLoading(false);
    }
  }

  async function applyPublicEvidence() {
    const evidence = publicEvidencePayload();
    if (evidence.length === 0) {
      setPublicError('재실사에 반영할 공개 신호가 아직 없습니다.');
      return;
    }
    await analyze(question, false, [], evidence);
  }

  function savePassport() {
    const saved: SavedPassport = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()),
      question,
      context,
      evidenceNotes,
      responseSignals,
      sourceExcerpt,
      savedAt: new Date().toISOString(),
      revisitAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      reviewAt30: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reviewAt90: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    };
    try {
      window.localStorage.setItem('bandaepyeon:passport', JSON.stringify(saved));
      setPassport(saved);
      setPassportMessage('이 결정은 서버가 아니라 이 브라우저에만 저장했습니다. 7일 안에 다시 열어 증거를 이어서 확인하세요.');
    } catch {
      setPassportMessage('브라우저 저장을 사용할 수 없습니다.');
    }
  }

  function restorePassport() {
    if (!passport) return;
    setQuestion(passport.question);
    setContext(passport.context);
    setEvidenceNotes(passport.evidenceNotes || {});
    setResponseSignals(passport.responseSignals || {});
    setSourceExcerpt(passport.sourceExcerpt || '');
    setPassportMessage('저장한 결정을 불러왔습니다. 새 증거를 추가하거나 다시 실사하세요.');
    document.getElementById('decision-input')?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deletePassport() {
    window.localStorage.removeItem('bandaepyeon:passport');
    setPassport(null);
    setPassportMessage('이 기기에 저장한 결정을 삭제했습니다.');
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
      'Reality Check',
      `- 부정적 현실: ${a.realityCheck.negativePreview}`,
      `- 대안의 질: ${a.realityCheck.alternativeQuality}`,
      `- 약속-현실 차이: ${a.realityCheck.promiseGap}`,
      '',
      '결론을 뒤집을 조건',
      ...a.flipConditions.map((x, i) => `${i + 1}. ${x}`),
      '',
      '검증 스프린트',
      ...a.verificationSprint.map((x) => `${x.horizon}: ${x.action} / 확보할 증거: ${x.evidence}`),
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
            <a href="#pricing">가격</a>
            <a href="/en" aria-label="English version">EN</a>
            <button onClick={() => document.getElementById('decision-input')?.focus()}>내 결정 실사하기 ↗</button>
          </div>
        </nav>

        <div className="heroGrid">
          <div className="copy">
            <p className="eyebrow">STARTUP OFFER & CAREER DUE DILIGENCE</p>
            <h1>스타트업 오퍼 받았나요?<br /><em>수락하기 전에, 아직 확인하지 못한 것을 찾으세요.</em></h1>
            <p className="lead">연봉과 스톡옵션만 비교하면 가장 비싼 정보가 빠질 수 있습니다. 반대편은 <b>회사·실제 역할·리더·보상·학습</b>에서 무엇이 아직 증명되지 않았는지 찾고, 오늘 바로 물어볼 질문으로 바꿉니다.</p>

            <div className="heroOutcomeStrip">
              <div><span>01</span><b>오늘 물어볼 질문 3개</b><small>채용담당자·직속리더·현직자에게 바로 사용</small></div>
              <div><span>02</span><b>생각을 뒤집을 조건</b><small>무엇이 확인되면 결론을 바꿀지 미리 정의</small></div>
              <div><span>03</span><b>7일 검증 플랜</b><small>AI 조언이 아니라 실제 증거까지 연결</small></div>
            </div>

            {passport && (
              <div className="passportResume">
                <div>
                  <span>LOCAL DECISION PASSPORT</span>
                  <b>{passport.question}</b>
                  <small>7일 실사 · {new Date(passport.revisitAt).toLocaleDateString('ko-KR')} · 30일 리뷰 · {passport.reviewAt30 ? new Date(passport.reviewAt30).toLocaleDateString('ko-KR') : '미설정'}</small>
                </div>
                <button onClick={restorePassport}>이어 실사 →</button>
                <button className="passportDelete" onClick={deletePassport}>삭제</button>
              </div>
            )}
            {passportMessage && <p className="passportMessage">{passportMessage}</p>}
            {importedResponseCount > 0 && (
              <div className="importedResponseBanner">
                <div><span>EXTERNAL RESPONSE IMPORTED</span><b>회사 측 응답 {importedResponseCount}개를 가져왔습니다.</b><small>응답자 신원은 인증되지 않았습니다. 내용을 확인하고 증거 수준을 직접 분류하세요.</small></div>
                <button onClick={() => passport ? restorePassport() : document.getElementById('decision-input')?.focus()}>응답 검토하기 →</button>
              </div>
            )}

            <div className="activationRail" aria-label="반대편 이용 순서">
              <div><i>1</i><span><b>고민 한 문장</b><small>회사명 없이 익명으로</small></span></div>
              <em>→</em>
              <div><i>2</i><span><b>AI 실사</b><small>모르는 것을 질문으로</small></span></div>
              <em>→</em>
              <div><i>3</i><span><b>실제 확인</b><small>새 증거로 다시 분석</small></span></div>
            </div>

            <form className="decisionBox" onSubmit={submit}>
              <label htmlFor="decision-input">오퍼를 받았다면 그대로 적어보세요. 잔류·역할·스톡옵션 고민도 가능합니다.</label>
              <textarea
                id="decision-input"
                maxLength={700}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    analyze();
                  }
                }}
                placeholder="예: Series A 스타트업에서 연봉 15% 인상과 스톡옵션을 제안받았습니다. 수락 전에 무엇을 꼭 확인해야 할까요?"
              />

              <details className="contextDisclosure">
                <summary>
                  <span><b>선택사항</b> · 스타트업 상황 더 알려주기</span>
                  <small>회사 단계·직무·현재 기울기를 추가하면 질문이 더 구체적입니다.</small>
                </summary>
                <div className="contextBox">
                  <div className="contextGrid">
                    <ContextSelect label="결정 유형" value={context.decisionType} options={DECISION_TYPES} onChange={(v) => updateContext('decisionType', v)} />
                    <ContextSelect label="회사 단계" value={context.stage} options={STAGES} onChange={(v) => updateContext('stage', v)} />
                    <ContextSelect label="내 직무" value={context.role} options={ROLES} onChange={(v) => updateContext('role', v)} />
                    <ContextSelect label="회사 규모" value={context.headcount} options={HEADCOUNTS} onChange={(v) => updateContext('headcount', v)} />
                    <ContextSelect label="분석 전 내 기울기" value={context.initialLean} options={INITIAL_LEANS} onChange={(v) => updateContext('initialLean', v)} />
                  </div>
                  <p className="contextHint">초기 기울기는 AI가 맞춰줘야 할 답이 아니라, 반증할 <b>가설</b>로만 사용합니다.</p>
                  <label className="sourceExcerptInput">
                    <span>공개 채용공고 / 익명화한 오퍼·역할 요약 · 선택</span>
                    <textarea
                      maxLength={4000}
                      value={sourceExcerpt}
                      onChange={(e) => setSourceExcerpt(e.target.value)}
                      placeholder="회사명·실명·고객정보·비공개 재무수치·계약 원문을 제거한 뒤, 역할/권한/보상/성장에 관한 문구만 붙여넣으세요."
                    />
                    <small>{sourceExcerpt.length}/4000 · 문서 문구는 ‘현실의 사실’이 아니라 검증할 약속으로 취급합니다.</small>
                  </label>
                </div>
              </details>

              <div className="decisionActions">
                <span>{count}/700 · 회사명·실명·연락처·비공개 숫자 등 민감정보는 입력하지 마세요.</span>
                <button type="submit" disabled={loading}>{loading ? '실사 중…' : '수락하기 전 실사하기 →'}</button>
              </div>
              {error && <p className="error">{error}</p>}
            </form>

            <div className="quickStart">
              <div className="quickStartHead"><b>입력하기 어렵다면, 지금 상황부터 고르세요.</b><span>1-click quick start</span></div>
              <div className="quickStartGrid">
                {QUICK_STARTS.map((x) => (
                  <button key={x.meta} onClick={() => analyze(x.question)}>
                    <small>{x.meta}</small><strong>{x.label}</strong><span>바로 실사 →</span>
                  </button>
                ))}
              </div>
              <button className="instantStart" onClick={() => analyze(SAMPLE, true)}>▶ 입력 없이 바로 체험하기</button>
            </div>
          </div>

          <div className="productPreview" aria-label="반대편 실제 결과 화면 미리보기">
            <div className="previewTop">
              <span>LIVE PRODUCT PREVIEW</span>
              <i>로그인 없음</i>
            </div>
            <div className="previewDecision">
              <small>예시 결정</small>
              <b>Series A 스타트업 오퍼, 정말 좋은 선택일까?</b>
            </div>
            <div className="previewLenses">
              {[
                ['회사 생존 신호', '검증 우선'],
                ['역할의 실제', '정보 부족'],
                ['리더·의사결정권', '정보 부족'],
                ['현금·지분 보상', '검증 우선'],
                ['학습·다음 선택지', '주의'],
              ].map(([label, status]) => (
                <div key={label}><span>{label}</span><strong className={`previewStatus preview-${status.replace(' ', '-')}`}>{status}</strong></div>
              ))}
            </div>
            <div className="previewFlip">
              <span>FLIP CONDITION</span>
              <p>런웨이·실제 권한·옵션 조건이 확인되지 않으면 “성장을 위해 가야 한다”는 결론을 다시 봅니다.</p>
            </div>
            <div className="previewSprint">
              <div><b>10분</b><span>질문 3개 선택</span></div>
              <i>→</i>
              <div><b>24시간</b><span>실제 답변 확보</span></div>
              <i>→</i>
              <div><b>7일</b><span>새 증거로 재실사</span></div>
            </div>
            <button onClick={() => analyze(SAMPLE, true)}>같은 흐름으로 바로 시작하기 →</button>
            <p className="previewLimit"><b>AI 한계 공개:</b> 반대편은 비공개 런웨이·리더 행동·지분 미래가치를 알 수 없습니다. 모르는 것은 점수로 꾸미지 않고 질문으로 돌려줍니다.</p>
          </div>
        </div>

        <div className="trustline">
          <span>◉ 로그인·회원가입 없이 바로 체험</span>
          <span>◐ 직원 편의 5-Lens Due Diligence</span>
          <span>◎ 10분→24시간→7일 실제 검증 행동으로 연결</span>
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

      <section className="valueLoop section">
        <p className="eyebrow">REAL PROBLEM → REAL ACTION</p>
        <h2>좋은 조언을 만드는 것이 아니라,<br />정보 비대칭을 실제 행동으로 줄입니다.</h2>
        <div className="valueLoopGrid">
          <article>
            <span>BEFORE</span>
            <h3>“연봉이 더 높은데 갈까?”</h3>
            <p>막연한 기대, 회사가 제공한 정보, 내 불안이 한 문장 안에 섞여 있습니다.</p>
          </article>
          <div className="valueArrow">→</div>
          <article className="valueCore">
            <span>반대편</span>
            <h3>5-Lens + Falsification</h3>
            <p>회사·역할·리더·보상·학습을 분리하고, 사실·가정·미확인과 Flip Condition을 구조화합니다.</p>
          </article>
          <div className="valueArrow">→</div>
          <article>
            <span>AFTER</span>
            <h3>“내일 이 3가지를 확인한다.”</h3>
            <p>누구에게 무엇을 물을지, 어떤 답이면 생각을 바꿀지, 언제 멈출지가 남습니다.</p>
          </article>
        </div>
        <div className="valueMetrics">
          <div><strong>1</strong><span>막연한 고민</span><i>→</i><b>검증 가능한 결정</b></div>
          <div><strong>5</strong><span>스타트업 실사 렌즈</span><i>→</i><b>정보 누락 위치 확인</b></div>
          <div><strong>7일</strong><span>검증 스프린트</span><i>→</i><b>실제 증거 확보 행동</b></div>
        </div>
        <p className="valueCaveat">※ “의사결정 정확도가 몇 % 향상된다”는 검증되지 않은 효과를 주장하지 않습니다. 현재 MVP가 직접 만드는 가치는 <b>미확인 정보의 가시화, 질문 생성, 실제 확인 행동의 구조화</b>입니다.</p>
      </section>

      <section className="categoryThesis section">
        <p className="eyebrow">NEW VALUE · CANDIDATE DILIGENCE PROTOCOL</p>
        <h2>정보를 더 보여주는 서비스가 아니라,<br />후보자와 회사 사이의 <em>증거 교환 방식</em>을 만듭니다.</h2>
        <p className="sectionLead">기존 도구는 중요한 조각을 각각 잘 해결합니다. 반대편은 그 조각을 대체하기보다, <b>“내 오퍼에서 무엇이 아직 증명되지 않았고 → 누구에게 무엇을 물으며 → 회사가 어떻게 답했고 → 그 답으로 내 판단이 어떻게 바뀌는가”</b>를 하나의 workflow로 연결합니다.</p>
        <div className="categoryGrid">
          <article><span>REVIEWS</span><h3>다른 사람의 과거 경험</h3><p>회사에 대한 맥락을 얻는 데 유용하지만, 지금 내 오퍼의 역할·권한·조건을 직접 증명하지는 않습니다.</p></article>
          <article><span>BENCHMARKS</span><h3>시장의 보상 기준</h3><p>연봉·지분을 비교하는 데 중요하지만, 리더 행동이나 실제 의사결정권 같은 비정형 조건은 남습니다.</p></article>
          <article><span>AI / COACHING</span><h3>생각과 전략의 구조화</h3><p>판단을 정리하는 데 도움을 주지만, 회사 내부의 미확인 사실은 결국 현실에서 확인해야 합니다.</p></article>
          <article className="categoryCore"><span>BANDAEPYEON</span><h3>Evidence Exchange</h3><p><b>질문 → 답변 품질 → 증거 → 재실사</b>를 연결해 정보 비대칭이 실제로 줄어드는 과정을 만듭니다.</p></article>
        </div>
        <div className="categoryProtocol">
          <div><i>1</i><b>Candidate asks</b><span>표준 실사 질문을 보냄</span></div>
          <em>→</em>
          <div><i>2</i><b>Company responds</b><span>구체적·모호·비공개를 구분</span></div>
          <em>→</em>
          <div><i>3</i><b>Evidence updates</b><span>증거와 투명성 신호를 분리</span></div>
          <em>→</em>
          <div><i>4</i><b>Decision updates</b><span>기존 결론을 다시 검증</span></div>
        </div>
        <p className="categoryResearch">2026년 AEJ: Applied Economics의 스타트업 구직 실험에서는 회사 품질 정보가 제공되자 실제 지원이 더 높은 평가를 받은 기업 쪽으로 이동했습니다. 정보마찰이 단순한 불편이 아니라 <b>인재 배분을 바꾸는 문제</b>라는 직접적인 근거입니다. <a href="https://www.aeaweb.org/articles?id=10.1257%2Fapp.20240722" target="_blank" rel="noreferrer">연구 보기 ↗</a></p>
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
            <div><span>04</span><b>Failure-safe</b><p>AI 호출 실패 시에도 로컬 실사 프레임워크로 핵심 경험을 유지합니다.</p></div>
          </div>
          <div className="stackLine"><b>Built with</b><span>Next.js · React · OpenAI GPT-5.6 Sol · Vercel AI SDK · Vercel AI Gateway</span></div>
        </div>
      </section>

      {result && (
        <section className={`results depth-${resultDepth}`} ref={resultsRef}>
          <div className="resultsInner">
            <header className="resultHeader">
              <div>
                <span className={`mode ${result.mode}`}>
                  {result.mode === 'ai' ? 'LIVE STARTUP DUE DILIGENCE' : result.mode === 'sample' ? 'GUIDED DUE DILIGENCE' : 'SAFE FALLBACK MODE'}
                </span>
                <h2>좋고 나쁨이 아니라,<br />아직 무엇을 모르는지 찾았습니다.</h2>
                <p>{result.model}</p>
              </div>
              <div className="headerActions">
                <div className="depthToggle" role="group" aria-label="결과 상세 수준">
                  <button className={resultDepth === 'essential' ? 'active' : ''} onClick={() => setResultDepth('essential')}>핵심만</button>
                  <button className={resultDepth === 'full' ? 'active' : ''} onClick={() => setResultDepth('full')}>전체 실사</button>
                </div>
                <button onClick={copySummary}>{copied ? '복사 완료 ✓' : '실사 카드 복사'}</button>
                <button onClick={() => { setResult(null); setPreviousResult(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>새 결정</button>
              </div>
            </header>

            <article className="heroResult">
              <small>당신이 적은 결정</small>
              <h3>{question}</h3>
              <div className="reframe"><span>다시 정의한 진짜 질문</span><p>{result.analysis.realQuestion}</p></div>
            </article>

            <DecisionGap
              items={result.analysis.startupDiligence}
              onCopyPack={copyQuestionPack}
              onCopyRequest={copyDiligenceRequest}
              onCreateShare={createDiligenceShareLink}
            />

            {previousResult && <DecisionDelta before={previousResult.analysis} after={result.analysis} />}

            <div className="activationBrief">
              <div><span>NEXT CHECK</span><b>{result.analysis.decisionCard.nextCheck}</b></div>
              <div><span>FIRST 10 MIN</span><b>{result.analysis.verificationSprint[0]?.action}</b></div>
              <div><span>STOP RULE</span><b>{result.analysis.decisionCard.stopRule}</b></div>
            </div>

            {result.ontologyGraph && <EvidenceCoverage graph={result.ontologyGraph} />}

            <EvidenceStandard />

            <EvidenceRouter />

            <div className="relianceGuardrail">
              <span>AI RELIANCE GUARDRAIL</span>
              <div><b>추천 점수 없음</b><small>AI가 수락/퇴사를 대신 고르지 않습니다.</small></div>
              <div><b>확률 꾸미기 없음</b><small>모르는 회사 정보는 “정보 부족”으로 남깁니다.</small></div>
              <div><b>새 증거로 뒤집기</b><small>실제 답변이 들어오면 분석을 다시 계산합니다.</small></div>
            </div>

            <StartupDiligence
              items={result.analysis.startupDiligence}
              notes={evidenceNotes}
              responseSignals={responseSignals}
              onNoteChange={updateEvidenceNote}
              onSignalChange={updateResponseSignal}
              onCopyQuestion={copyQuestion}
            />

            <ExpectationMemo
              items={result.analysis.startupDiligence}
              audit={result.analysis.sourceAudit}
              notes={evidenceNotes}
              responseSignals={responseSignals}
              onCopy={() => copyExpectationMemo(result.analysis.startupDiligence, result.analysis.sourceAudit)}
            />

            <KoreaOfficialGuide />

            {result.analysis.sourceAudit.present && <SourceAuditPanel audit={result.analysis.sourceAudit} onCopyQuestion={copyQuestion} />}

            <PublicEvidenceLab
              company={publicCompany}
              website={publicWebsite}
              loading={publicLoading}
              error={publicError}
              result={publicResearch}
              onCompanyChange={setPublicCompany}
              onWebsiteChange={setPublicWebsite}
              onSearch={researchPublicEvidence}
              onApply={applyPublicEvidence}
              onCopyQuestion={copyQuestion}
            />

            <article className="realityCheck">
              <div className="realityHead">
                <p className="panelLabel">REALITY CHECK · RESEARCH-INFORMED</p>
                <h3>좋은 이야기보다, 불편하지만 결정에 필요한 현실을 확인합니다.</h3>
              </div>
              <div className="realityGrid">
                <div><span>01 · NEGATIVE PREVIEW</span><b>실제 힘든 점·퇴사 이유</b><p>{result.analysis.realityCheck.negativePreview}</p><button onClick={() => copyQuestion(result.analysis.realityCheck.negativePreview)}>질문 복사</button></div>
                <div><span>02 · ALTERNATIVE QUALITY</span><b>대안의 개수가 아니라 질</b><p>{result.analysis.realityCheck.alternativeQuality}</p><button onClick={() => copyQuestion(result.analysis.realityCheck.alternativeQuality)}>질문 복사</button></div>
                <div><span>03 · PROMISE GAP</span><b>채용·입사 때 약속 vs 현실</b><p>{result.analysis.realityCheck.promiseGap}</p><button onClick={() => copyQuestion(result.analysis.realityCheck.promiseGap)}>질문 복사</button></div>
              </div>
            </article>

            <article className="evidenceLoop">
              <div className="evidenceLoopCopy">
                <p className="panelLabel">EVIDENCE LOOP · CLOSED LOOP</p>
                <h3>실제로 확인한 답을 다시 넣으면, AI가 판단 구조를 업데이트합니다.</h3>
                <p>비공개 숫자·회사명·계약 원문은 적지 말고 “구체적 답변을 받음 / 답변이 모호함 / 권한이 기대보다 좁음”처럼 익명화한 요지만 입력하세요.</p>
              </div>
              <div className="evidenceProgress">
                <div><strong>{evidenceCount}</strong><span>/ 5 verified</span></div>
                <small>구체적 답변 {evidenceCount} · 마찰 신호 {frictionCount} · 확인 대기 {pendingResponseCount}</small>
              </div>
              <button disabled={loading || (evidenceCount === 0 && frictionCount === 0 && pendingResponseCount === 0)} onClick={reanalyzeWithEvidence}>
                {loading ? '재실사 중…' : '새 증거로 다시 실사 →'}
              </button>
              {evidenceLoopMessage && <p className="evidenceLoopMessage">{evidenceLoopMessage}</p>}
            </article>

            {result.ontologyGraph && <OntologyMap graph={result.ontologyGraph} validation={result.ontologyValidation} />}

            <article className="verificationSprint">
              <div className="sprintHead">
                <div>
                  <p className="panelLabel">FROM INSIGHT TO EVIDENCE</p>
                  <h3>AI 답변으로 끝내지 않고, 7일 안에 실제 증거를 모읍니다.</h3>
                </div>
                <span>10분 → 24시간 → 7일</span>
              </div>
              <div className="sprintGrid">
                {result.analysis.verificationSprint.map((x, i) => (
                  <section key={x.horizon}>
                    <div className="sprintTime"><i>{String(i + 1).padStart(2, '0')}</i><b>{x.horizon}</b></div>
                    <p>{x.action}</p>
                    <div><small>완료 증거</small><strong>{x.evidence}</strong></div>
                  </section>
                ))}
              </div>
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
                <div className="passportAction">
                  <div><b>7일 뒤 이 결정을 다시 보세요.</b><span>로그인 없이, 이 기기에만 질문·컨텍스트·증거 메모를 저장합니다.</span></div>
                  <button onClick={savePassport}>이 기기에 Decision Passport 저장</button>
                </div>
              </article>

              <article className="calibrationCheck full">
                <div>
                  <p className="panelLabel">CALIBRATION CHECK · LOCAL ONLY</p>
                  <h3>분석 후, 처음 생각은 어떻게 달라졌나요?</h3>
                  <p>정답을 묻는 게 아닙니다. AI가 내 판단을 얼마나 흔들었는지 스스로 확인하는 단계이며 선택은 서버에 저장하지 않습니다.</p>
                </div>
                <div className="calibrationButtons">
                  {['그대로다', '확신이 약해졌다', '반대쪽으로 바뀌었다', '아직 모르겠다'].map((x) => (
                    <button key={x} className={reflection === x ? 'active' : ''} onClick={() => setReflection(x)}>{x}</button>
                  ))}
                </div>
                {reflection && <small>현재 기록: <b>{reflection}</b> · 이제 결론을 강화하기보다 남은 미확인 정보를 먼저 줄여보세요.</small>}
              </article>
            </div>
          </div>
        </section>
      )}

      <section className="purchaseSection section" id="pricing">
        <p className="eyebrow">FROM USEFUL → WORTH PAYING FOR</p>
        <h2>매달 구독할 이유를 만들기보다,<br />결정이 비싼 순간에 값을 만듭니다.</h2>
        <p className="sectionLead">반대편은 월 구독을 강요하지 않습니다. <b>오퍼·잔류·역할·스톡옵션처럼 값비싼 한 번의 결정을 7일 동안 끝까지 실사하는 제품</b>으로 시작합니다.</p>

        <div className="pricingStatus">
          <span>LAUNCH ACCESS</span>
          <b>지금은 Launch Access 기간으로 Deep Diligence 전 기능을 로그인 없이 사용할 수 있습니다.</b>
          <small>정식 유료 전환 전 Founding Access를 운영 중입니다. 아래 가격은 첫 상용 가격으로 검증할 예정입니다.</small>
        </div>

        <div className="pricingGrid">
          <article>
            <div className="planTop">
              <span>FREE</span>
              <h3>Decision Check</h3>
              <p>“이 결정에서 내가 아직 모르는 게 뭔지” 빠르게 확인합니다.</p>
            </div>
            <div className="planPrice"><strong>₩0</strong><small>첫 실사</small></div>
            <div className="planFeatures">
              <span>✓ 고민 한 문장 분석</span>
              <span>✓ Startup 5-Lens</span>
              <span>✓ 첫 확인 질문</span>
              <span>✓ Flip Condition</span>
            </div>
            <button onClick={() => document.getElementById('decision-input')?.focus()}>무료로 확인하기 →</button>
          </article>

          <article className="featuredPlan">
            <div className="planBadge">PRIMARY PAID WEDGE</div>
            <div className="planTop">
              <span>DEEP DILIGENCE · 7 DAYS</span>
              <h3>Deep Diligence Pass</h3>
              <p>오퍼·잔류·역할·스톡옵션 결정을 실제 증거가 생길 때까지 추적합니다.</p>
            </div>
            <div className="planPrice"><strong>₩19,900</strong><small>Founding price · 정식 가격 ₩29,000 예정</small></div>
            <div className="planFeatures">
              <span>✓ 전체 5-Lens + Reality Check</span>
              <span>✓ 채용공고·오퍼 Source Audit</span>
              <span>✓ 최신 Public Evidence Agent</span>
              <span>✓ Evidence Loop 재실사</span>
              <span>✓ 10분 → 24시간 → 7일 Sprint</span>
              <span>✓ Local Decision Passport</span>
            </div>
            <button onClick={() => analyze(SAMPLE, true)}>Deep Diligence 시작하기 →</button>
            <small className="planTrust">퇴사·입사를 추천하는 상품이 아니라, 확인되지 않은 정보를 줄이는 상품입니다.</small>
          </article>

          <article>
            <div className="planTop">
              <span>B2B2C</span>
              <h3>Sponsored Access</h3>
              <p>리크루팅 플랫폼·VC·액셀러레이터가 후보자와 직원의 실사 이용권을 제공합니다.</p>
            </div>
            <div className="planPrice"><strong>Pilot</strong><small>기관별 계약</small></div>
            <div className="planFeatures">
              <span>✓ Access code / cohort pass</span>
              <span>✓ 개인 입력·결과 sponsor 비공개</span>
              <span>✓ 개인정보 없는 사용량 지표</span>
              <span>✓ 커리어 교육·온보딩 연계</span>
            </div>
            <a className="planLink" href="#business">B2B2C 구조 보기 ↓</a>
          </article>
        </div>

        <div className="buyReason">
          <div><span>왜 무료 ChatGPT 대신 사나?</span><b>스타트업 전용 실사 ontology + 공개자료 조사 + 실제 질문 + 7일 Evidence Loop가 한 workflow에 있습니다.</b></div>
          <div><span>왜 월 구독이 아닌가?</span><b>오퍼 같은 결정은 빈도보다 순간의 가치와 마감 압력이 큽니다. 먼저 1회성 결제 의사를 검증합니다.</b></div>
          <div><span>무엇을 보장하나?</span><b>좋은 결과나 연봉 상승을 보장하지 않습니다. “무엇을 확인해야 하는가”를 구체화하고 증거 확보를 돕습니다.</b></div>
        </div>
      </section>

      <section className="businessPath section" id="business">
        <p className="eyebrow">BUSINESS PATH</p>
        <h2>사용자는 직원,<br />지불자는 개인 또는 생태계가 될 수 있습니다.</h2>
        <p className="sectionLead">개인의 민감한 판단은 끝까지 개인에게 남겨두면서도, 커리어 의사결정이 발생하는 순간에 유료 가치를 만들 수 있습니다.</p>
        <div className="businessGrid">
          <article>
            <span>01 · FREE</span>
            <h3>Decision Check</h3>
            <p>5-Lens 실사와 Evidence Loop를 로그인 없이 제공해 유입과 신뢰를 만듭니다.</p>
            <b>목표 · 문제 검증 + 바이럴</b>
          </article>
          <article>
            <span>02 · B2C</span>
            <h3>Deep Diligence Pass</h3>
            <p>두 선택지 비교, 심층 질문팩, 7일 추적, 오퍼·지분 체크리스트를 일회성 유료 상품으로 확장합니다.</p>
            <b>가설 · 고빈도 구독보다 고의도 순간 결제</b>
          </article>
          <article>
            <span>03 · B2B2C</span>
            <h3>Sponsored Access</h3>
            <p>리크루팅 플랫폼·VC·액셀러레이터가 이용권을 제공하되 개인 입력과 결과는 절대 열람하지 못하게 합니다.</p>
            <b>원칙 · sponsor pays, employee owns data</b>
          </article>
          <article>
            <span>04 · LATER</span>
            <h3>Decision Intelligence</h3>
            <p>검증 동의를 받은 Decision Graph를 바탕으로 고불확실성 조직의 의사결정 프로토콜로 확장합니다.</p>
            <b>조건 · Personal과 Teams 데이터 완전 분리</b>
          </article>
        </div>
        <div className="businessMoat">
          <b>장기 Moat</b>
          <span>Prompt가 아니라 <strong>Startup Decision Ontology + Evidence Loop + Outcome-linked Decision Graph + Employee Trust</strong></span>
        </div>
      </section>

      <footer>
        <b>반대편</b>
        <span>Startup Employee Due Diligence · Falsify Before You Decide.</span>
        <small>로그인 없이 체험할 수 있습니다. 입력 내용은 서비스 DB에 별도로 저장하지 않도록 설계했으며, AI 분석 요청은 모델 제공 경로를 통해 처리될 수 있습니다. 회사명·실명·비공개 경영정보는 입력하지 마세요.</small><div className="footerLinks"><a href="/en">English</a><a href="#pricing">가격</a><a href="/methodology">방법론</a><a href="/privacy">프라이버시 원칙</a><a href="https://github.com/Maiven/tetrisai" target="_blank" rel="noreferrer">GitHub</a></div>
      </footer>

      {loading && (
        <div className="loading" role="status" aria-live="polite">
          <div className="loadingCard">
            <div className="loadingMark"><span /><span /></div>
            <p className="loadingEyebrow">DUE DILIGENCE IN PROGRESS</p>
            <h3>확신을 만드는 대신,<br />확인해야 할 것을 찾고 있습니다.</h3>
            <div className="loadingTrack"><i /></div>
            <div className="loadingSteps">
              <span className="active">01 · 맥락 구조화</span>
              <span>02 · 5-Lens 실사</span>
              <span>03 · 반증 조건</span>
              <span>04 · 첫 행동</span>
            </div>
            <small>결정은 대신 내리지 않습니다. 모르는 정보는 질문으로 남깁니다.</small>
          </div>
        </div>
      )}
    </main>
  );
}

function DecisionDelta({ before, after }: { before: Analysis; after: Analysis }) {
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
    <article className="decisionDelta">
      <div className="deltaHead">
        <div>
          <p className="panelLabel">DECISION DELTA · WHAT CHANGED</p>
          <h3>새 정보가 들어온 뒤 판단 구조가 어떻게 달라졌는지 보여줍니다.</h3>
        </div>
        <span>{changes.length}개 Lens 업데이트</span>
      </div>
      {changes.length > 0 ? (
        <div className="deltaGrid">
          {changes.map(({ prev, next, statusChanged }) => (
            <div key={next.dimension}>
              <b>{next.dimension}</b>
              <div className="deltaStatus">
                <span>{prev.status}</span><i>→</i><span className="after">{next.status}</span>
              </div>
              <p>{statusChanged ? next.signal : next.missingEvidence}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="deltaNoChange">Lens 상태는 아직 바뀌지 않았습니다. 이는 새 정보가 쓸모없다는 뜻이 아니라, 핵심 미확인이 아직 닫히지 않았다는 뜻입니다.</p>
      )}
      {before.realQuestion !== after.realQuestion && (
        <div className="deltaQuestion"><small>REAL QUESTION UPDATED</small><p>{after.realQuestion}</p></div>
      )}
    </article>
  );
}

function EvidenceRouter() {
  const routes = [
    {
      lens: '회사 생존 신호',
      best: '회사 공식자료 → 사모시장 데이터 → 공개 채용 신호',
      links: [
        ['PitchBook', 'https://pitchbook.com/use-cases/due-diligence'],
        ['Crunchbase', 'https://www.crunchbase.com/'],
        ['Wellfound', 'https://wellfound.com/'],
      ],
      note: '투자유치 기사는 생존 보장이 아닙니다. 최신성과 출처를 확인하세요.',
    },
    {
      lens: '역할·팀 구조',
      best: '직속리더 → 공개 org chart → 채용공고',
      links: [
        ['The Org', 'https://theorg.com/for-candidates'],
        ['Wellfound', 'https://wellfound.com/jobs/'],
      ],
      note: '직함보다 reporting line·의사결정권·첫 90일 결과를 확인하세요.',
    },
    {
      lens: '현금·보상',
      best: '오퍼 문서 → 시장 benchmark → 협상 전문가',
      links: [
        ['Levels.fyi', 'https://www.levels.fyi/'],
        ['Wellfound Salary Data', 'https://wellfound.com/hiring-data'],
        ['Rora', 'https://www.teamrora.com/'],
      ],
      note: '시장 평균은 내 역할의 적정가를 자동으로 결정하지 않습니다.',
    },
    {
      lens: '지분',
      best: '부여계약·플랜 문서 → 공식 규정 → 전문 도구/전문가',
      links: [
        ['Secfi', 'https://secfi.com/tools/equity-planner'],
        ['Carta', 'https://carta.com/'],
      ],
      note: '옵션 개수나 미래 기업가치만으로 현금처럼 평가하지 마세요.',
    },
    {
      lens: '문화·리더십',
      best: '현직자 실제 사례 → 조직 구조 → 다수의 후기',
      links: [
        ['Blind', 'https://www.teamblind.com/'],
        ['Glassdoor', 'https://www.glassdoor.com/'],
        ['Welcome to the Jungle', 'https://www.welcometothejungle.com/en-GB'],
      ],
      note: '익명후기는 맥락 신호입니다. 한 리뷰를 내 팀의 미래 사실로 일반화하지 마세요.',
    },
  ] as const;

  return (
    <details className="evidenceRouter">
      <summary>
        <span><b>어디에서 확인해야 할까요?</b><small>전세계 서비스 사례를 바탕으로 Lens별 검증 출발점을 연결합니다.</small></span>
        <em>Evidence Router 열기</em>
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
      <p className="routerNotice">외부 서비스는 검증 출발점의 예시이며 반대편과의 제휴를 의미하지 않습니다. 유료·로그인·지역 제한이 있을 수 있습니다.</p>
    </details>
  );
}

function KoreaOfficialGuide() {
  return (
    <article className="officialSourceGuide">
      <div>
        <p className="panelLabel">OFFICIAL VERIFICATION · KOREA</p>
        <h3>한국 스타트업 오퍼라면 공식 법령과 부여 문서를 먼저 확인하세요.</h3>
        <p>벤처기업 주식매수선택권에는 법정 구조가 있지만, 내 오퍼의 실제 경제적 의미는 부여계약·행사가격·베스팅·퇴사 후 행사조건 등 회사별 문서에서 확인해야 합니다.</p>
      </div>
      <div className="officialLinks">
        <a href="https://www.law.go.kr/lsInfoP.do?lsiSeq=271307" target="_blank" rel="noreferrer">국가법령정보센터 · 벤처기업법 제16조의3 ↗</a>
        <a href="https://www.mss.go.kr/site/smba/ex/bbs/View.do?bcIdx=1064346&cbIdx=86" target="_blank" rel="noreferrer">중소벤처기업부 · 벤처기업 실태조사 ↗</a>
      </div>
      <small>법률·세무 자문이 아닙니다. 실제 적용은 최신 법령, 회사의 공식 부여 문서, 전문가 확인이 우선합니다.</small>
    </article>
  );
}

function EvidenceStandard() {
  return (
    <details className="evidenceStandard">
      <summary>
        <span><b>무엇을 “증거”로 인정할까요?</b><small>AI의 설명보다 출처와 직접 확인을 우선합니다.</small></span>
        <em>Evidence standard 보기</em>
      </summary>
      <div className="evidenceLadder">
        <div className="tier strong"><span>01</span><b>공식 문서·계약·규제기관 자료</b><small>가장 강함 · 실제 조건과 적용대상 확인 필요</small></div>
        <div className="tier strong"><span>02</span><b>책임자에게 받은 구체적 답변</b><small>직속리더·채용담당자의 구체적 기준·사례</small></div>
        <div className="tier"><span>03</span><b>현직자의 구체적 실제 사례</b><small>행동·의사결정 방식 확인에 유용</small></div>
        <div className="tier"><span>04</span><b>검증 가능한 공개 회사자료</b><small>공식 채용·보도자료·기업 공시 등</small></div>
        <div className="tier weak"><span>05</span><b>제3자 기사·후기·익명 경험</b><small>맥락 신호 · 단독으로 사실 확정 금지</small></div>
        <div className="tier ai"><span>—</span><b>AI 추론</b><small>증거가 아닙니다. 무엇을 확인할지 구조화하는 도구입니다.</small></div>
      </div>
    </details>
  );
}

function ExpectationMemo({
  items,
  audit,
  notes,
  responseSignals,
  onCopy,
}: {
  items: DiligenceItem[];
  audit: Analysis['sourceAudit'];
  notes: Record<string, string>;
  responseSignals: Record<string, ResponseSignal>;
  onCopy: () => void;
}) {
  return (
    <article className="expectationMemo">
      <div className="expectationHead">
        <div>
          <p className="panelLabel">EXPECTATION MEMO · BEFORE ACCEPTING</p>
          <h3>오퍼의 약속을 입사 후 검증할 수 있는 기대치로 남깁니다.</h3>
          <p>말로 들은 기대와 실제 경험의 차이를 줄이기 위해, 지금 확인된 것과 아직 미확인인 것을 30일·90일 뒤 다시 비교합니다.</p>
        </div>
        <button onClick={onCopy}>기대치 확인 메모 복사 →</button>
      </div>
      <div className="expectationRows">
        {items.map((item) => {
          const signal = responseSignals[item.dimension] ?? '아직 안 물음';
          const note = notes[item.dimension]?.trim();
          const claims = audit.claims.filter((claim) => claim.dimension === item.dimension);
          const state =
            signal === '구체적 답변'
              ? '직접 확인'
              : claims.length
                ? '문서상 약속'
                : signal === '모호한 답변' || signal === '답변 회피'
                  ? '추가 확인'
                  : '미확인';
          const content =
            signal === '구체적 답변' && note
              ? note
              : claims.length
                ? claims.map((claim) => claim.claim).join(' · ')
                : note || item.missingEvidence;
          return (
            <div key={item.dimension}>
              <span>{item.dimension}</span>
              <b>{state}</b>
              <p>{content}</p>
            </div>
          );
        })}
      </div>
      <div className="expectationReview"><span>30 DAYS</span><b>역할·리더·실제 권한</b><i>→</i><span>90 DAYS</span><b>성과기준·보상·학습 약속</b></div>
      <small>법적 계약이 아니라 기대치 확인 메모입니다. 계약·세무·지분 권리는 공식 문서와 전문가 확인이 우선합니다.</small>
    </article>
  );
}

function DecisionGap({
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
  const ranked = [...items].sort((a, b) => {
    const rank: Record<DiligenceItem['status'], number> = { '검증 우선': 0, '정보 부족': 1, '주의': 2, '확인됨': 3 };
    return rank[a.status] - rank[b.status];
  });
  const unresolved = items.filter((x) => x.status !== '확인됨').length;
  const top = ranked.slice(0, 3);

  return (
    <article className="decisionGap">
      <div className="decisionGapLead">
        <p className="panelLabel">DECISION GAP · BEFORE YOU SAY YES</p>
        <h3>{unresolved > 0 ? `지금 결정하면 ${unresolved}개 영역의 미확인을 함께 떠안습니다.` : '핵심 5개 영역이 모두 확인된 상태입니다.'}</h3>
        <p>먼저 아래 세 질문에 답을 받아보세요. 좋은 답보다 <b>구체적인 답</b>이 중요합니다.</p>
      </div>
      <div className="decisionGapQuestions">
        {top.map((x, i) => (
          <div key={x.dimension}>
            <span>{String(i + 1).padStart(2, '0')} · {x.dimension}</span>
            <small className="askWho">누구에게 · {x.askWho}</small>
            <p>{x.questionToAsk}</p>
          </div>
        ))}
      </div>
      <div className="decisionGapActions shareActions">
        <button onClick={() => onCopyPack(items)}>질문만 복사</button>
        <button onClick={() => onCopyRequest(items)}>요청문 복사</button>
        <button className="primary" onClick={() => onCreateShare(items)}>회사 답변용 링크 만들기 →</button>
      </div>
      <p className="sharePrivacyNote">Share Link에는 선택된 질문만 들어갑니다. 후보자의 고민·분석 결과는 상대방에게 공개되지 않습니다.</p>
    </article>
  );
}

function SourceAuditPanel({
  audit,
  onCopyQuestion,
}: {
  audit: Analysis['sourceAudit'];
  onCopyQuestion: (text: string) => void;
}) {
  return (
    <article className="sourceAuditPanel">
      <div className="sourceAuditHead">
        <div><p className="panelLabel">SOURCE AUDIT · JOB / OFFER PROMISES</p><h3>문서에 적힌 약속과 현실에서 검증할 것을 분리했습니다.</h3></div>
        <span>user-provided artifact</span>
      </div>
      <div className="sourceAuditGrid">
        {audit.claims.map((x, i) => (
          <section key={`${x.dimension}-${i}`}>
            <div><b>{x.dimension}</b><span className={`sourceClass source-${x.classification.replaceAll(' ', '-')}`}>{x.classification}</span></div>
            <p>{x.claim}</p>
            <small>현실 확인 질문</small>
            <strong>{x.verificationQuestion}</strong>
            <button onClick={() => onCopyQuestion(x.verificationQuestion)}>질문 복사</button>
          </section>
        ))}
      </div>
      {audit.missingTerms.length > 0 && (
        <div className="missingTerms"><b>문서에서 빠졌거나 모호한 조건</b>{audit.missingTerms.map((x, i) => <span key={i}>{x}</span>)}</div>
      )}
      <p className="sourceAuditNote">{audit.note}</p>
    </article>
  );
}

function EvidenceCoverage({ graph }: { graph: DecisionGraph }) {
  const verifiedDimensions = new Set(
    graph.edges
      .filter((e) => e.relation === 'VERIFIED_BY')
      .map((e) => e.source),
  );
  const publicDimensions = new Set(
    graph.edges
      .filter((e) => e.relation === 'PUBLICLY_SUPPORTED_BY')
      .map((e) => e.source),
  );
  const unknownClaims = graph.nodes.filter((n) => n.type === 'Unknown').length;
  const totalDimensions = graph.nodes.filter((n) => n.type === 'Dimension').length || 5;

  return (
    <article className="evidenceCoverage">
      <div>
        <p className="panelLabel">EVIDENCE CLOSURE · NOT AN AI SCORE</p>
        <h3>좋은 결정의 진척도를 “확신”이 아니라 확보한 증거로 봅니다.</h3>
      </div>
      <div className="coverageMetrics">
        <div><strong>{verifiedDimensions.size}<span>/ {totalDimensions}</span></strong><small>직접 확인된 Lens</small></div>
        <div><strong>{publicDimensions.size}<span>/ {totalDimensions}</span></strong><small>공개 자료가 있는 Lens</small></div>
        <div><strong>{unknownClaims}</strong><small>아직 미확인 Claim</small></div>
      </div>
      <p>목표는 5/5 점수를 만드는 것이 아닙니다. <b>결론을 바꿀 수 있는 핵심 미확인 정보부터 닫는 것</b>입니다.</p>
    </article>
  );
}

function PublicEvidenceLab({
  company,
  website,
  loading,
  error,
  result,
  onCompanyChange,
  onWebsiteChange,
  onSearch,
  onApply,
  onCopyQuestion,
}: {
  company: string;
  website: string;
  loading: boolean;
  error: string;
  result: PublicEvidenceResult | null;
  onCompanyChange: (value: string) => void;
  onWebsiteChange: (value: string) => void;
  onSearch: () => void;
  onApply: () => void;
  onCopyQuestion: (text: string) => void;
}) {
  return (
    <details className="publicEvidenceLab">
      <summary>
        <span><b>Public Evidence Agent</b><small>선택 · 최신 공개 웹 자료로 회사 신호 확인</small></span>
        <em>공개 자료까지 실사하기 +</em>
      </summary>
      <div className="publicEvidenceBody">
        <div className="publicSearchForm">
          <label>
            <span>공개 회사명</span>
            <input value={company} onChange={(e) => onCompanyChange(e.target.value)} placeholder="예: 공개적으로 검색 가능한 회사명" />
          </label>
          <label>
            <span>공식 웹사이트 / 채용페이지 URL · 선택</span>
            <input value={website} onChange={(e) => onWebsiteChange(e.target.value)} placeholder="https://..." />
          </label>
          <button onClick={onSearch} disabled={loading}>{loading ? '최신 공개 자료 검색 중…' : '공개 자료 실사 →'}</button>
        </div>
        <p className="publicPrivacy">회사명은 최신 공개 자료 검색을 위해 검색·AI 제공 경로로 전달됩니다. 비공개 매출·런웨이·계약·고객정보는 입력하지 마세요.</p>
        {error && <p className="publicError">{error}</p>}

        {result && (
          <div className="publicResearchResult">
            <div className="publicOverview">
              <span>PUBLIC EVIDENCE SUMMARY</span>
              <p>{result.research.overview}</p>
              <small>{result.research.freshnessNote}</small>
            </div>
            <div className="publicSignalGrid">
              {result.research.signals.map((x, i) => (
                <article key={`${x.dimension}-${i}`}>
                  <div><b>{x.dimension}</b><span className={`publicLevel level-${x.evidenceLevel.replaceAll(' ', '-')}`}>{x.evidenceLevel}</span></div>
                  <p>{x.finding}</p>
                  <small><b>의미</b> {x.implication}</small>
                  <small><b>주의</b> {x.caution}</small>
                </article>
              ))}
            </div>
            <div className="publicQuestions">
              <b>공개 자료로도 남은 질문</b>
              {result.research.questionsToVerify.map((q, i) => (
                <div key={i}><span>{i + 1}</span><p>{q}</p><button onClick={() => onCopyQuestion(q)}>복사</button></div>
              ))}
            </div>
            <div className="publicSources">
              <b>검색 출처</b>
              {result.sources.length > 0 ? result.sources.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a>
              )) : <span>검색 도구가 별도 URL 출처를 반환하지 않았습니다.</span>}
            </div>
            <button className="applyPublicEvidence" onClick={onApply}>이 공개 신호를 ontology에 반영해 재실사 →</button>
            <p className="publicNote">{result.note}</p>
          </div>
        )}
      </div>
    </details>
  );
}

function OntologyMap({ graph, validation }: { graph: DecisionGraph; validation?: { valid: boolean; violations: string[] } }) {
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
  const relationRows = graph.edges
    .filter((e) => ['REQUIRES_EVIDENCE', 'VERIFIED_BY', 'PUBLICLY_SUPPORTED_BY', 'RESPONDED_WITH', 'COULD_FLIP', 'LEADS_TO_ACTION'].includes(e.relation))
    .slice(0, 12);
  const counts = {
    dimensions: graph.nodes.filter((n) => n.type === 'Dimension').length,
    unknowns: graph.nodes.filter((n) => n.type === 'Unknown').length,
    verified: graph.nodes.filter((n) => n.type === 'Evidence' && n.provenance === 'user_verified').length,
    actions: graph.nodes.filter((n) => n.type === 'VerificationAction').length,
  };

  const relationLabel: Record<OntologyEdge['relation'], string> = {
    HAS_DIMENSION: 'HAS DIMENSION',
    HAS_CLAIM: 'HAS CLAIM',
    REQUIRES_EVIDENCE: 'NEEDS',
    ASKS: 'ASKS',
    VERIFIED_BY: 'VERIFIED BY',
    PUBLICLY_SUPPORTED_BY: 'PUBLIC SOURCE',
    RESPONDED_WITH: 'RESPONSE SIGNAL',
    COULD_FLIP: 'COULD FLIP',
    LEADS_TO_ACTION: 'LEADS TO',
  };

  return (
    <details className="ontologyMap">
      <summary>
        <span><b>Semantic Decision Map</b><small>온톨로지 v{graph.ontologyVersion} · 고급 보기</small></span>
        <em>결과가 어떤 의미 구조로 연결됐는지 보기 +</em>
      </summary>
      <div className="ontologyBody">
        <div className="ontologyValidation">
          <span className={validation?.valid ? 'valid' : 'review'}>{validation?.valid ? '✓ Semantic constraints passed' : '△ Semantic review needed'}</span>
          <small>{validation?.valid ? '5-Lens · Question linkage · Graph integrity 검증 완료' : validation?.violations?.join(' · ')}</small>
        </div>
        <div className="ontologyStats">
          <div><b>{counts.dimensions}</b><span>Domain lenses</span></div>
          <div><b>{counts.unknowns}</b><span>Unknown claims</span></div>
          <div><b>{counts.verified}</b><span>User evidence</span></div>
          <div><b>{counts.actions}</b><span>Actions</span></div>
        </div>
        <div className="ontologyRelations">
          {relationRows.map((edge, i) => {
            const source = nodeById.get(edge.source);
            const target = nodeById.get(edge.target);
            if (!source || !target) return null;
            return (
              <div key={`${edge.source}-${edge.relation}-${edge.target}-${i}`}>
                <span className={`ontoType onto-${source.provenance}`}>{source.type}</span>
                <p>{source.label}</p>
                <i>{relationLabel[edge.relation]}</i>
                <span className={`ontoType onto-${target.provenance}`}>{target.type}</span>
                <p>{target.label}</p>
              </div>
            );
          })}
        </div>
        <div className="ontologyLegend">
          <span><i className="onto-user_input" />사용자 입력</span>
          <span><i className="onto-user_verified" />사용자가 확인한 증거</span>
          <span><i className="onto-public_source" />공개 웹 자료</span>
          <span><i className="onto-user_reported_response" />답변 품질 신호</span>
          <span><i className="onto-model_structured" />AI 구조화</span>
          <span><i className="onto-system_ontology" />시스템 온톨로지</span>
        </div>
        <p className="ontologyNote">이 그래프는 AI가 자유롭게 만든 “설명”이 아니라, Decision → Domain → Evidence → Question → Action 관계를 타입으로 고정한 semantic layer입니다. 개인 정보는 그래프를 별도 DB에 저장하지 않습니다.</p>
      </div>
    </details>
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

function StartupDiligence({
  items,
  notes,
  responseSignals,
  onNoteChange,
  onSignalChange,
  onCopyQuestion,
}: {
  items: DiligenceItem[];
  notes: Record<string, string>;
  responseSignals: Record<string, ResponseSignal>;
  onNoteChange: (dimension: string, value: string) => void;
  onSignalChange: (dimension: string, value: ResponseSignal) => void;
  onCopyQuestion: (text: string) => void;
}) {
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
            <div className="ask">
              <small>직접 물어볼 질문</small>
              <strong>{x.questionToAsk}</strong>
              <button onClick={() => onCopyQuestion(x.questionToAsk)}>질문 복사</button>
            </div>
            <div className="responseSignal">
              <small>물어본 뒤 답변 상태</small>
              {responseSignals[x.dimension] === '링크 응답·확인 필요' && (
                <p className="pendingExternalResponse">외부 링크 응답이 도착했습니다. 신원을 인증한 응답이 아니므로 내용을 확인한 뒤 아래 상태 중 하나로 직접 분류하세요.</p>
              )}
              <div>
                {(['아직 안 물음', '구체적 답변', '모호한 답변', '답변 회피'] as Exclude<ResponseSignal, '링크 응답·확인 필요'>[]).map((signal) => (
                  <button
                    key={signal}
                    className={(responseSignals[x.dimension] ?? '아직 안 물음') === signal ? 'active' : ''}
                    onClick={() => onSignalChange(x.dimension, signal)}
                  >
                    {signal}
                  </button>
                ))}
              </div>
            </div>
            <label className="evidenceNote">
              <small>답변의 요지를 익명으로 기록</small>
              <textarea
                maxLength={300}
                value={notes[x.dimension] ?? ''}
                onChange={(e) => onNoteChange(x.dimension, e.target.value)}
                placeholder="예: 구체적 사례를 들었음 / 답변이 계속 모호함 · 회사명·비공개 숫자 입력 금지"
              />
            </label>
          </section>
        ))}
      </div>
    </article>
  );
}

