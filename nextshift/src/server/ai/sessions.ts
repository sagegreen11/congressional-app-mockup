import type { ChatTurn } from './messages';

type Session = { turns: ChatTurn[]; updatedAt: number };

const sessions = new Map<string, Session>();
const MAX_SESSIONS = 200;
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

export function conversationIdOk(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9-]{8,64}$/.test(value);
}

export function rememberSession(id: string, turns: ChatTurn[]) {
  const now = Date.now();
  sessions.set(id, { turns, updatedAt: now });
  if (sessions.size <= MAX_SESSIONS) return;
  for (const [key, session] of sessions) {
    if (now - session.updatedAt > MAX_AGE_MS) sessions.delete(key);
  }
}

export function readSession(id: string) {
  const session = sessions.get(id);
  if (!session) return null;
  session.updatedAt = Date.now();
  return session.turns;
}
