import type { InterviewLang } from '@/lib/interview-locale';

import { hfToken, routerBase, ttsModel } from './config';
import { AiError } from './errors';

function spokenText(text: string) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= 900) return clean;
  const slice = clean.slice(0, 900);
  const stop = Math.max(slice.lastIndexOf('.'), slice.lastIndexOf('。'), slice.lastIndexOf('!'), slice.lastIndexOf('?'));
  return (stop > 240 ? slice.slice(0, stop + 1) : slice).trim();
}

export async function synthesizeSpeech(text: string, language: InterviewLang) {
  const token = hfToken();
  if (!token) {
    throw new AiError(503, 'tts_unavailable', 'Speech audio is not configured on the server yet.');
  }
  const spoken = spokenText(text);
  if (!spoken) {
    throw new AiError(400, 'empty', 'There was nothing to read aloud.');
  }

  const model = ttsModel(language);
  const response = await fetch(`${routerBase()}/hf-inference/models/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'audio/wav, audio/mpeg, audio/flac, application/octet-stream',
    },
    body: JSON.stringify({ inputs: spoken }),
    signal: AbortSignal.timeout(20000),
  }).catch(() => {
    throw new AiError(502, 'tts_unavailable', 'Speech audio could not be reached.');
  });

  const type = response.headers.get('content-type') ?? '';
  if (!response.ok || type.includes('application/json') || type.includes('text/')) {
    console.error(`[ai] tts provider status ${response.status} model ${model} type ${type.split(';')[0]}`);
    throw new AiError(502, 'tts_unavailable', 'Speech audio is unavailable for this language right now.');
  }

  const audio = await response.arrayBuffer();
  if (audio.byteLength < 64) {
    throw new AiError(502, 'tts_unavailable', 'Speech audio came back empty.');
  }
  return {
    audio,
    contentType: type.split(';')[0] || 'audio/wav',
    model,
  };
}
