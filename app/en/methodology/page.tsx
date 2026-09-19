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
