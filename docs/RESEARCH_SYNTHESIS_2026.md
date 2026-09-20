# Bandaepyeon Research Synthesis 2026
## Employee-side Startup Due Diligence / Candidate Diligence Protocol

> Scope note: this is a structured synthesis of the most decision-relevant academic, industry, and government sources reviewed for the product as of 2026-09-20. It is not a claim to exhaust literally every paper or dataset in existence. The purpose is to convert convergent evidence into product requirements.

---

## Executive conclusion

The strongest research-supported problem is **not "people need more career advice."**

It is:

> **Candidates make high-cost startup career decisions under material information frictions, incomplete role/manager/equity information, and optimism. Better information can change where people apply, but information alone does not eliminate biased beliefs or convert itself into action.**

Therefore the product should not be a recommendation engine. It should be a **Candidate Diligence Protocol**:

`Candidate asks → Company responds → Response quality → Evidence → Re-diligence → Expectation memo → 30/90-day outcome review`

---

# 1. UNIVERSITY / ACADEMIC EVIDENCE

## 1.1 Startup information frictions directly change talent allocation

**Bryan, Hoffman & Sariri (2026), American Economic Journal: Applied Economics**  
Information Frictions and Employee Sorting between Start-Ups  
https://www.aeaweb.org/articles?id=10.1257%2Fapp.20240722

- Field experiment with 26 science-based startups and job seekers.
- Expert startup-quality ratings were randomized across applicants.
- Better information strongly reallocated applications toward higher-rated firms.
- Overoptimistic beliefs about startup success still remained after treatment.

### Product requirement

Do not merely give generic advice.
Surface **claim-specific missing information** and make it easy to obtain better evidence before commitment.

---

## 1.2 Realistic information works partly because it signals organizational honesty

**Earnest, Allen & Landis (2011), Personnel Psychology**  
Mechanisms Linking Realistic Job Previews with Turnover: A Meta-Analytic Path Analysis  
https://onlinelibrary.wiley.com/doi/10.1111/j.1744-6570.2011.01230.x

- Meta-analysis: 52 studies, roughly 17,000 participants.
- Enhanced perceptions of organizational honesty were the primary mechanism linking realistic job previews to voluntary turnover outcomes.

### Product requirement

Record not only *what* the company says but **how concretely it answers**.
This motivates the Transparency Ledger:
- concrete
- vague
- declined
- not asked

A vague or declined answer is not automatically negative evidence. It is a signal that the information gap remains open.

---

## 1.3 Psychological contract breach has broad consequences

**Rees, Brownell & Kickul (2026), Journal of Business and Psychology**  
Beyond Exchange and Affect: An Updated Meta-Analytic Review and Regulatory Framework for Psychological Contract Breach  
https://link.springer.com/article/10.1007/s10869-026-10123-1

- Updated meta-analysis covering 91 correlates and k=517.
- Breach is associated with lower job satisfaction, commitment, engagement, justice perceptions, and other outcomes.
- Effects are broad enough that breach should be understood as a self-regulatory disruption, not simply disappointment.

Earlier foundational meta-analysis:
**Zhao et al. (2007), Personnel Psychology**  
https://onlinelibrary.wiley.com/doi/10.1111/j.1744-6570.2007.00087.x

### Product requirement

Before acceptance, convert important verbal/documented expectations into an **Expectation Memo**:
- 90-day outcomes
- real decision rights
- manager/feedback cadence
- cash/equity conditions
- learning promise
- unresolved items

Revisit at 30/90 days to identify the promise gap.

---

## 1.4 Alternative quality matters more than simply having alternatives

**Harari, Rubenstein, McCombs & Dennett (2025), Journal of Managerial Psychology**  
A meta-analysis of perceived job alternatives and employee turnover  
https://doi.org/10.1108/JMP-12-2023-0775

- Both perceived alternative availability and quality relate to turnover.
- Relative-weight analysis found the effect of alternative quality was nearly three times stronger than availability.

### Product requirement

Do not ask only "Do I have another offer?"
Compare alternatives on:
- skill evidence
- scope
- manager quality
- career capital
- reversibility
- network
- future options

---

## 1.5 AI should augment decision process, not replace judgment

**Yang, Xie & Wu (2026), Technology in Society**  
Can AI be a good counselor? Comparing the effectiveness of AI and human career counseling  
https://www.sciencedirect.com/science/article/pii/S0160791X26000904

- Three-week controlled career-counseling trial.
- GenAI excelled at rapid information delivery.
- Human counseling performed better for career-decision self-efficacy and overall decision quality.

