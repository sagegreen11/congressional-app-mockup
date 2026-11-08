import type { InterviewLang } from '@/lib/interview-locale';

export type ChatTurn = {
  role: 'user' | 'assistant';
  content: string;
  display: boolean;
};

const MAX_TURNS = 16;
const MAX_CHARS = 2000;

export function sanitizeHistory(value: unknown): ChatTurn[] {
  if (!Array.isArray(value)) return [];
  const turns: ChatTurn[] = [];
  for (const item of value.slice(-MAX_TURNS)) {
    if (!item || typeof item !== 'object') continue;
    const record = item as { role?: unknown; content?: unknown; display?: unknown };
    if (record.role !== 'user' && record.role !== 'assistant') continue;
    if (typeof record.content !== 'string') continue;
    const content = record.content.replace(/\s+/g, ' ').trim();
    if (!content) continue;
    turns.push({
      role: record.role,
      content: content.slice(0, MAX_CHARS),
      display: record.display !== false,
    });
  }
  return turns;
}

export function openingCue(language: InterviewLang) {
  if (language === 'es') return 'Empieza la entrevista de práctica. Haz solo la primera pregunta. No des retroalimentación todavía.';
  if (language === 'zh-CN') return '现在开始模拟面试。只问第一个问题。先不要给反馈。';
  return 'Start the practice interview. Ask only the first question. Do not give feedback yet.';
}

export function questionOnlyCue(language: InterviewLang) {
  if (language === 'es') return 'Responde solo con la siguiente pregunta de práctica. No alabes ni comentes esta respuesta.';
  if (language === 'zh-CN') return '只回复下一个练习问题。不要称赞或评论这个回答。';
  return 'Reply with only the next practice question. Do not praise or comment on this answer.';
}

export function reviewCue(language: InterviewLang) {
  if (language === 'es') {
    return 'La entrevista de práctica terminó. Da ahora toda la retroalimentación que guardaste. Di qué quedó claro y qué mejorar, usando solo lo que dije. No hagas otra pregunta.';
  }
  if (language === 'zh-CN') return '模拟面试结束了。现在给出你留到最后的全部反馈。只根据我说过的话，说明哪些地方清楚、哪些可以改进。不要再提问。';
  return 'The practice interview is over. Give all of the feedback you saved. Say what was clear and what to improve, using only what I actually said. Do not ask another question.';
}

export function userText(value: unknown) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, MAX_CHARS);
}
