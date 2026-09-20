export type DiligenceShareQuestion = {
  dimension: string;
  question: string;
  askWho: string;
};

export type DiligenceRequestPayload = {
  v: 1;
  type: 'request';
  requestId: string;
  locale: 'ko' | 'en';
  createdAt: string;
  expiresAt: string;
  returnPath: '/' | '/en';
  questions: DiligenceShareQuestion[];
};

export type DiligenceResponseAnswer = DiligenceShareQuestion & {
  status: 'concrete' | 'vague' | 'declined';
  answer: string;
};

export type DiligenceResponsePayload = {
  v: 1;
  type: 'response';
  requestId: string;
  locale: 'ko' | 'en';
  createdAt: string;
  responderRole: 'recruiter' | 'hiring_manager' | 'current_employee' | 'other';
  returnPath: '/' | '/en';
  answers: DiligenceResponseAnswer[];
};

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value: string) {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function encodeDiligencePayload(
  payload: DiligenceRequestPayload | DiligenceResponsePayload,
) {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
}

export function decodeDiligencePayload(
  token: string,
): DiligenceRequestPayload | DiligenceResponsePayload | null {
  try {
    const raw = new TextDecoder().decode(base64UrlToBytes(token));
    const value = JSON.parse(raw) as DiligenceRequestPayload | DiligenceResponsePayload;
    if (value?.v !== 1 || !Array.isArray('questions' in value ? value.questions : value.answers)) return null;
    if (value.type !== 'request' && value.type !== 'response') return null;
    return value;
  } catch {
    return null;
  }
}

export function requestExpired(payload: DiligenceRequestPayload) {
  const expiry = new Date(payload.expiresAt).getTime();
  return !Number.isFinite(expiry) || Date.now() > expiry;
}
