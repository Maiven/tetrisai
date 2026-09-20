export const metadata = {
  title: 'Methodology · Bandaepyeon',
  description: 'How Bandaepyeon combines startup decision ontology, evidence loops, public research, and calibrated human-AI reliance.',
};

export default function EnglishMethodologyPage() {
  return (
    <main className="legalPage researchPage">
      <a className="legalBack" href="/en">← Back to Bandaepyeon</a>
      <p className="eyebrow">METHODOLOGY</p>
      <h1>A verification workflow,<br />not a recommendation engine.</h1>
      <p className="legalLead">Bandaepyeon is designed to make uncertainty inspectable. AI structures the decision; reality still has to supply the evidence.</p>

      <section>
        <h2>Why this problem is real</h2>
        <div className="researchCards">
          <article>
            <span>STARTUP INFORMATION FRICTIONS · 2026</span>
            <b>Better information changed where job seekers actually applied.</b>
            <p>A 2026 American Economic Journal: Applied Economics study worked with 26 science-based startups and randomized whether applicants saw expert quality ratings. Showing better information shifted applications toward higher-rated firms, while overly optimistic beliefs about startup success still persisted.</p>
            <a href="https://www.aeaweb.org/articles?id=10.1257%2Fapp.20240722" target="_blank" rel="noreferrer">AEJ: Applied Economics, 2026 ↗</a>
          </article>
          <article>
            <span>ORGANIZATIONAL HONESTY</span>
            <b>How a company answers can itself be informative.</b>
            <p>A meta-analysis covering roughly 17,000 participants identified perceived organizational honesty as a primary mechanism linking realistic job previews with voluntary turnover. This motivates Bandaepyeon's separate Transparency Ledger for concrete, vague, and declined answers.</p>
            <a href="https://onlinelibrary.wiley.com/doi/10.1111/j.1744-6570.2011.01230.x" target="_blank" rel="noreferrer">Personnel Psychology meta-analysis ↗</a>
          </article>
          <article>
            <span>AI ≠ CAREER COUNSELOR · 2026</span>
            <b>AI should structure evidence, not replace human judgment.</b>
            <p>A three-week 2026 comparison found generative AI strong at rapid information delivery, while human counseling performed better on career decision self-efficacy and overall decision quality. Bandaepyeon therefore uses AI to structure unknowns and actions rather than to choose for the user.</p>
            <a href="https://www.sciencedirect.com/science/article/pii/S0160791X26000904" target="_blank" rel="noreferrer">Technology in Society, 2026 ↗</a>
          </article>
        </div>
      </section>

      <section>
        <h2>The global 5-Lens model</h2>
        <div className="legalGrid">
          <div><b>Company viability</b><p>What can be publicly or directly verified about financing milestones, operating signals, and what must still be asked.</p></div>
          <div><b>Role reality</b><p>Success criteria, real decision rights, boundaries, and the work you are actually expected to own.</p></div>
          <div><b>Leadership & decision rights</b><p>Feedback cadence, conflict behavior, delegation, and who really decides priorities.</p></div>
          <div><b>Cash & equity</b><p>Cash, ownership basis, strike/exercise terms, vesting, liquidity, and jurisdiction-specific questions that need official verification.</p></div>
          <div><b>Learning & future options</b><p>What skills, evidence, network, and future options remain even if the startup outcome is disappointing.</p></div>
        </div>
      </section>

      <section>
        <h2>AX Role Reality · AI Transformation</h2>
        <p>Bandaepyeon does not measure AX by counting AI licenses. It audits how AI changes the work system the candidate is about to enter: work redesign, delegation depth, human agency, organizational readiness, skill trajectory, and quality/accountability.</p>
        <div className="legalGrid">
          <div><b>Work redesign</b><p>Which workflow steps, handoffs, and role boundaries have actually changed?</p></div>
          <div><b>Delegation depth</b><p>NON-AX → information processing → bounded task execution → goal-based planning/execution, only when evidence supports it.</p></div>
          <div><b>Human agency</b><p>Which decisions, exceptions, approvals, and outcomes remain human-owned?</p></div>
          <div><b>Organization readiness</b><p>Sanctioned tools, data access, governance, manager support, and repeatable workflows.</p></div>
          <div><b>Skill trajectory</b><p>Whether AI use builds durable judgment and expertise or merely increases delegation.</p></div>
          <div><b>Quality & accountability</b><p>How AI-assisted work is evaluated, reviewed, escalated, and owned.</p></div>
        </div>
        <p>ILO research is used as a guardrail: AI exposure is a signal of possible task transformation, not a direct forecast of layoffs. KIET's 2026 task-delegation framework informs the Delegation Depth model; Microsoft 2026 informs the individual × organization readiness mismatch; NBER, Deloitte, McKinsey, PwC, and Stanford inform the distinction between tool access and real work redesign.</p>
        <div className="officialLinks">
          <a href="https://www.ilo.org/publications/generative-ai-and-jobs-2025-update" target="_blank" rel="noreferrer">ILO ↗</a>
          <a href="https://www.kiet.re.kr/research/economyDetailView?detail_no=3237" target="_blank" rel="noreferrer">KIET ↗</a>
          <a href="https://www.microsoft.com/en-us/worklab/work-trend-index/agents-human-agency-and-the-opportunity-for-every-organization" target="_blank" rel="noreferrer">Microsoft WTI ↗</a>
          <a href="https://www.nber.org/papers/w33795" target="_blank" rel="noreferrer">NBER ↗</a>
          <a href="https://www.deloitte.com/us/en/insights/industry/technology/path-to-agentic-transformation.html" target="_blank" rel="noreferrer">Deloitte ↗</a>
          <a href="https://www.pwc.com/gx/en/1/services/ai/ai-jobs-barometer.html" target="_blank" rel="noreferrer">PwC ↗</a>
          <a href="https://hai.stanford.edu/ai-index/2026-ai-index-report/economy" target="_blank" rel="noreferrer">Stanford AI Index ↗</a>
        </div>
      </section>

      <section>
        <h2>Evidence Loop</h2>
        <ol>
          <li>Frame the decision and current hypothesis.</li>
          <li>Separate facts, assumptions, and unknowns.</li>
          <li>Create counter-cases and flip conditions.</li>
          <li>Audit public job/offer language without treating promises as reality.</li>
          <li>Research public evidence and keep it separate from user-verified evidence.</li>
          <li>Ask recruiters, managers, employees, and official documents for missing evidence.</li>
          <li>Re-run the diligence when new evidence arrives.</li>
        </ol>
      </section>

      <section>
        <h2>Ontology-guided architecture</h2>
        <p>The product uses a modular Startup Decision Ontology covering Decision, Company, Role, Leadership, Compensation, Learning, Evidence, and Action. The resulting Decision Graph tracks provenance so user input, public sources, user-verified evidence, and model-structured outputs do not collapse into one undifferentiated AI answer.</p>
        <p><a href="/api/ontology" target="_blank" rel="noreferrer">View the machine-readable ontology JSON-LD ↗</a></p>
      </section>

      <section>
        <h2>Why no AI confidence score?</h2>
        <p>For high-ambiguity career decisions, a polished probability can create false precision. Bandaepyeon keeps unknowns explicit and measures progress through evidence closure rather than an invented “good decision” score.</p>
      </section>

      <section>
        <h2>Global jurisdiction principle</h2>
        <p>Equity, employment, tax, and securities rules differ across countries. Region context changes the questions the system asks, but it does not turn the model into a local lawyer or tax adviser. Official plan documents and qualified local professionals remain the authoritative source for regulated questions.</p>
      </section>

      <p className="legalDate">Global methodology · 2026-09-19</p>
    </main>
  );
}
