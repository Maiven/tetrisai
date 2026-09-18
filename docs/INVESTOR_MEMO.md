# 반대편 (Bandaepyeon)
## Pre-seed Investor Memo — 2026-09-19

> **Employees invest years of career into startups with less diligence than investors use before wiring money.**
>
> 반대편은 스타트업 종사자가 입사·잔류·이직·역할·보상 결정을 내리기 전에
> 회사·역할·리더·보상·학습을 증거 기반으로 실사하는 Employee-side Decision Intelligence 제품이다.

---

## 1. Problem

스타트업 종사자는 다음을 동시에 겪는다.

- 회사 정보는 비대칭적이다.
- 역할·의사결정권은 채용공고와 다르게 작동할 수 있다.
- 보상은 현금과 equity를 함께 비교해야 한다.
- 조직 변화가 빠르다.
- 잘못된 선택의 비용은 수개월~수년의 경력이다.
- 범용 AI는 설득력 있는 조언을 만들 수 있지만 실제 내부 사실을 알지 못한다.

현재의 대안은 흩어져 있다.

- 친구/커뮤니티에 질문
- 범용 AI 장단점 정리
- 연봉/스톡옵션 계산기
- 유료 커리어 코치
- 직접 회사에 질문

문제는 **이 정보와 행동이 하나의 verification workflow로 연결되지 않는 것**이다.

---

## 2. Wedge

### Beachhead ICP

- Korea-first
- Seed~Series B
- 20~100 employees
- 3~8 years experience
- PM/Product, Data/AI, Engineering
- trigger moment:
  - startup offer
  - stay vs leave
  - lead/promotion without clear authority
  - equity/option offer
  - financing delay / hiring freeze / reorg

The product can serve adjacent segments, but product learning begins here.

---

## 3. Product

### One-sentence experience

**고민 한 문장 → 아직 모르는 것 발견 → 실제 질문 → 공개 자료 조사 → 증거 확보 → 재실사**

### Core workflow

1. Natural-language decision
2. Startup Decision Ontology
3. 5-Lens Due Diligence
4. Evidence Ledger
5. Reality Check
6. Flip Conditions
7. Public Evidence Agent
8. 10min → 24h → 7d Verification Sprint
9. Evidence Loop
10. Decision Passport
11. Outcome follow-up (next)

### 5-Lens

- Company viability signals
- Role reality
- Leadership & decision rights
- Cash & equity
- Learning & future options

---

## 4. Why now

### Startup teams are getting leaner

Carta reported in 2026 that median Seed team size is about four employees and average Series B headcount fell from 53 to 45 from 2023 to 2025. Smaller teams increase individual responsibility and make role quality/decision rights more material.

Source:
https://carta.com/data/startup-compensation-h2-2025/

### Equity is becoming more material for technical talent

Carta reported median initial equity grants for AI/ML engineers increased substantially from 2024 to 2026.

Source:
https://carta.com/data/startup-compensation-h2-2025/

### Korea has a meaningful venture workforce

Korea's Ministry of SMEs and Startups reported 38,216 venture companies and 828,000 employees for 2024.

Source:
https://www.mss.go.kr/site/smba/ex/bbs/View.do?bcIdx=1064346&cbIdx=86

### Venture investment has recovered

Korean venture investment reached KRW 13.6T in 2025, with 8,542 deals.

Source:
https://mss.go.kr/site/eng/ex/bbs/View.do?bcIdx=1065679&cbIdx=244

### AI application moat is shifting toward process and data

Recent investor theses increasingly emphasize process engineering, systems of work/action, and data captured inside workflow—not access to a foundation model alone.

Sources:
- https://a16z.com/good-news-ai-will-eat-application-software/
- https://a16z.com/services-led-growth/
- https://a16z.com/insights-for-enterprise-ai-builders/

---

## 5. Why this is not a generic AI wrapper

### Startup Decision Ontology

Modular domain ontology:
Decision / Company / Role / Leadership / Compensation / Learning / Evidence / Action

### Typed Decision Graph

Decision
→ Dimension
→ Claim / Unknown
→ Evidence
→ Question
→ Flip Condition
→ Verification Action

### Provenance

Every graph element distinguishes:
- user_input
- user_verified
- public_source
- model_structured
- system_ontology

### Semantic constraints

The service checks:
- all five due-diligence lenses exist
- every lens has a verification question
- graph relations reference valid nodes

### Evidence Loop

The model's first answer is not treated as final.
Real-world answers and public evidence re-enter the graph and trigger a new analysis.

---

## 6. User value

The MVP does **not** claim to improve decision accuracy by an unvalidated percentage.

Its measurable value is:

1. make unknowns visible
2. create specific verification questions
3. get the user to execute at least one verification action
4. convert unknowns into evidence
5. update the decision when new evidence arrives

---

## 7. North Star

### Evidence Closure Rate

