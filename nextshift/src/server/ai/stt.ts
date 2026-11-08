import { hfToken, routerBase, sttModel } from './config';
import { AiError } from './errors';

const AUDIO_TYPES = new Set([
  'audio/webm',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/mpeg',
  'audio/mp4',
  'audio/ogg',
  'audio/flac',
]);

const MAX_AUDIO_BYTES = 8 * 1024 * 1024;

export function decodeAudio(audioBase64: unknown, mimeType: unknown) {
  if (typeof audioBase64 !== 'string' || typeof mimeType !== 'string') {
    throw new AiError(400, 'bad_request', 'The recording was missing.');
  }
  const type = mimeType.split(';')[0]?.trim().toLowerCase() ?? '';
  if (!AUDIO_TYPES.has(type)) {
    throw new AiError(415, 'unsupported_audio', 'That recording format is not supported.');
  }
  const cleaned = audioBase64.replace(/\s/g, '');
  if (!cleaned || cleaned.length > Math.ceil((MAX_AUDIO_BYTES * 4) / 3) + 8) {
    throw new AiError(413, 'bad_request', 'That recording is too long.');
  }
  let bytes: Uint8Array;
  try {
    const binary = atob(cleaned);
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  } catch {
    throw new AiError(400, 'bad_request', 'The recording could not be read.');
  }
  if (!bytes.byteLength) {
    throw new AiError(400, 'bad_request', 'The recording was empty.');
  }
  return { bytes, type };
}

export async function transcribeAudio(bytes: Uint8Array, type: string) {
  const token = hfToken();
  if (!token) {
    throw new AiError(503, 'unavailable', 'Speech transcription is not configured on the server yet.');
  }

  const model = sttModel();
  const audio = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(audio).set(bytes);
  const response = await fetch(`${routerBase()}/hf-inference/models/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': type,
    },
    body: new Blob([audio], { type }),
    signal: AbortSignal.timeout(30000),
  }).catch(() => {
    throw new AiError(502, 'transcribe_failed', 'Speech transcription could not be reached.');
  });

  const payload = (await response.json().catch(() => null)) as { text?: unknown } | null;
  if (!response.ok) {
    console.error(`[ai] stt provider status ${response.status} model ${model}`);
    throw new AiError(502, 'transcribe_failed', 'Speech transcription is unavailable right now.');
  }
  const text = typeof payload?.text === 'string' ? payload.text.trim() : '';
  if (!text) {
    throw new AiError(422, 'transcribe_failed', 'No words were recognized in that recording.');
  }
  return text;
}
