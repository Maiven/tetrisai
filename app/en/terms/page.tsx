export const metadata = {
  title: 'Terms · Bandaepyeon',
  description: 'Product terms and important limitations for Bandaepyeon Decision Due Diligence.',
};

export default function EnglishTermsPage() {
  return (
    <main className="legalPage researchPage">
      <a className="legalBack" href="/en">← Back to Bandaepyeon</a>
      <p className="eyebrow">PRODUCT TERMS · PLAIN LANGUAGE</p>
      <h1>Use the product as a<br />verification tool, not an oracle.</h1>
      <p className="legalLead">These plain-language terms describe the current product boundaries. Formal commercial terms should be reviewed before paid launch in each target market.</p>

      <section>
        <h2>What Bandaepyeon provides</h2>
        <p>A structured decision-diligence workflow that helps you identify assumptions, missing evidence, verification questions, public signals, and reversible next steps.</p>
      </section>

      <section>
        <h2>What it does not provide</h2>
        <ul>
          <li>No guarantee that a company will survive, grow, raise funding, or create liquidity.</li>
          <li>No guarantee of salary, negotiation, promotion, or investment outcomes.</li>
          <li>No legal, tax, securities, immigration, or employment-law advice.</li>
          <li>No instruction to accept, reject, resign, invest, or exercise equity.</li>
        </ul>
      </section>

      <section>
        <h2>Your responsibility</h2>
        <p>Verify material facts using official documents, the company, qualified local professionals, and your own judgment. Do not upload confidential information you do not have the right to share.</p>
      </section>

      <section>
        <h2>Public evidence</h2>
        <p>Public web information can be incomplete, stale, disputed, or context-dependent. A public signal is not the same as an internal company fact. Absence of public evidence is not treated as negative evidence.</p>
      </section>

      <section>
        <h2>Global use</h2>
        <p>The service may be used across jurisdictions, but employment and equity rules differ by country and individual circumstances. Before paid global launch, local consumer, privacy, tax, and digital-service requirements should be reviewed for each served market.</p>
      </section>

      <p className="legalDate">Plain-language product terms · 2026-09-19</p>
    </main>
  );
}