**% of active decision rooms where at least one material unknown becomes user-verified evidence within 7 days**

Supporting metrics:

- First Analysis Completion
- Time to First Useful Question
- Question Copy Rate
- Public Evidence Search Rate
- Evidence Action Rate
- 7-Day Decision Revisit Rate
- Unknown → Verified Conversion
- Decision Calibration Change
- 30/90-day Decision Regret / Would-you-decide-the-same

Avoid:
- AI recommendation acceptance rate
- number of users pushed to quit/join
- artificial "decision score"

---

## 8. Retention loop

One-shot career questions are naturally low-frequency.

The retention strategy is not to manufacture daily usage.

### Correct loop

Trigger decision
→ initial diligence
→ 7-day evidence sprint
→ revisit
→ decision
→ 30-day outcome
→ 90-day outcome
→ next career decision

This becomes a **Decision Passport**, not a daily chatbot.

MVP persistence is local-first and opt-in.
Cloud history should only be added after trust and retention are validated.

---

## 9. Distribution

### Channel 1 — recruiting outcome moment

Best moment:
**offer received**, not job browsing.

Integration:
"오퍼를 받았나요? 연봉만 비교하지 말고 5-Lens로 실사하세요."

Potential channels:
- recruiting platforms
- recruiting agencies
- career communities

### Channel 2 — VC / accelerator employee benefit

Sponsor buys access.
Employee owns content.
Sponsor never sees individual decisions.

### Channel 3 — SEO / high-intent content

Keywords around:
- startup offer
- startup equity
- stay vs leave
- startup runway question
- startup role scope
- stock option exercise
- startup reorg

### Channel 4 — shareable question packs

The viral object is not
"AI says quit."

It is:
**"These are the 3 questions that could change my decision."**

---

## 10. Monetization

### Free — Decision Check
Acquisition and trust.

### One-off — Deep Diligence Pass
Initial price test:
KRW 9,900 / 14,900 / 19,900

Possible paid value:
- two-option comparison
- deeper source audit
- offer/equity question pack
- 7-day follow-up
- export/private report

### Personal Pro — Decision Passport
Only after repeat use is proven.

### B2B2C — Sponsored Access
Recruiting platform / VC / accelerator pays.
No employee-level data access.

### Later — Teams
Separate product and separate data boundary.

---

## 11. Trust moat

The user's concern must never become the employer's surveillance product.

Never:
- sell individual decision text
- expose personal stay/leave analysis to HR
- generate flight-risk scores from Personal data
- merge Personal and Teams decision histories
- claim startup survival probability without defensible evidence

Brand principle:

> **직원의 고민은 회사의 데이터가 아니다.**

---

## 12. 12-month product path

### 0–4 weeks — Problem proof
- 30 user interviews
- 100 activated users
- identify the strongest single trigger moment
- measure Time to First Useful Question
- measure Evidence Action Rate

### Month 2–3 — Paid proof
- launch Deep Diligence Pass
- first 20 paid transactions
- measure willingness to pay by trigger
- remove low-value workflows

### Month 4–6 — Outcome graph
- opt-in account/history
- 7/30/90-day follow-up
- Decision Graph diff
- evidence/outcome linking

### Month 7–9 — Distribution proof
- one recruiting/community partnership
- one VC/accelerator sponsored pilot
- privacy-safe cohort reporting only

### Month 10–12 — Repeatable wedge
- prove one acquisition channel
- prove one paid trigger
- prove evidence closure predicts retained value
- decide whether to stay career-focused or expand into adjacent high-ambiguity decisions

---

## 13. What must be true before fundraising

A compelling pre-seed story should have evidence for at least these:

1. **Pain** — users already try to solve this manually.
2. **Activation** — they reach a useful question quickly.
3. **Behavior change** — they actually ask/check something in the real world.
4. **Return** — a meaningful share comes back with evidence.
5. **WTP** — some users pay at the decision moment.
6. **Distribution** — one channel produces users cheaper/faster than founder-led outreach.
7. **Trust** — confidential-decision users are willing to return.

Do not raise on "ontology + LLM" alone.
Raise when the product demonstrates that the ontology/evidence loop changes behavior and accumulates a unique decision graph.

---

## 14. Current MVP proof points

Implemented:

- login-free public service
- 10-second deterministic demo
- 5-Lens Startup Due Diligence
- falsification / flip condition
- realistic negative preview
- source audit for sanitized job/offer excerpts
- live Public Evidence Agent
- web sources
- Evidence Loop
- ontology-guided prompting
- typed Decision Graph
- provenance
- semantic validation
- JSON-LD ontology endpoint
- Evidence Closure metrics
- local-first 7-day Decision Passport
- safe fallback
- no forced recommendation
- no fake survival/confidence score

Live:
https://decision-mirror-eight.vercel.app

Ontology:
https://decision-mirror-eight.vercel.app/api/ontology
