export const STARTUP_ONTOLOGY_VERSION = '2026.09.2';

export type OntologyModuleId =
  | 'decision'
  | 'company'
  | 'role'
  | 'leadership'
  | 'compensation'
  | 'learning'
  | 'ax'
  | 'evidence'
  | 'action';

export type OntologyNodeType =
  | 'Decision'
  | 'Dimension'
  | 'Claim'
  | 'Evidence'
  | 'Unknown'
  | 'Question'
  | 'ResponseSignal'
  | 'AXSignal'
  | 'FlipCondition'
  | 'VerificationAction';

export type OntologyProvenance =
  | 'user_input'
  | 'user_verified'
  | 'public_source'
  | 'user_reported_response'
  | 'model_structured'
  | 'system_ontology';

export type OntologyNode = {
  id: string;
  type: OntologyNodeType;
  label: string;
  status?: 'fact' | 'assumption' | 'unknown' | 'verified' | 'needs_verification' | 'response_signal' | 'inferred';
  provenance: OntologyProvenance;
  dimension?: string;
};

export type OntologyRelation =
  | 'HAS_DIMENSION'
  | 'HAS_CLAIM'
  | 'REQUIRES_EVIDENCE'
  | 'ASKS'
  | 'VERIFIED_BY'
  | 'PUBLICLY_SUPPORTED_BY'
  | 'RESPONDED_WITH'
  | 'TRANSFORMED_BY'
  | 'COULD_FLIP'
  | 'LEADS_TO_ACTION';

export type OntologyEdge = {
  source: string;
  relation: OntologyRelation;
  target: string;
};

export type DecisionGraph = {
  ontologyVersion: string;
  nodes: OntologyNode[];
  edges: OntologyEdge[];
};

export const STARTUP_DECISION_ONTOLOGY = {
  decision: {
    label: 'Decision',
    description: '사용자가 실제로 선택하거나 보류해야 하는 결정',
    concepts: ['current hypothesis', 'alternative', 'flip condition', 'stop rule'],
  },
  company: {
    label: 'Company Viability',
    description: '회사 생존을 예측하지 않고 확인해야 할 사업 지속성 신호',
    concepts: ['runway', 'financing milestone', 'revenue quality', 'hiring/cost signal'],
  },
  role: {
    label: 'Role Reality',
    description: '직함이 아니라 실제 책임, 성공 기준, 업무 경계와 의사결정권',
    concepts: ['90-day outcome', 'decision right', 'scope', 'non-goal'],
  },
  leadership: {
    label: 'Leadership & Decision Rights',
    description: '리더 인상보다 실제 피드백, 반대 의견 처리, 우선순위 결정 구조',
    concepts: ['feedback cadence', 'conflict example', 'delegation', 'decision owner'],
  },
  compensation: {
    label: 'Cash & Equity',
    description: '현금과 지분 보상을 조건 단위로 분해해 확인',
    concepts: ['cash', 'fully diluted ownership', 'strike price', 'vesting', 'exercise window'],
  },
  learning: {
    label: 'Learning & Future Options',
    description: '회사 성장과 개인 학습을 분리하고 미래 선택지의 질을 확인',
    concepts: ['skill evidence', 'portfolio outcome', 'mentor/peer quality', 'alternative quality'],
  },
  ax: {
    label: 'AI Transformation / AX',
    description: 'AI 도구 보유 여부가 아니라 업무 재설계, human-agent handoff, 사람의 판단권, 조직 준비도, 품질·책임, 역량 궤적을 확인',
    concepts: ['work redesign', 'augmentation vs automation', 'human agency', 'agent handoff', 'AI governance', 'quality standard', 'skill trajectory'],
  },
  evidence: {
    label: 'Evidence',
    description: '문장을 사실, 가정, 미확인으로 구분하고 출처와 검증 행동을 연결',
    concepts: ['fact', 'assumption', 'unknown', 'user-verified evidence', 'provenance'],
  },
  action: {
    label: 'Verification Action',
    description: '10분, 24시간, 7일 안에 현실에서 실행할 최소 검증 행동',
    concepts: ['question', 'document check', 'interview', 're-analysis', 'stop rule'],
  },
} as const;

type PromptContext = {
  decisionType?: string;
  stage?: string;
  role?: string;
  headcount?: string;
  initialLean?: string;
};

const DIMENSION_TO_MODULE: Record<string, OntologyModuleId> = {
  '회사 생존 신호': 'company',
  '역할의 실제': 'role',
  '리더·의사결정권': 'leadership',
  '현금·지분 보상': 'compensation',
  '학습·다음 선택지': 'learning',
};

