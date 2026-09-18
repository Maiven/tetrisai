'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

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
  type: 'Decision' | 'Dimension' | 'Claim' | 'Evidence' | 'Unknown' | 'Question' | 'FlipCondition' | 'VerificationAction';
  label: string;
  status?: string;
  provenance: 'user_input' | 'user_verified' | 'public_source' | 'model_structured' | 'system_ontology';
  dimension?: string;
};
type OntologyEdge = {
  source: string;
  relation: 'HAS_DIMENSION' | 'HAS_CLAIM' | 'REQUIRES_EVIDENCE' | 'ASKS' | 'VERIFIED_BY' | 'PUBLICLY_SUPPORTED_BY' | 'COULD_FLIP' | 'LEADS_TO_ACTION';
  target: string;
};
type DecisionGraph = { ontologyVersion: string; nodes: OntologyNode[]; edges: OntologyEdge[] };
type ApiResult = {
  mode: 'ai' | 'fallback' | 'demo';
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

type SavedPassport = {
  id: string;
  question: string;
  context: StartupContext;
  evidenceNotes: Record<string, string>;
  savedAt: string;
  revisitAt: string;
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

const DEMO = '현재 직장은 안정적이지만 성장 속도가 느립니다. 연봉이 15% 높은 Series A 스타트업으로 이직 제안을 받았고 스톡옵션도 있습니다.';
const DEMO_CONTEXT: StartupContext = {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [evidenceNotes, setEvidenceNotes] = useState<Record<string, string>>({});
  const [evidenceLoopMessage, setEvidenceLoopMessage] = useState('');
  const [reflection, setReflection] = useState('');
  const [publicCompany, setPublicCompany] = useState('');
  const [publicWebsite, setPublicWebsite] = useState('');
  const [publicResearch, setPublicResearch] = useState<PublicEvidenceResult | null>(null);
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicError, setPublicError] = useState('');
  const [passport, setPassport] = useState<SavedPassport | null>(null);
  const [passportMessage, setPassportMessage] = useState('');
  const resultsRef = useRef<HTMLElement | null>(null);
  const count = useMemo(() => question.length, [question]);
  const evidenceCount = useMemo(
    () => Object.values(evidenceNotes).filter((x) => x.trim().length > 0).length,
    [evidenceNotes],
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('bandaepyeon:passport');
      if (raw) setPassport(JSON.parse(raw) as SavedPassport);
    } catch {
      // local-only convenience; ignore corrupted storage
    }
  }, []);

  function publicEvidencePayload(source = publicResearch): string[] {
    if (!source) return [];
    return source.research.signals
      .filter((x) => x.evidenceLevel !== '확인 안 됨')
      .map((x) => `${x.dimension}: ${x.finding} [${x.evidenceLevel}] · 주의: ${x.caution}`);
  }

  async function analyze(
    value?: string,
    demo = false,
    verifiedEvidence: string[] = [],
    publicEvidence: string[] = [],
  ) {
    const q = (value ?? question).trim();
    setError('');
    if (!demo && q.length < 8) {
      setError('조금 더 구체적으로 적어주세요. 8자 이상이면 좋습니다.');
      return;
    }

    const activeContext = demo ? DEMO_CONTEXT : context;
    if (demo) setContext(DEMO_CONTEXT);
    setQuestion(q || DEMO);
    if (verifiedEvidence.length === 0) {
      setReflection('');
      setEvidenceNotes({});
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
        body: JSON.stringify({ question: q || DEMO, demo, context: normalizedContext, verifiedEvidence, publicEvidence }),
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

  function updateEvidenceNote(dimension: string, value: string) {
    setEvidenceNotes((prev) => ({ ...prev, [dimension]: value.slice(0, 300) }));
    setEvidenceLoopMessage('');
  }

  async function reanalyzeWithEvidence() {
    const verifiedEvidence = Object.entries(evidenceNotes)
      .filter(([, value]) => value.trim())
      .map(([dimension, value]) => `${dimension}: ${value.trim()}`);

    if (verifiedEvidence.length === 0) {
      setEvidenceLoopMessage('먼저 5-Lens 중 하나 이상에 새로 확인한 내용을 적어주세요.');
      return;
    }

    setEvidenceLoopMessage(`새 증거 ${verifiedEvidence.length}개를 반영해 다시 실사합니다.`);
    await analyze(question, false, verifiedEvidence);
  }

  async function copyQuestion(text: string) {
    await navigator.clipboard.writeText(text);
    setEvidenceLoopMessage('질문을 복사했습니다. 실제 담당자·리더·현직자에게 확인해보세요.');
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
      savedAt: new Date().toISOString(),
      revisitAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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
            <button onClick={() => document.getElementById('decision-input')?.focus()}>내 결정 실사하기 ↗</button>
          </div>
        </nav>

        <div className="heroGrid">
          <div className="copy">
            <p className="eyebrow">EMPLOYEE-SIDE STARTUP DUE DILIGENCE</p>
            <h1>입사·잔류·이직 전에,<br /><em>회사보다 내 결정을 먼저 실사하세요.</em></h1>
            <p className="lead">스타트업은 정보가 부족한데 결정은 빠릅니다. 반대편은 회사·역할·리더·보상·학습의 다섯 영역에서 아직 증명되지 않은 것을 찾아 직원 편에서 결정을 검증합니다.</p>

            {passport && (
              <div className="passportResume">
                <div>
                  <span>LOCAL DECISION PASSPORT</span>
                  <b>{passport.question}</b>
                  <small>7일 재점검 · {new Date(passport.revisitAt).toLocaleDateString('ko-KR')}</small>
                </div>
                <button onClick={restorePassport}>이어 실사 →</button>
                <button className="passportDelete" onClick={deletePassport}>삭제</button>
              </div>
            )}
            {passportMessage && <p className="passportMessage">{passportMessage}</p>}

            <div className="activationRail" aria-label="반대편 이용 순서">
              <div><i>1</i><span><b>고민 한 문장</b><small>회사명 없이 익명으로</small></span></div>
              <em>→</em>
              <div><i>2</i><span><b>AI 실사</b><small>모르는 것을 질문으로</small></span></div>
              <em>→</em>
              <div><i>3</i><span><b>실제 확인</b><small>새 증거로 다시 분석</small></span></div>
            </div>

            <form className="decisionBox" onSubmit={submit}>
              <label htmlFor="decision-input">지금 스타트업에서 고민하고 있는 결정을 적어보세요.</label>
              <textarea
                id="decision-input"
                maxLength={700}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="예: 투자 지연이 반복되고 제 역할은 계속 넓어지는데, 지금 회사를 계속 다녀야 할까?"
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
                </div>
              </details>

              <div className="decisionActions">
                <span>{count}/700 · 회사명·실명·연락처·비공개 숫자 등 민감정보는 입력하지 마세요.</span>
                <button type="submit" disabled={loading}>{loading ? '실사 중…' : '내 결정 실사하기 →'}</button>
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
              <button className="instantDemo" onClick={() => analyze(DEMO, true)}>▶ 입력 없이 10초 데모 보기</button>
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
            <button onClick={() => analyze(DEMO, true)}>이 결과를 10초 만에 체험하기 →</button>
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

            <div className="activationBrief">
              <div><span>NEXT CHECK</span><b>{result.analysis.decisionCard.nextCheck}</b></div>
              <div><span>FIRST 10 MIN</span><b>{result.analysis.verificationSprint[0]?.action}</b></div>
              <div><span>STOP RULE</span><b>{result.analysis.decisionCard.stopRule}</b></div>
            </div>

            <div className="relianceGuardrail">
              <span>AI RELIANCE GUARDRAIL</span>
              <div><b>추천 점수 없음</b><small>AI가 수락/퇴사를 대신 고르지 않습니다.</small></div>
              <div><b>확률 꾸미기 없음</b><small>모르는 회사 정보는 “정보 부족”으로 남깁니다.</small></div>
              <div><b>새 증거로 뒤집기</b><small>실제 답변이 들어오면 분석을 다시 계산합니다.</small></div>
            </div>

            <StartupDiligence
              items={result.analysis.startupDiligence}
              notes={evidenceNotes}
              onNoteChange={updateEvidenceNote}
              onCopyQuestion={copyQuestion}
            />

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
                <div><strong>{evidenceCount}</strong><span>/ 5 Lenses</span></div>
                <small>새로 확보한 증거</small>
              </div>
              <button disabled={loading || evidenceCount === 0} onClick={reanalyzeWithEvidence}>
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

      <section className="businessPath section">
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
        <small>로그인 없이 체험할 수 있습니다. 입력 내용은 서비스 DB에 별도로 저장하지 않도록 설계했으며, AI 분석 요청은 모델 제공 경로를 통해 처리될 수 있습니다. 회사명·실명·비공개 경영정보는 입력하지 마세요.</small><div className="footerLinks"><a href="/methodology">방법론</a><a href="/privacy">프라이버시 원칙</a><a href="https://github.com/Maiven/tetrisai" target="_blank" rel="noreferrer">GitHub</a></div>
      </footer>

      {loading && <div className="loading"><div><span className="spinner" /><h3>직원 편에서 회사를 실사하고 있습니다.</h3><p>회사 → 역할 → 리더 → 보상 → 학습 → 반증 조건</p><small>AI가 퇴사·입사를 대신 결정하지 않습니다.</small></div></div>}
    </main>
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
    .filter((e) => ['REQUIRES_EVIDENCE', 'VERIFIED_BY', 'PUBLICLY_SUPPORTED_BY', 'COULD_FLIP', 'LEADS_TO_ACTION'].includes(e.relation))
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
  onNoteChange,
  onCopyQuestion,
}: {
  items: DiligenceItem[];
  notes: Record<string, string>;
  onNoteChange: (dimension: string, value: string) => void;
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
            <label className="evidenceNote">
              <small>확인 후, 익명화한 답의 요지만 기록</small>
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

