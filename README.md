# 반대편 · Falsify Before You Decide

> 결론이 맞다는 이유보다, 틀렸다는 증거부터 찾는 AI.

반대편은 Wanted AI Championship 2026을 위해 만든 AI 의사결정 검증 웹앱입니다. 사용자의 선택을 대신 추천하지 않고, 사용자가 가진 정보를 **사실 / 가정 / 미확인**으로 분리한 뒤 현재 결론을 뒤집을 수 있는 조건, 실패 신호, 되돌리기 비용, 가장 작은 검증 행동을 구조화합니다.

## Why this exists

범용 생성형 AI는 매우 설득력 있는 설명을 만들 수 있습니다. 중요한 결정에서는 그 설득력이 사용자의 기존 확신을 더 강하게 만들 수 있습니다.

반대편은 정반대의 질문을 던집니다.

**"무엇이 나오면 이 결론이 틀렸다고 인정할 것인가?"**

## Core protocol

`Decision → Reframe → Evidence Ledger → Counter Case → Flip Condition → Reversibility → Pre-mortem → Smallest Reversible Test → Decision Card`

### 1. Evidence Ledger
사용자의 문장을 사실, 가정, 미확인으로 분리합니다.

### 2. Flip Condition
현재 결론을 실제로 뒤집을 수 있는 새로운 사실이나 관찰 조건을 미리 정합니다.

### 3. Reversibility Check
선택 자체가 아니라, 잘못 선택했을 때 되돌리는 시간·돈·경력·관계 비용을 봅니다.

### 4. Pre-mortem
결정이 이미 실패했다고 가정하고 실패 원인과 조기 경보 신호를 역추적합니다.

### 5. Smallest Reversible Test
큰 결정을 확정하기 전에 가장 저렴하고 되돌릴 수 있는 검증 행동을 제안합니다.

## Stack

- Next.js 16.3.3
- React 19.2
- Vercel AI SDK 7
- OpenAI GPT-5.6 Sol through Vercel AI Gateway
- Zod structured outputs
- Vercel deployment / OIDC authentication

## AI architecture

- **Context parsing**: GPT-5.6 Sol interprets free-form decision context.
- **Structured output**: Zod schema constrains the response to inspectable decision primitives.
- **Human agency**: the model does not output a forced A/B recommendation.
- **No invented statistics**: externally verifiable numbers are not fabricated.
- **Failure-safe**: live AI failure returns a local falsification framework instead of an error page.
- **Instant demo**: the championship demo is precomputed and does not depend on a live model call.

## Research roots

- Gary Klein, *Performing a Project Premortem*, Harvard Business Review  
  https://hbr.org/2007/09/performing-a-project-premortem
- Mitchell, Russo & Pennington (1989), *Back to the future: Temporal perspective in the explanation of events*, Journal of Behavioral Decision Making  
  https://onlinelibrary.wiley.com/doi/10.1002/bdm.3960020103

## Privacy & safety

- No login or account is required.
- The MVP does not implement a decision-history database.
- Users are warned not to enter names, contact details, or confidential company information.
- AI requests may pass through the configured model-provider path even though the app itself does not persist decision history.
- Medical, legal, investment, and other high-stakes decisions require relevant professional and official-source review.

## Live service

https://decision-mirror-eight.vercel.app

## Development

```bash
npm install
npm run dev
```
