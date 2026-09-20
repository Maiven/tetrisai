export const metadata = {
  title: 'Privacy Principles · Bandaepyeon',
  description: 'Privacy and employee-trust principles for Bandaepyeon Decision Due Diligence.',
};

export default function EnglishPrivacyPage() {
  return (
    <main className="legalPage researchPage">
      <a className="legalBack" href="/en">← Back to Bandaepyeon</a>
      <p className="eyebrow">EMPLOYEE TRUST CHARTER</p>
      <h1>Your career decision is<br />not your employer's dataset.</h1>
      <p className="legalLead">Bandaepyeon is built for people making sensitive career decisions. Privacy is part of the product architecture, not a footer checkbox.</p>

      <section>
        <h2>What the current product does not do</h2>
        <ul>
          <li>No login is required for the core diligence flow.</li>
          <li>We do not operate a server-side personal decision-history database in the current MVP.</li>
          <li>Employers, HR teams, investors, and sponsors do not get access to an individual's decision text or analysis.</li>
          <li>We do not turn personal decision content into employer-facing flight-risk scores.</li>
        </ul>
      </section>

      <section>
        <h2>AI and search processing</h2>
        <p>When you run live diligence or public-evidence research, the text needed for that request may be processed through the hosting, search, and AI-provider path configured by the service. Do not enter secrets that are not necessary for the analysis.</p>
      </section>

      <section>
        <h2>Do not enter</h2>
        <p>Personal identifiers, customer data, secret financials, private source code, API keys, confidential contracts, undisclosed cap-table information, or non-public company metrics. Anonymized context is usually enough.</p>
      </section>

      <section>
        <h2>Candidate Diligence Share Links</h2>
        <p>A request link contains only the diligence questions the candidate chooses to share. It does not include the candidate’s original private decision prompt, AI analysis, or full Decision Passport.</p>
        <p>The current Share Link v1 is stateless: the service does not separately persist the request or response in a server-side database. Instead, the response content is encoded into the return URL itself. <b>Anyone who has that response link can read the answers.</b> Do not put confidential financials, customer information, contract text, source code, or trade secrets into a response.</p>
        <p>The link also does not authenticate the responder’s identity. Imported link responses first enter a “review required” state and are not automatically promoted to verified evidence.</p>
      </section>

      <section>
        <h2>Decision Passport</h2>
        <p>If you choose to save a Decision Passport in the current product, it is stored in your browser's local storage. You can remove it from the product UI or by clearing browser storage. Cloud history should only be introduced with explicit opt-in and clear deletion/export controls.</p>
      </section>

      <section>
        <h2>Jurisdiction matters</h2>
        <p>Employment, equity, securities, and tax rules vary by country and sometimes by where you work versus where the company is incorporated. Bandaepyeon does not replace qualified local legal, tax, or financial advice.</p>
      </section>

      <p className="legalDate">Global privacy note · 2026-09-20</p>
    </main>
  );
}
