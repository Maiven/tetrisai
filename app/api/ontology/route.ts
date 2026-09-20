import { STARTUP_DECISION_ONTOLOGY, STARTUP_ONTOLOGY_VERSION } from '../../../lib/startup-ontology';

export const runtime = 'nodejs';

export async function GET() {
  const graph = Object.entries(STARTUP_DECISION_ONTOLOGY).map(([id, module]) => ({
    '@id': `bpd:${id}`,
    '@type': 'bpd:OntologyModule',
    'rdfs:label': module.label,
    'bpd:description': module.description,
    'bpd:concepts': module.concepts,
  }));

  return new Response(
    JSON.stringify(
      {
        '@context': {
          bpd: 'https://decision-mirror-eight.vercel.app/ontology#',
          rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
          label: 'rdfs:label',
          description: 'bpd:description',
          concepts: 'bpd:concepts',
        },
        '@id': 'bpd:StartupDecisionOntology',
        '@type': 'bpd:DomainOntology',
        'bpd:version': STARTUP_ONTOLOGY_VERSION,
        'bpd:modules': graph,
        'bpd:relations': [
          'HAS_DIMENSION',
          'HAS_CLAIM',
          'REQUIRES_EVIDENCE',
          'ASKS',
          'VERIFIED_BY',
          'PUBLICLY_SUPPORTED_BY',
          'RESPONDED_WITH',
          'TRANSFORMED_BY',
          'COULD_FLIP',
          'LEADS_TO_ACTION',
        ],
      },
      null,
      2,
    ),
    {
      headers: {
        'Content-Type': 'application/ld+json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  );
}
