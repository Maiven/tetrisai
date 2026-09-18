# 반대편 · Startup Employee Due Diligence

> 회사보다 먼저, 내 커리어가 투자할 곳을 실사하세요.

반대편은 스타트업 종사자의 입사·잔류·이직·역할·보상·스톡옵션 결정을 검증하는 **Employee-side Startup Due Diligence** 웹앱입니다.

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
- 10초 데모는 모델 장애와 무관하게 즉시 체험 가능
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

## Live service

https://decision-mirror-eight.vercel.app

## Business strategy

See [docs/STARTUP_BUSINESS_MODEL.md](./docs/STARTUP_BUSINESS_MODEL.md)

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
