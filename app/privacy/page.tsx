export const metadata = {
  title: '프라이버시 원칙 · 반대편',
  description: '반대편 Startup Employee Due Diligence MVP의 데이터 처리와 직원 편 프라이버시 원칙',
};

export default function PrivacyPage() {
  return (
    <main className="legalPage">
      <a className="legalBack" href="/">← 반대편으로 돌아가기</a>
      <p className="eyebrow">EMPLOYEE TRUST CHARTER · MVP</p>
      <h1>직원의 고민은<br />회사의 데이터가 아닙니다.</h1>
      <p className="legalLead">반대편은 스타트업 종사자가 회사·역할·리더·보상에 관한 민감한 결정을 검증하는 도구입니다. 그래서 프라이버시는 부가 기능이 아니라 제품 원칙입니다.</p>

      <section>
        <h2>현재 MVP가 하지 않는 것</h2>
        <ul>
          <li>회원가입이나 로그인을 요구하지 않습니다.</li>
          <li>사용자별 결정 히스토리를 저장하는 별도 데이터베이스를 운영하지 않습니다.</li>
          <li>입력한 고민이나 분석 결과를 회사·HR·VC 등 제3의 조직 고객에게 제공하는 기능이 없습니다.</li>
          <li>직원의 이직 가능성이나 퇴사 위험 점수를 만들어 고용주에게 판매하지 않습니다.</li>
        </ul>
      </section>

      <section>
        <h2>AI 처리는 어떻게 이루어지나요?</h2>
        <p>실시간 분석을 실행하면 입력 내용이 Vercel 기반 서비스 경로와 설정된 AI 모델 제공 경로를 통해 처리될 수 있습니다. 반대편 MVP 자체는 이를 사용자 히스토리 DB에 저장하지 않지만, 인프라·모델 제공자의 운영 로그에는 각 제공자의 정책이 적용될 수 있습니다.</p>
      </section>

      <section>
        <h2>입력하지 말아야 할 정보</h2>
        <p>회사명, 실명, 연락처, 주민등록번호, 고객정보, 미공개 매출·투자조건·계약내용, 소스코드·비밀키 등 개인 또는 회사의 비밀정보는 입력하지 마세요. 분석에는 익명화된 맥락만으로도 충분합니다.</p>
      </section>

      <section>
        <h2>사업화 이후에도 지킬 원칙</h2>
        <div className="legalGrid">
          <div><b>Employee-controlled</b><p>개인 모드의 데이터 통제권은 직원에게 둡니다.</p></div>
          <div><b>No HR backdoor</b><p>회사 후원 계정이 생겨도 개인 입력·결과를 HR이 열람할 수 없게 설계합니다.</p></div>
          <div><b>Explicit opt-in</b><p>결정 히스토리나 30/90일 추적은 사용자가 명시적으로 켠 경우에만 저장합니다.</p></div>
          <div><b>Separate Teams</b><p>향후 조직용 제품은 Personal과 별도 데이터 영역으로 운영합니다.</p></div>
        </div>
      </section>

      <section>
        <h2>중요한 한계</h2>
        <p>반대편은 회사의 생존 가능성, 미래 기업가치, 스톡옵션 수익을 예측하지 않습니다. 커리어·법률·세무·투자 관련 중요한 결정은 공식 문서와 관련 전문가의 검토를 함께 사용하세요.</p>
      </section>

      <p className="legalDate">MVP privacy note · 2026-09-18</p>
    </main>
  );
}