**Microsoft Research / CHI 2025**  
Fostering Appropriate Reliance on Large Language Models  
https://www.microsoft.com/en-us/research/publication/fostering-appropriate-reliance-on-large-language-models-the-role-of-explanations-sources-and-inconsistencies/

- Explanations can increase reliance on both correct and incorrect AI responses.
- Sources and inconsistencies can reduce reliance on incorrect responses.

**Microsoft Research / CHI 2025**  
AI, Help Me Think—but for Myself  
https://www.microsoft.com/en-us/research/wp-content/uploads/2025/03/AI-Help-Me-Think-CHI-2025.pdf

- Complex decisions benefit from process-oriented cognitive support rather than one final prediction.

**CSCW 2025**  
Cognitive Forcing for Better Decision-Making  
https://doi.org/10.1145/3710946

### Product requirement

No:
- accept/reject score
- company survival probability
- AI confidence theater
- one-shot final answer

Yes:
- sources
- contradictions
- unknowns
- flip conditions
- user-generated evidence
- re-analysis
- explicit stop rules

---

# 2. INDUSTRY EVIDENCE

## 2.1 Startup teams are smaller and equity is more material

**Carta, State of Startup Compensation H2 2025 (published 2026)**  
https://carta.com/data/startup-compensation-h2-2025/

- Series B average headcount fell from 53 in 2023 to 45 in 2025.
- Seed median team size is about four.
- Median initial equity grants across ICs rose ~11% over two years.
- AI/ML engineer median initial equity grants rose 31% between Jan 2024 and Feb 2026.

### Product requirement

Role reality and equity diligence should be first-class, not secondary to salary.

---

## 2.2 People already pay for startup-offer evaluation

**Levels.fyi Services**  
https://www.levels.fyi/services/

- Startup Offer Evaluation: $250.
- Startup Package: $1,250.

### Product requirement

The paid wedge should be **one high-stakes decision**, not a generic monthly chatbot subscription.

---

## 2.3 Employees report an equity education gap

**Secfi Equity Education Survey (2025)**  
https://secfi.com/learn/equity-education-survey

Survey of 1,000+ startup employees who exercised options:
- 75% said stock options were important in joining.
- 87% valued equity education.
- 57% reported companies were not doing enough to educate them.

Vendor-sponsored survey; treat as a market signal, not population truth.

### Product requirement

Equity questions must route to:
- grant agreement
- plan documents
- exercise/vesting terms
- qualified local tax/legal professionals

Never infer future value.

---

## 2.4 Candidate experience itself is interpreted as a company signal

**Greenhouse Candidate Experience Report (2024)**  
https://www.greenhouse.com/blog/2024-greenhouse-candidate-experience-report

- Industry survey indicates candidates care about communication and transparency.
- 20% reported rejecting an offer due to poor interview experience.
- 52% reported being ghosted.

Vendor survey; use directionally.

### Product requirement

Transparency Ledger should capture recruiter/manager response quality without turning it into an unsupported company rating.

---

# 3. GOVERNMENT / REGULATORY EVIDENCE

## 3.1 European Union — pay transparency is becoming an applicant right

**Directive (EU) 2023/970, Article 5**  
https://eur-lex.europa.eu/eli/dir/2023/970/oj/eng

Applicants have rights to receive:
- initial pay or pay range before employment
- relevant collective-agreement provisions where applicable

Employers shall not ask applicants about pay history.
Member states were required to transpose the Directive by June 2026; implementation details remain national.

European Commission explanation:
https://commission.europa.eu/news-and-media/news/new-eu-rules-pay-transparency-explained-2026-06-05_en

### Product requirement

In EU contexts:
- prompt users to verify the applicable national implementation
- distinguish statutory transparency from company goodwill
- never hard-code one country's implementation details without current official evidence

---

## 3.2 United States — employee equity disclosures can have formal securities-law hooks

**U.S. SEC, Rule 701**  
https://www.sec.gov/resources-small-businesses/exempt-offerings/employee-benefit-plans-rule-701-0

- Rule 701 governs certain compensatory securities offerings by non-reporting companies.
- If sales exceed $10M in a 12-month period, certain financial and other disclosure is required.
- Securities issued under Rule 701 are restricted securities.

Updated SEC C&DI:
https://www.sec.gov/rules-regulations/staff-guidance/corporation-finance-interpretations/securities-act-rules

### Product requirement

For U.S. equity:
- ask whether Rule 701 materials apply
- route to official plan/grant documents
- never present a generic "you are entitled to X" conclusion without facts

---

## 3.3 United Kingdom — EMI terms are specific and change over time