export function getOntologyPrompt(context: PromptContext): string {
  const priorities: OntologyModuleId[] = ['decision', 'evidence', 'action'];

  const t = context.decisionType ?? '';
  if (/보상|스톡옵션/.test(t)) priorities.push('compensation');
  if (/역할|승진|조직개편|리더/.test(t)) priorities.push('role', 'leadership');
  if (/합류|이직|잔류/.test(t)) priorities.push('company', 'role', 'leadership', 'learning', 'compensation');
  if (/AI|AX|자동화|에이전트|agent/i.test(t)) priorities.push('ax', 'role', 'leadership', 'learning');

  const unique = [...new Set([...priorities, 'company', 'role', 'leadership', 'compensation', 'learning', 'ax'] as OntologyModuleId[])];

  return unique
    .map((id) => {
      const m = STARTUP_DECISION_ONTOLOGY[id];
      const priority = priorities.includes(id) ? 'PRIORITY' : 'BASE';
      return `[${priority}] ${m.label}: ${m.description}. Concepts: ${m.concepts.join(', ')}`;
    })
    .join('\n');
}

type GraphAnalysis = {
  evidenceLedger: { claim: string; status: '사실' | '가정' | '미확인'; why: string }[];
  startupDiligence: {
    dimension: string;
    status: string;
    signal: string;
    missingEvidence: string;
    questionToAsk: string;
  }[];
  flipConditions: string[];
  verificationSprint: { horizon: string; action: string; evidence: string }[];
  axAudit?: {
    exposureMode: string;
    exposureNote: string;
    items: {
      area: string;
      status: string;
      signal: string;
      missingEvidence: string;
      questionToAsk: string;
    }[];
    twelveMonthScenario: { moreHuman: string; moreAI: string; watchFor: string };
    axRule: string;
  };
};

function nodeId(prefix: string, index: number) {
  return `${prefix}_${index + 1}`;
}

