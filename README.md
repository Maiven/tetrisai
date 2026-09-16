# 반대편 · Decision Mirror

> 결정하기 전, 내가 보지 못한 것을 보는 AI.

Decision Mirror is an AI decision red-team web app built for Wanted AI Championship 2026. It does not choose for the user. It reframes the decision, surfaces hidden assumptions, generates counterarguments, runs a pre-mortem, compares three possible paths, and proposes the smallest reversible experiment that can reduce uncertainty.

## Stack

- Next.js 16.3.3
- React 19.2
- Vercel AI SDK 7
- OpenAI GPT-5.6 Sol through Vercel AI Gateway
- Zod structured outputs
- Vercel deployment / OIDC authentication

## Product principles

1. **No forced recommendation** — the model expands judgment rather than replacing it.
2. **Red-team first** — it intentionally searches for assumptions and counterarguments.
3. **No invented statistics** — claims requiring outside evidence are framed as items to verify.
4. **Fail-safe demo** — if the model call fails, the app returns a local decision framework instead of a 500 page.
5. **Privacy by default** — the MVP does not implement accounts or a decision-history database.

## Development

```bash
npm install
npm run dev
```

For local AI Gateway calls, use a Vercel AI Gateway key or run through Vercel tooling. In production on Vercel, the project is designed to use Vercel OIDC authentication.

## Deploy

[Deploy with Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMaiven%2Ftetrisai%2Ftree%2Fdecision-mirror-vercel&project-name=decision-mirror&repository-name=decision-mirror)

## AI flow

`Decision input → Reframe → Assumption Mining → Counter Agent → Pre-mortem → Possible Futures → Evidence Check → Smallest Reversible Test`

## Safety

Decision Mirror is not a substitute for qualified medical, legal, financial, or other professional advice. The service is designed to surface questions and missing information, not to make high-stakes decisions for users.
