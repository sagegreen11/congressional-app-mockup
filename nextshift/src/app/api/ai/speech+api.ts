import { parseLanguage } from '@/server/ai/config';
import { assertRate, clientError, noStore } from '@/server/ai/errors';
import { userText } from '@/server/ai/messages';
import { synthesizeSpeech } from '@/server/ai/tts';

export async function POST(request: Request) {
  try {
    assertRate(request, 'speech');
    const body = (await request.json().catch(() => null)) as { text?: unknown; language?: unknown } | null;
    const language = parseLanguage(body?.language);
    const text = userText(body?.text);
    if (!language || !text) {
      return Response.json({ error: 'There was nothing to read aloud.', code: 'empty' }, { status: 400, headers: noStore() });
    }
    const speech = await synthesizeSpeech(text, language);
    return new Response(speech.audio, {
      headers: {
        'Content-Type': speech.contentType,
        'Cache-Control': 'no-store',
        'X-TTS-Model': speech.model,
      },
    });
  } catch (error) {
    return clientError(error);
  }
}