export function buildDecisionGraph(
  analysis: GraphAnalysis,
  question: string,
  verifiedEvidence: string[] = [],
  publicEvidence: string[] = [],
  transparencySignals: string[] = [],
): DecisionGraph {
  const nodes: OntologyNode[] = [
    {
      id: 'decision_1',
      type: 'Decision',
      label: question,
      status: 'inferred',
      provenance: 'user_input',
    },
  ];
  const edges: OntologyEdge[] = [];

  analysis.startupDiligence.forEach((item, index) => {
    const dimId = nodeId('dimension', index);
    const qId = nodeId('question', index);
    const module = DIMENSION_TO_MODULE[item.dimension];

    nodes.push({
      id: dimId,
      type: 'Dimension',
      label: item.dimension,
      status: item.status === '확인됨' ? 'verified' : 'needs_verification',
      provenance: 'system_ontology',
      dimension: module,
    });
    nodes.push({
      id: qId,
      type: 'Question',
      label: item.questionToAsk,
      status: 'needs_verification',
      provenance: 'model_structured',
      dimension: module,
    });
    edges.push(
      { source: 'decision_1', relation: 'HAS_DIMENSION', target: dimId },
      { source: dimId, relation: 'REQUIRES_EVIDENCE', target: qId },
      { source: dimId, relation: 'ASKS', target: qId },
    );
  });

  analysis.evidenceLedger.slice(0, 6).forEach((item, index) => {
    const id = nodeId('claim', index);
    const status = item.status === '사실' ? 'fact' : item.status === '가정' ? 'assumption' : 'unknown';
    nodes.push({
      id,
      type: item.status === '미확인' ? 'Unknown' : 'Claim',
      label: item.claim,
      status,
      provenance: 'model_structured',
    });
    edges.push({ source: 'decision_1', relation: 'HAS_CLAIM', target: id });
  });

  verifiedEvidence.slice(0, 5).forEach((item, index) => {
    const id = nodeId('evidence', index);
    const [dimension, ...rest] = item.split(':');
    const label = rest.join(':').trim() || item;
    const dimIndex = analysis.startupDiligence.findIndex((x) => x.dimension === dimension.trim());

    nodes.push({
      id,
      type: 'Evidence',
      label,
      status: 'verified',
      provenance: 'user_verified',
      dimension: DIMENSION_TO_MODULE[dimension.trim()],
    });

    if (dimIndex >= 0) {
      edges.push({ source: nodeId('dimension', dimIndex), relation: 'VERIFIED_BY', target: id });
    }
  });

  publicEvidence.slice(0, 8).forEach((item, index) => {
    const id = nodeId('public_evidence', index);
    const [dimension, ...rest] = item.split(':');
    const label = rest.join(':').trim() || item;
    const dimIndex = analysis.startupDiligence.findIndex((x) => x.dimension === dimension.trim());

    nodes.push({
      id,
      type: 'Evidence',
      label,
      status: 'inferred',
      provenance: 'public_source',
      dimension: DIMENSION_TO_MODULE[dimension.trim()],
    });

    if (dimIndex >= 0) {
      edges.push({ source: nodeId('dimension', dimIndex), relation: 'PUBLICLY_SUPPORTED_BY', target: id });
    } else {
      edges.push({ source: 'decision_1', relation: 'HAS_CLAIM', target: id });
    }
  });

  transparencySignals.slice(0, 8).forEach((item, index) => {
    const id = nodeId('response_signal', index);
    const [dimension, ...rest] = item.split(':');
    const label = rest.join(':').trim() || item;
    const dimIndex = analysis.startupDiligence.findIndex((x) => x.dimension === dimension.trim());

    nodes.push({
      id,
      type: 'ResponseSignal',
      label,
      status: 'response_signal',
      provenance: 'user_reported_response',
      dimension: DIMENSION_TO_MODULE[dimension.trim()],
    });

    if (dimIndex >= 0) {
      edges.push({ source: nodeId('dimension', dimIndex), relation: 'RESPONDED_WITH', target: id });
    } else {
      edges.push({ source: 'decision_1', relation: 'HAS_CLAIM', target: id });
    }
  });

  analysis.axAudit?.items.slice(0, 5).forEach((item, index) => {
    const id = nodeId('ax_signal', index);
    const targetDimension =
      item.area === '업무 재설계' ? 1 :
      item.area === '조직 준비도' ? 0 :
      item.area === '인간 판단·권한' ? 2 :
      item.area === '역량 궤적' ? 4 :
      2;

    nodes.push({
      id,
      type: 'AXSignal',
      label: `${item.area}: ${item.signal}`,
      status: item.status === '확인됨' ? 'verified' : 'needs_verification',
      provenance: 'model_structured',
      dimension: 'ax',
    });
    edges.push({ source: nodeId('dimension', targetDimension), relation: 'TRANSFORMED_BY', target: id });
  });

  analysis.flipConditions.slice(0, 4).forEach((label, index) => {
    const id = nodeId('flip', index);
    nodes.push({
      id,
      type: 'FlipCondition',
      label,
      status: 'inferred',
      provenance: 'model_structured',
    });
    edges.push({ source: 'decision_1', relation: 'COULD_FLIP', target: id });
  });

  analysis.verificationSprint.forEach((item, index) => {
    const id = nodeId('action', index);
    nodes.push({
      id,
      type: 'VerificationAction',
      label: `${item.horizon}: ${item.action}`,
      status: 'needs_verification',
      provenance: 'model_structured',
    });
    edges.push({ source: 'decision_1', relation: 'LEADS_TO_ACTION', target: id });
  });

  return {
    ontologyVersion: STARTUP_ONTOLOGY_VERSION,
    nodes,
    edges,
  };
}


export type OntologyValidation = {
  valid: boolean;
  violations: string[];
};

export function validateDecisionGraph(graph: DecisionGraph): OntologyValidation {
  const violations: string[] = [];
  const ids = new Set(graph.nodes.map((n) => n.id));

  for (const edge of graph.edges) {
    if (!ids.has(edge.source)) violations.push(`Missing source node: ${edge.source}`);
    if (!ids.has(edge.target)) violations.push(`Missing target node: ${edge.target}`);
  }

  const dimensions = graph.nodes.filter((n) => n.type === 'Dimension');
  if (dimensions.length !== 5) {
    violations.push(`Expected 5 ontology dimensions, found ${dimensions.length}`);
  }

  for (const dimension of dimensions) {
    const hasQuestion = graph.edges.some(
      (e) =>
        e.source === dimension.id &&
        e.relation === 'REQUIRES_EVIDENCE' &&
        graph.nodes.some((n) => n.id === e.target && n.type === 'Question'),
    );
    if (!hasQuestion) {
      violations.push(`Dimension ${dimension.label} has no evidence question`);
    }
  }

  const decision = graph.nodes.find((n) => n.type === 'Decision');
  if (!decision) {
    violations.push('Decision root node is missing');
  } else {
    const linkedDimensions = graph.edges.filter(
      (e) => e.source === decision.id && e.relation === 'HAS_DIMENSION',
    ).length;
    if (linkedDimensions !== 5) {
      violations.push(`Decision must connect to 5 dimensions, found ${linkedDimensions}`);
    }
  }

  return { valid: violations.length === 0, violations };
}
