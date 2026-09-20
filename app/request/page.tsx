'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  decodeDiligencePayload,
  encodeDiligencePayload,
  requestExpired,
  type DiligenceRequestPayload,
  type DiligenceResponseAnswer,
  type DiligenceResponsePayload,
} from '@/lib/diligence-share';

type AnswerState = {
  status: 'concrete' | 'vague' | 'declined';
  answer: string;
};

const ROLE_LABELS = {
  ko: {
    recruiter: '채용담당자 / People',
    hiring_manager: '직속리더 / Hiring manager',
    current_employee: '현직자',
    other: '기타',
  },
  en: {
    recruiter: 'Recruiter / People team',
    hiring_manager: 'Hiring manager',
    current_employee: 'Current employee',
    other: 'Other',
  },
} as const;

export default function DiligenceRequestPage() {
  const [payload, setPayload] = useState<DiligenceRequestPayload | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [expired, setExpired] = useState(false);
  const [responderRole, setResponderRole] = useState<DiligenceResponsePayload['responderRole']>('recruiter');
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [responseLink, setResponseLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('payload');
    if (!token) {
      setInvalid(true);
      return;
    }
    const decoded = decodeDiligencePayload(token);
    if (!decoded || decoded.type !== 'request') {
      setInvalid(true);
      return;
    }
    setPayload(decoded);
    setExpired(requestExpired(decoded));
    const initial: Record<string, AnswerState> = {};
    decoded.questions.forEach((q) => {
      initial[q.dimension] = { status: 'concrete', answer: '' };
    });
    setAnswers(initial);
  }, []);

  const locale = payload?.locale ?? 'ko';
  const isKo = locale === 'ko';

  const answeredCount = useMemo(
    () => Object.values(answers).filter((x) => x.status === 'declined' || x.answer.trim().length >= 4).length,
    [answers],
  );

  function setAnswer(dimension: string, patch: Partial<AnswerState>) {
    setAnswers((prev) => ({
      ...prev,
      [dimension]: { ...(prev[dimension] ?? { status: 'concrete', answer: '' }), ...patch },
    }));
    setResponseLink('');
    setCopied(false);
  }

  function buildResponseLink() {
    if (!payload) return;

    const responseAnswers: DiligenceResponseAnswer[] = payload.questions
      .map((question) => {
        const answer = answers[question.dimension] ?? { status: 'concrete' as const, answer: '' };
        return {
          ...question,
          status: answer.status,
          answer: answer.answer.trim().slice(0, 1200),
        };
      })
      .filter((item) => item.status === 'declined' || item.answer.length >= 4);

    if (!responseAnswers.length) return;

    const response: DiligenceResponsePayload = {
      v: 1,
      type: 'response',
      requestId: payload.requestId,
      locale: payload.locale,
      createdAt: new Date().toISOString(),
      responderRole,
      returnPath: payload.returnPath,
      answers: responseAnswers,
    };

    const token = encodeDiligencePayload(response);
    setResponseLink(`${window.location.origin}${payload.returnPath}?response=${token}`);
  }

  async function copyResponseLink() {
    if (!responseLink) return;
    await navigator.clipboard.writeText(responseLink);
    setCopied(true);
  }

  if (invalid) {
    return (
      <main className="requestPage" lang="ko">
        <div className="requestShell">
          <p className="eyebrow">CANDIDATE DILIGENCE REQUEST</p>
          <h1>유효하지 않은 요청 링크입니다.</h1>
          <p>질문을 보낸 사람에게 새 링크를 요청해주세요.</p>
        </div>
      </main>
    );
  }

  if (!payload) {
    return (
      <main className="requestPage">
        <div className="requestShell requestLoading">Loading diligence request…</div>
      </main>
    );
  }

  if (expired) {
    return (
      <main className="requestPage" lang={isKo ? 'ko' : 'en'}>
        <div className="requestShell">
          <p className="eyebrow">CANDIDATE DILIGENCE REQUEST</p>
          <h1>{isKo ? '이 요청 링크는 만료되었습니다.' : 'This diligence request has expired.'}</h1>
          <p>{isKo ? '개인정보 노출을 줄이기 위해 요청 링크는 14일 후 만료되도록 설계했습니다. 새 링크를 요청해주세요.' : 'To reduce unnecessary exposure, request links expire after 14 days. Ask the candidate for a new link.'}</p>
        </div>
      </main>
    );
  }

  const labels = isKo
    ? {
        kicker: 'CANDIDATE DILIGENCE REQUEST',
        title: '후보자가 오퍼를 결정하기 전에 몇 가지를 확인하고 싶어 합니다.',
        intro: '후보자의 개인 고민이나 AI 분석은 이 페이지에 포함되지 않습니다. 아래 질문에 공개·공유 가능한 범위에서 구체적으로 답해주세요.',
        role: '답변자 역할',
        concrete: '구체적으로 답변 가능',
        vague: '일부만 답변 가능',
        declined: '공유하기 어려움',
        answer: '답변',
        placeholder: '구체적인 기준, 최근 사례, 문서 위치, 공개 가능한 범위의 숫자 등을 적어주세요.',
        safety: '비공개 고객정보, 소스코드, 영업비밀, 공개할 권한이 없는 재무·계약정보는 입력하지 마세요.',
        generate: '후보자에게 돌려줄 응답 링크 만들기 →',
        ready: '응답 링크가 만들어졌습니다.',
        readyNote: '이 링크에는 아래 답변 내용이 포함됩니다. 링크를 가진 사람은 내용을 볼 수 있으므로 민감정보를 넣지 마세요. 서버 DB에는 별도로 저장하지 않습니다.',
        copy: '응답 링크 복사',
        copied: '복사 완료 ✓',
        identity: '중요: 이 링크는 답변자의 신원을 인증하지 않습니다. 후보자는 내용을 확인한 뒤에만 Evidence로 승격합니다.',
        footer: 'Bandaepyeon · Candidate-owned due diligence',
      }
    : {
        kicker: 'CANDIDATE DILIGENCE REQUEST',
        title: 'A candidate would like to clarify a few things before accepting.',
        intro: 'This page does not contain the candidate’s private decision room or AI analysis. Answer only what you can responsibly share.',
        role: 'Your role',
        concrete: 'Can answer concretely',
        vague: 'Can answer partially',
        declined: 'Cannot share / unavailable',
        answer: 'Response',
        placeholder: 'Share a concrete criterion, recent example, document location, or the most specific non-confidential answer available.',
        safety: 'Do not enter customer data, source code, trade secrets, or financial/contract information you are not authorized to share.',
        generate: 'Create response link for the candidate →',
        ready: 'Your response link is ready.',
        readyNote: 'The link contains the answers below. Anyone with the link can read them, so do not include confidential information. The service does not separately persist this response in a server-side database.',
        copy: 'Copy response link',
        copied: 'Copied ✓',
        identity: 'Important: this link does not authenticate the responder’s identity. The candidate must review it before treating anything as verified evidence.',
        footer: 'Bandaepyeon · Candidate-owned due diligence',
      };

  return (
    <main className="requestPage" lang={isKo ? 'ko' : 'en'}>
      <div className="requestShell">
        <header className="requestHeader">
          <div>
            <p className="eyebrow">{labels.kicker}</p>
            <h1>{labels.title}</h1>
            <p>{labels.intro}</p>
          </div>
          <div className="requestPrivacy">
            <b>{isKo ? 'PRIVATE BY DESIGN' : 'PRIVATE BY DESIGN'}</b>
            <span>{isKo ? '후보자의 분석 결과는 공유되지 않음' : 'Candidate analysis is not shared'}</span>
            <span>{isKo ? '응답 서버 저장 없음' : 'No server-side response storage'}</span>
            <span>{isKo ? '14일 요청 만료' : '14-day request expiry'}</span>
          </div>
        </header>

        <section className="requestRole">
          <label>
            <span>{labels.role}</span>
            <select value={responderRole} onChange={(e) => setResponderRole(e.target.value as DiligenceResponsePayload['responderRole'])}>
              {Object.entries(ROLE_LABELS[locale]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </section>

        <section className="requestQuestions">
          {payload.questions.map((question, index) => {
            const state = answers[question.dimension] ?? { status: 'concrete' as const, answer: '' };
            return (
              <article key={question.dimension}>
                <div className="requestQuestionHead">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div><small>{question.dimension}</small><h2>{question.question}</h2></div>
                </div>

                <div className="requestStatus">
                  <button className={state.status === 'concrete' ? 'active concrete' : ''} onClick={() => setAnswer(question.dimension, { status: 'concrete' })}>{labels.concrete}</button>
                  <button className={state.status === 'vague' ? 'active vague' : ''} onClick={() => setAnswer(question.dimension, { status: 'vague' })}>{labels.vague}</button>
                  <button className={state.status === 'declined' ? 'active declined' : ''} onClick={() => setAnswer(question.dimension, { status: 'declined' })}>{labels.declined}</button>
                </div>

                <label className="requestAnswer">
                  <span>{labels.answer}</span>
                  <textarea
                    maxLength={1200}
                    value={state.answer}
                    onChange={(e) => setAnswer(question.dimension, { answer: e.target.value })}
                    placeholder={state.status === 'declined' ? (isKo ? '공유하기 어려운 이유나 대신 확인 가능한 자료가 있다면 적어주세요.' : 'If useful, explain why it cannot be shared or point to an alternative source.') : labels.placeholder}
                  />
                  <small>{state.answer.length}/1200</small>
                </label>
              </article>
            );
          })}
        </section>

        <p className="requestSafety">{labels.safety}</p>

        <section className="requestReturn">
          <div><strong>{answeredCount}</strong><span>/ {payload.questions.length} {isKo ? '응답 준비' : 'responses ready'}</span></div>
          <button disabled={answeredCount === 0} onClick={buildResponseLink}>{labels.generate}</button>
        </section>

        {responseLink && (
          <section className="requestReady">
            <div>
              <p className="panelLabel">RETURN LINK</p>
              <h3>{labels.ready}</h3>
              <p>{labels.readyNote}</p>
            </div>
            <button onClick={copyResponseLink}>{copied ? labels.copied : labels.copy}</button>
            <small>{labels.identity}</small>
          </section>
        )}

        <footer className="requestFooter">{labels.footer}</footer>
      </div>
    </main>
  );
}