**HMRC Enterprise Management Incentives guidance**  
https://www.gov.uk/tax-employee-share-schemes/enterprise-management-incentives-emis

HMRC manuals updated in 2026 document:
- eligibility
- exercise periods
- tax treatment
- required option terms

### Product requirement

Do not translate U.S. startup-option concepts directly into UK offers.
Ask whether the plan is EMI and verify from current HMRC guidance and plan documents.

---

## 3.4 Korea — venture stock-option rules are statutory

**Korea Venture Business Act, Article 16-3**  
https://www.law.go.kr/lsInfoP.do?lsiSeq=271307

The Act specifies who venture companies may grant stock options to and recognized grant structures.

**Ministry of SMEs and Startups venture survey**  
https://www.mss.go.kr/site/smba/ex/bbs/View.do?bcIdx=1064346&cbIdx=86

2024 base:
- 38,216 confirmed venture firms
- 828,000 employees
- KRW 236T sales

### Product requirement

Korean equity flow should link to official law and distinguish statutory terms from company-specific plan terms.

---

## 3.5 U.S. Department of Labor — job content can be represented structurally

**O*NET, U.S. Department of Labor**  
https://www.dol.gov/agencies/eta/onet

O*NET structures occupations by:
- knowledge
- skills
- abilities
- tasks
- work activities
- work context

### Product requirement

Long-term Role Reality can compare:
- offer claims
- actual startup scope
- occupational baseline
- 90-day outcomes

This helps separate title inflation from real role content.

---

## 3.6 NIST — GenAI requires explicit risk management

**NIST AI RMF / GenAI Profile**  
https://www.nist.gov/itl/ai-risk-management-framework  
https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence

NIST frames trustworthy AI through governance, mapping, measurement, and management and provides a GenAI risk profile.

### Product requirement

Bandaepyeon should maintain:
- provenance
- source separation
- failure-safe fallback
- no fabricated certainty
- human decision authority
- documented AI limitations
- test/evaluation cases

---

# 4. PRODUCT SYNTHESIS

## The product should own five layers

### Layer 1 — Decision Ontology
What must be checked?

### Layer 2 — Evidence Protocol
What counts as evidence?

Evidence ladder:
1. official plan / contract / regulatory document
2. concrete answer from accountable owner
3. concrete example from current employee
4. verified public company source
5. credible third-party source
6. anonymous review / anecdote
7. AI inference — **never evidence**

### Layer 3 — Transparency Ledger
How did the company respond?

- concrete
- vague
- declined
- unavailable
- conflicting

### Layer 4 — Expectation Memo
What exactly do candidate and company think the role will be?

- first 90-day outcomes
- decision rights
- manager cadence
- cash/equity terms
- learning / career-capital promise
- unresolved items

### Layer 5 — Outcome Calibration
What happened after 30 / 90 days?

- which promises held
- which assumptions failed
- which questions were most predictive
- what the user wishes they had checked

This is the beginning of an opt-in **Decision Outcome Graph**.

---

# 5. THE CATEGORY

Do not position as:
- AI career counselor
- job review site
- salary calculator
- company rating engine
- automated recruiter

Position as:

# **Candidate Diligence Infrastructure**

or customer-facing:

# **Startup Offer Due Diligence**

The novel product thesis is not that each component is unprecedented.

The thesis is that the labor market lacks a candidate-owned, privacy-preserving protocol connecting:

`offer → unknowns → structured requests → response quality → evidence → expectations → outcome`

---

# 6. WHAT WOULD FALSIFY THE BUSINESS THESIS

The product should be abandoned or materially repositioned if real users show that:

1. actual offer-holders do not send diligence requests,
2. recruiters/managers rarely answer even safe, specific questions,
3. users do not return after receiving answers,
4. new evidence rarely changes decisions,
5. users will not pay at the decision deadline,
6. recruiting/VC partners reject privacy-safe sponsored access,
7. users prefer a human coach at a price point too close to the product's own economics.

The next proof is behavioral, not another literature review.

---

# 7. REQUIRED PRODUCT METRICS

North Star:
**Material Evidence Closure Rate**

Supporting:
- Time to First Useful Question
- Candidate Diligence Request Copy / Send Rate
- Concrete Answer Rate
- Vague / Declined Response Rate
- Evidence Triangulation Rate
- Re-diligence Rate
- Expectation Memo Completion Rate
- 30/90-Day Promise Gap
- Would-Decide-the-Same Rate
- Paid Conversion at actual offer deadline

No metric should reward the AI for persuading the user to join or leave.
