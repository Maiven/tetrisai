import { generateText, gateway, Output, stepCountIs } from 'ai';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 45;

const schema = z.object({
  overview: z.string(),
  signals: z.array(z.object({
    dimension: z.enum(['회사 생존 신호', '역할의 실제', '리더·의사결정권', '현금·지분 보상', '학습·다음 선택지']),
    finding: z.string(),
    evidenceLevel: z.enum(['공개 확인', '간접 신호', '확인 안 됨', '충돌']),
    implication: z.string(),
    caution: z.string(),
  })).min(3).max(8),
  questionsToVerify: z.array(z.string()).min(3).max(6),
  freshnessNote: z.string(),
});

function clean(value: unknown, max = 160) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const company = clean(body?.company, 100);
    const website = clean(body?.website, 240);
    const role = clean(body?.role, 80);
    const region = clean(body?.region, 100);
    const language: 'ko' | 'en' = body?.language === 'en' ? 'en' : 'ko';

    if (company.length < 2) {
      return Response.json({ error: '공개 검색할 회사명을 2자 이상 입력해주세요.' }, { status: 400 });
    }

    const result = await generateText({
      model: 'openai/gpt-5.6-sol',
      tools: {
        tako_search: gateway.tools.takoSearch(),
      },
      stopWhen: stepCountIs(5),
      output: Output.object({ schema }),
      reasoning: 'low',
      maxOutputTokens: 2200,
      system: `당신은 스타트업 직원 편의 Public Evidence Research Agent입니다.
반드시 제공된 웹 검색 도구를 사용해 최신 공개 자료를 조사합니다.

목표는 회사를 좋다/나쁘다 평가하거나 생존확률을 예측하는 것이 아닙니다.
공개적으로 확인할 수 있는 신호를 직원의 due diligence 질문으로 변환합니다.

원칙:
1) 회사 공식 사이트, 공식 채용페이지, 공식 블로그/보도자료, 신뢰할 수 있는 언론·투자/기업 데이터 출처를 우선합니다.
2) 회사 내부 런웨이, 비공개 매출, 리더 행동, 미래 기업가치는 공개 근거가 없으면 반드시 '확인 안 됨'으로 둡니다.
3) 투자유치 사실 자체를 생존 보장으로 취급하지 않습니다.
4) 채용 증가/감소, 조직 변경, 투자 발표는 간접 신호일 뿐 원인을 단정하지 않습니다.
5) 검색 결과가 서로 다르면 '충돌'로 표시하고 무엇을 직접 확인해야 하는지 제시합니다.
6) 검색 결과가 없다는 사실을 부정적 증거로 해석하지 않습니다.
7) 현금·지분 보상은 공개 benchmark가 아니라 해당 회사에 대해 공개 확인 가능한 정보가 있을 때만 언급합니다.
8) 개인·비공개 정보는 추정하지 않습니다.
9) 국가/지역에 따라 고용·세금·equity 규정이 다릅니다. 공개 자료가 없으면 특정 관할권 규칙을 단정하지 말고 직접 확인 질문으로 남깁니다.
10) language가 en이면 자유 서술 필드는 영어로 작성하되 schema enum 값은 원래 한국어 enum 토큰을 그대로 사용합니다.
${language === 'en' ? 'Write concise professional English in all non-enum fields.' : '문장은 짧고 구체적인 한국어로 작성합니다.'}`,
      prompt: `다음 회사에 대해 스타트업 직원 관점의 공개 실사를 수행하세요.

회사명: ${company}
공식 웹사이트 또는 채용페이지(사용자가 제공한 경우): ${website || '없음'}
관심 직무(사용자가 제공한 경우): ${role || '없음'}
국가/지역(사용자가 제공한 경우): ${region || '없음'}
응답 언어: ${language === 'en' ? 'English (except fixed enum tokens)' : 'Korean'}

최신 공개 웹 자료를 검색해서 5-Lens 중 실제 공개 근거가 있는 신호와 없는 신호를 구분하세요.
특히 최근 투자/자금조달 발표, 공개된 사업 성과, 채용 페이지의 역할/조직 정보, 리더십 공개 정보, 최근 구조조정·채용동결·조직변경 보도, 제품/시장 변화가 있으면 출처 근거로만 요약하세요.
마지막에는 회사나 채용담당자에게 직접 확인해야 할 질문을 남기세요.`,
    });

    const sources = result.sources
      .filter((s): s is Extract<(typeof result.sources)[number], { sourceType: 'url' }> => s.sourceType === 'url')
      .map((s) => ({ id: s.id, title: s.title || s.url, url: s.url }))
      .filter((source, index, all) => all.findIndex((x) => x.url === source.url) === index)
      .slice(0, 10);

    return Response.json({
      research: result.output,
      sources,
      searchedAt: new Date().toISOString(),
      note: '공개 웹 자료만 사용한 2차 증거입니다. 회사 내부 사실은 직접 확인해야 합니다.',
    }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    console.error('Public evidence research failed:', error);
    return Response.json(
      { error: 'Public evidence research could not be completed. Please try again.' },
      { status: 500 },
    );
  }
}
