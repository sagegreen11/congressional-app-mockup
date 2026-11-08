import type { InterviewLang } from '@/lib/interview-locale';

export type CoachTurn = {
  role: 'user' | 'assistant';
  content: string;
  display: boolean;
};

export class AiClientError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

async function errorFrom(response: Response) {
  try {
    const body = (await response.json()) as { error?: unknown; code?: unknown };
    const code = typeof body.code === 'string' ? body.code : 'unavailable';
    const message = typeof body.error === 'string' ? body.error : 'The career coach is unavailable right now.';
    return new AiClientError(code, message);
  } catch {
    return new AiClientError('unavailable', 'The career coach is unavailable right now.');
  }
}

export async function requestCoachReply(input: {
  conversationId: string;
  language: InterviewLang;
  intent: 'opening' | 'review' | 'message';
  message?: string;
  history: CoachTurn[];
}) {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).catch(() => {
    throw new AiClientError('unavailable', 'The career coach could not be reached.');
  });
  if (!response.ok) throw await errorFrom(response);
  const body = (await response.json()) as { text?: unknown; history?: unknown };
  if (typeof body.text !== 'string' || !body.text.trim() || !Array.isArray(body.history)) {
    throw new AiClientError('unavailable', 'The career coach returned an empty response.');
  }
  return { text: body.text.trim(), history: body.history as CoachTurn[] };
}

export async function requestTranscript(audioBase64: string, mimeType: string) {
  const response = await fetch('/api/ai/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, mimeType }),
  }).catch(() => {
    throw new AiClientError('transcribe_failed', 'Speech transcription could not be reached.');
  });
  if (!response.ok) throw await errorFrom(response);
  const body = (await response.json()) as { text?: unknown };
  if (typeof body.text !== 'string' || !body.text.trim()) {
    throw new AiClientError('transcribe_failed', 'No words were recognized in that recording.');
  }
  return body.text.trim();
}

export async function requestSpeech(text: string, language: InterviewLang) {
  const response = await fetch('/api/ai/speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language }),
  }).catch(() => {
    throw new AiClientError('tts_unavailable', 'Speech audio could not be reached.');
  });
  const type = response.headers.get('content-type') ?? '';
  if (!response.ok || !type.startsWith('audio/')) {
    throw await errorFrom(response);
  }
  return response.blob();
}
