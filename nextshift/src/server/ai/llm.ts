import { systemPrompt } from './coach';
import { geminiKey, geminiModel } from './config';
import { AiError } from './errors';
import type { ChatTurn } from './messages';
import type { InterviewLang } from '@/lib/interview-locale';

type GeminiPart = { text?: unknown; thought?: unknown };
type GeminiResponse = {
  candidates?: { content?: { parts?: GeminiPart[] }; finishReason?: string }[];
  error?: { status?: string; message?: string };
};

function replyText(payload: GeminiResponse | null) {
  const parts = payload?.candidates?.[0]?.content?.parts ?? [];
  return parts
    .filter((part) => part.thought !== true && typeof part.text === 'string')
    .map((part) => (part.text as string).trim())
    .filter(Boolean)
    .join('\n')
    .trim();
}

function failure(status: number, payload: GeminiResponse | null) {
  const providerStatus = payload?.error?.status ?? '';
  const providerMessage = payload?.error?.message ?? '';
  console.error(`[ai] gemini status ${status} ${providerStatus}`);
  if (
    status === 401 ||
    status === 403 ||
    providerStatus === 'UNAUTHENTICATED' ||
    providerStatus === 'PERMISSION_DENIED' ||
    /api key/i.test(providerMessage)
  ) {
    throw new AiError(401, 'invalid_key', 'The Gemini API key was rejected.');
  }
  if (status === 429 || providerStatus === 'RESOURCE_EXHAUSTED') {
    throw new AiError(429, 'rate_limited', 'Gemini is rate limiting requests. Wait a moment and try again.');
  }
  if (status === 404 || providerStatus === 'NOT_FOUND') {
    throw new AiError(502, 'model_unavailable', 'The configured Gemini model is not available.');
  }
  throw new AiError(502, 'unavailable', 'The career coach is unavailable right now.');
}

export async function completeChat(language: InterviewLang, turns: ChatTurn[]) {
  const key = geminiKey();
  if (!key) {
    throw new AiError(503, 'missing_key', 'The career coach is not configured on the server yet.');
  }

  const model = geminiModel();
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt(language) }] },
        contents: turns.map((turn) => ({
          role: turn.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: turn.content }],
        })),
        generationConfig: { maxOutputTokens: 1024 },
      }),
      signal: AbortSignal.timeout(25000),
    },
  ).catch(() => {
    throw new AiError(502, 'unavailable', 'The career coach could not be reached.');
  });

  const payload = (await response.json().catch(() => null)) as GeminiResponse | null;
  if (!response.ok) failure(response.status, payload);

  const text = replyText(payload);
  if (!text) {
    console.error(`[ai] gemini empty finish ${payload?.candidates?.[0]?.finishReason ?? 'none'}`);
    throw new AiError(502, 'unavailable', 'The career coach returned an empty response.');
  }
  return text;
}
