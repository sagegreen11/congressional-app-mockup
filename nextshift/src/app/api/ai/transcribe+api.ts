import { assertRate, clientError, noStore } from '@/server/ai/errors';
import { decodeAudio, transcribeAudio } from '@/server/ai/stt';

export async function POST(request: Request) {
  try {
    assertRate(request, 'transcribe', 16);
    const body = (await request.json().catch(() => null)) as {
      audioBase64?: unknown;
      mimeType?: unknown;
    } | null;
    const audio = decodeAudio(body?.audioBase64, body?.mimeType);
    const text = await transcribeAudio(audio.bytes, audio.type);
    return Response.json({ text }, { headers: noStore() });
  } catch (error) {
    return clientError(error);
  }
}
