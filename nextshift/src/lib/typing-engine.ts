import { typingPassages } from '@/data/typing-passages';

export const TYPING_DURATIONS = [15, 30, 60] as const;
export type TypingDuration = (typeof TYPING_DURATIONS)[number];

export type CharState = 'pending' | 'correct' | 'incorrect' | 'active';

export type CharMark = {
  char: string;
  state: CharState;
};

/**
 * WPM uses the standard 5 characters per word:
 *   (typedCharacterCount / 5) / minutesElapsed
 * Accuracy is character-level:
 *   correctCharacters / typedCharacterCount * 100
 */
export type TypingMetrics = {
  wpm: number;
  accuracy: number;
  correct: number;
  incorrect: number;
  elapsedSec: number;
};

export type TypingState = {
  duration: TypingDuration;
  target: string;
  typed: string;
  historyTarget: string;
  historyTyped: string;
  startedAt: number | null;
  finished: boolean;
};

export function pickPassage(exclude?: string) {
  const pool = exclude ? typingPassages.filter((item) => item !== exclude) : typingPassages;
  const list = pool.length ? pool : typingPassages;
  return list[Math.floor(Math.random() * list.length)];
}

export function createTypingState(duration: TypingDuration): TypingState {
  return {
    duration,
    target: pickPassage(),
    typed: '',
    historyTarget: '',
    historyTyped: '',
    startedAt: null,
    finished: false,
  };
}

function completePassage(state: TypingState): TypingState {
  return {
    ...state,
    historyTarget: state.historyTarget + state.target,
    historyTyped: state.historyTyped + state.typed.slice(0, state.target.length),
    target: pickPassage(state.target),
    typed: '',
  };
}

export function applyTypedValue(state: TypingState, value: string, now: number): TypingState {
  if (state.finished) return state;

  let next: TypingState = {
    ...state,
    typed: value,
    startedAt: state.startedAt ?? (value.length ? now : null),
  };

  while (next.typed.length >= next.target.length && next.target.length > 0) {
    const leftover = next.typed.slice(next.target.length);
    next = completePassage({ ...next, typed: next.typed.slice(0, next.target.length) });
    next = { ...next, typed: leftover };
  }

  return tickTyping(next, now);
}

export function loadNewSentence(state: TypingState): TypingState {
  return {
    ...state,
    target: pickPassage(state.target),
    typed: '',
  };
}

export function tickTyping(state: TypingState, now: number): TypingState {
  if (state.finished || !state.startedAt) return state;
  if ((now - state.startedAt) / 1000 >= state.duration) {
    return { ...state, finished: true };
  }
  return state;
}

export function remainingSec(state: TypingState, now: number) {
  if (!state.startedAt) return state.duration;
  return Math.max(0, state.duration - (now - state.startedAt) / 1000);
}

function score(target: string, typed: string) {
  let correct = 0;
  let incorrect = 0;
  const n = typed.length;
  for (let i = 0; i < n; i += 1) {
    if (i < target.length && typed[i] === target[i]) correct += 1;
    else incorrect += 1;
  }
  return { correct, incorrect };
}

export function typingMetrics(state: TypingState, now: number): TypingMetrics {
  const current = state.finished
    ? { typed: state.typed, target: state.target }
    : { typed: state.typed, target: state.target };
  const { correct, incorrect } = score(
    state.historyTarget + current.target,
    state.historyTyped + current.typed,
  );
  const typedCount = correct + incorrect;
  const elapsedMs = state.startedAt ? Math.min(now - state.startedAt, state.duration * 1000) : 0;
  const elapsedSec = elapsedMs / 1000;
  const minutes = elapsedSec / 60;
  const wpm = minutes > 0 ? typedCount / 5 / minutes : 0;

  return {
    wpm: Math.round(wpm * 10) / 10,
    accuracy: typedCount ? Math.round((correct / typedCount) * 1000) / 10 : 100,
    correct,
    incorrect,
    elapsedSec: Math.round(elapsedSec * 10) / 10,
  };
}

export function passageMarks(state: TypingState): CharMark[] {
  return state.target.split('').map((char, index) => {
    if (index === state.typed.length && !state.finished) {
      return { char, state: 'active' };
    }
    if (index >= state.typed.length) {
      return { char, state: 'pending' };
    }
    return {
      char,
      state: state.typed[index] === char ? 'correct' : 'incorrect',
    };
  });
}
