import { completeChat } from '@/server/ai/llm';
import { parseLanguage } from '@/server/ai/config';
import { assertRate, clientError, noStore } from '@/server/ai/errors';
import { openingCue, questionOnlyCue, reviewCue, sanitizeHistory, userText, type ChatTurn } from '@/server/ai/messages';
import { conversationIdOk, readSession, rememberSession } from '@/server/ai/sessions';

export async function POST(request: Request) {
  try {
    assertRate(request, 'chat');
    const body = (await request.json().catch(() => null)) as {
      conversationId?: unknown;
      language?: unknown;
      intent?: unknown;
      message?: unknown;
      history?: unknown;
    } | null;
    if (!body || !conversationIdOk(body.conversationId)) {
      return Response.json({ error: 'Start the conversation again.', code: 'bad_request' }, { status: 400, headers: noStore() });
    }
    const language = parseLanguage(body.language);
    if (!language) {
      return Response.json({ error: 'Choose English, Spanish, or Chinese.', code: 'bad_request' }, { status: 400, headers: noStore() });
    }

    const intent = body.intent === 'opening' || body.intent === 'review' ? body.intent : 'message';
    const incoming = sanitizeHistory(body.history);
    const stored = readSession(body.conversationId);
    const prior = incoming.length ? incoming : (stored ?? []);
    let nextUser = userText(body.message);
    let display = true;
    if (intent === 'opening') {
      nextUser = openingCue(language);
      display = false;
    } else if (intent === 'review') {
      nextUser = reviewCue(language);
      display = false;
    }
    if (!nextUser) {
      return Response.json({ error: 'Type or say something before sending.', code: 'empty' }, { status: 400, headers: noStore() });
    }

    const turns: ChatTurn[] = [...prior, { role: 'user', content: nextUser, display }];
    const modelTurns =
      intent === 'message'
        ? turns.map((turn, index) =>
            index === turns.length - 1
              ? { ...turn, content: `${turn.content}\n\n${questionOnlyCue(language)}` }
              : turn,
          )
        : turns;
    const text = await completeChat(language, modelTurns);
    const history: ChatTurn[] = [...turns, { role: 'assistant', content: text, display: true }];
    rememberSession(body.conversationId, history);
    return Response.json({ conversationId: body.conversationId, text, history }, { headers: noStore() });
  } catch (error) {
    return clientError(error);
  }
}
