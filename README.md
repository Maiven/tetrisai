# 반대편 · Startup Employee Due Diligence

> 스타트업 오퍼를 받았다면, 수락하기 전에 아직 확인하지 못한 것을 찾으세요.

반대편은 스타트업 종사자가 회사·역할·리더·보상·학습의 정보 비대칭을 줄이도록 돕는 **Employee-side Startup Due Diligence** 제품입니다.

핵심 카테고리 가설은 **Candidate Diligence Protocol**입니다.

`Candidate asks → Company responds → Response quality → Evidence → Re-diligence`

즉 범용 AI가 결론을 대신 내리는 제품이 아니라, 후보자가 회사와 구조적으로 증거를 교환하는 workflow를 만듭니다.

## Beachhead ICP

초기 제품 학습의 1차 타깃은 다음과 같습니다.

- Seed~Series B
- 약 20~100명 규모
- 3~8년차
- PM/Product, Data/AI, Engineering
- 입사·잔류·이직·리드 역할·보상/스톡옵션처럼 정보 비대칭이 크고 되돌리기 비용이 큰 결정을 앞둔 사람

다른 직군/단계도 사용할 수 있지만, 제품 학습은 이 집단에서 먼저 시작합니다.

## Product thesis

투자자는 회사에 돈을 넣기 전에 due diligence를 합니다.
직원은 시간·경력·평판·네트워크를 넣지만 실사 도구가 거의 없습니다.

반대편은 다음 다섯 영역에서 **무엇이 아직 증명되지 않았는지** 찾습니다.

1. 회사 생존 신호
2. 역할의 실제
3. 리더·의사결정권
4. 현금·지분 보상
5. 학습·다음 선택지

그리고 다음 falsification flow를 적용합니다.

`Evidence Ledger → Counter Case → Flip Condition → Reversibility → Pre-mortem → Smallest Test → STOP RULE`

## What makes it different

- AI가 퇴사/입사를 대신 추천하지 않음
- 회사 단계나 투자유치를 생존 보장으로 해석하지 않음
- 외부 근거 없는 확률/기업가치/지분 미래가치를 만들지 않음
- 옵션 수보다 지분율·행사가격·베스팅·행사기간 등 확인 항목을 구조화
- 회사 성장보다 개인에게 12개월 뒤 남을 증명 가능한 역량을 봄
- 입력 없이 즉시 시작할 수 있는 guided due-diligence path
- 질문마다 채용담당자·직속리더·현직자·공식문서/전문가 중 확인 대상을 명시
- 실제 답변을 '구체적 / 모호 / 회피'로 분리해 Transparency Ledger에 기록
- Candidate Diligence Share Link로 질문만 회사에 보내고, 응답은 확인 필요 상태로 가져옴
- AX Role Reality: 업무 재설계 · 업무 위임 깊이 · 인간 판단권 · 조직 준비도 · 역량 궤적 · 품질/책임을 별도 실사
- AI exposure를 해고 확률로 바꾸지 않고, 실제 task/workflow 증거를 요구
- 실시간 AI 실패 시 로컬 due-diligence framework로 fallback

## Stack

- Next.js 16.3.3
- React 19.2
- Vercel AI SDK 7
- OpenAI GPT-5.6 Sol through Vercel AI Gateway
- Zod structured outputs
- Vercel

## Trust architecture

- no login for MVP
- no personal decision-history database
- no employer/HR access to personal decisions
- user is warned not to enter names, company secrets, non-public financial figures
- future Personal history must be explicit opt-in
- future Teams product must be separated from Personal data

Privacy note: [/privacy](https://decision-mirror-eight.vercel.app/privacy)  
Methodology: [/methodology](https://decision-mirror-eight.vercel.app/methodology)  
AX research synthesis: [docs/AX_RESEARCH_SYNTHESIS_2026.md](./docs/AX_RESEARCH_SYNTHESIS_2026.md)

## Live service

https://decision-mirror-eight.vercel.app

## Business strategy

See [docs/STARTUP_BUSINESS_MODEL.md](./docs/STARTUP_BUSINESS_MODEL.md)

## Direct problem evidence

- Bryan, Hoffman & Sariri, **Information Frictions and Employee Sorting between Start-Ups**, AEJ: Applied Economics (2026)
  - https://www.aeaweb.org/articles?id=10.1257%2Fapp.20240722
  - 스타트업 품질 정보 제공이 실제 지원 배분을 더 높은 평가의 기업 쪽으로 이동시켰고, 동시에 스타트업 성공에 대한 과도한 낙관이 남아 더 넓은 정보 부족 문제를 보여줌.
- AI vs human career counseling (Technology in Society, 2026)
  - https://www.sciencedirect.com/science/article/pii/S0160791X26000904
  - AI는 빠른 정보 제공에 강하지만 인간 상담이 decision self-efficacy와 전체 의사결정 품질에 더 강함. 반대편이 'AI 상담사'가 아니라 evidence workflow여야 하는 근거.

## Research roots

- Gary Klein, *Performing a Project Premortem*
  - https://hbr.org/2007/09/performing-a-project-premortem
- Mitchell, Russo & Pennington, prospective hindsight
  - https://onlinelibrary.wiley.com/doi/10.1002/bdm.3960020103

## Development

```bash
npm install
npm run dev
```
