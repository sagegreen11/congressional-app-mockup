import { buildResumeDocument } from './resume-writer';
import { extractDates, hasDates, isSkip, needsFollowup } from './resume-writer';
import type { ExperienceKind, ResumeSession, ResumeStep } from './resume-types';
import type { ResumeDocument } from './resume-types';

export const RESUME_OPENING =
  "I'll help you turn what you've actually done into a polished resume. I will expand your wording so it sounds professional, but I will not invent awards, hours, or results you did not mention.\n\nWhat's your full name?";

const CATEGORIES: ExperienceKind[] = [
  'work',
  'volunteer',
  'school',
  'club',
  'leadership',
  'project',
  'other',
];

const CATEGORY_ASK: Record<ExperienceKind, string> = {
  work: "Let's start with paid work. Describe a job in your own words — what it was, where, and what you did. Month/year dates help. Say skip if you don't have paid work.",
  volunteer:
    'Any volunteer work? What did you do, where, and about when? Skip if none.',
  school:
    'School activities — sports, arts, events? What did you actually do, and about when? Skip if none.',
  club: 'Clubs or organizations? What was your role, what did you do, and when? Skip if none.',
  leadership:
    'Leadership experiences — captain, officer, someone who organized things? What did you do, and when? Skip if none.',
  project: "Projects you've built, created, or worked on? What was the project and what was your part? Skip if none.",
  other:
    'Anything else that belongs on a resume — caregiving, a family business, informal work? Skip if none.',
};

const CATEGORY_LABEL: Record<ExperienceKind, string> = {
  work: 'paid job',
  volunteer: 'volunteer experience',
  school: 'school activity',
  club: 'club or organization',
  leadership: 'leadership experience',
  project: 'project',
  other: 'other experience',
};

export function createResumeSession(): ResumeSession {
  return {
    name: '',
    address: '',
    email: '',
    phone: '',
    goal: '',
    educationRaw: '',
    educationExtra: '',
    traitsRaw: '',
    experiences: [],
    step: { id: 'name' },
    optional: false,
  };
}

function nextCategory(kind?: ExperienceKind): ResumeStep {
  if (!kind) return { id: 'category', kind: CATEGORIES[0] };
  const i = CATEGORIES.indexOf(kind);
  const nxt = CATEGORIES[i + 1];
  if (!nxt) return { id: 'traits' };
  return { id: 'category', kind: nxt };
}

function askFor(step: ResumeStep): { text: string; optional: boolean } {
  switch (step.id) {
    case 'name':
      return { text: "What's your full name?", optional: false };
    case 'address':
      return {
        text: "What's your address? This is optional — skip if you'd rather leave it off.",
        optional: true,
      };
    case 'email':
      return {
        text: "What's a good email for the resume? Optional — skip if you don't want it listed.",
        optional: true,
      };
    case 'phone':
      return {
        text: 'Phone number? Optional — skip if you would rather not include it.',
        optional: true,
      };
    case 'goal':
      return {
        text: 'What kind of job or opportunity are you aiming for? A short answer is enough, or skip.',
        optional: true,
      };
    case 'education':
      return {
        text: 'What school do you go to or did you attend? Include the city and expected graduation date if you know them. Skip if you prefer not to list school.',
        optional: true,
      };
    case 'education_more':
      return {
        text: 'Anything else about school you want listed — program, honor roll only if true, relevant classes? Skip if not.',
        optional: true,
      };
    case 'category':
      return { text: CATEGORY_ASK[step.kind], optional: true };
    case 'dates':
      return {
        text: 'About when did that start and end? Month and year is fine, or say Present if it is still going.',
        optional: false,
      };
    case 'followup':
      return {
        text:
          step.round === 0
            ? 'What did you actually do day to day? Did you help, lead, organize, create, manage, teach, build, or improve anything?'
            : 'What skills did you use? Anything you were proud of that really happened — include numbers only if they are true. If that is all, say done.',
        optional: true,
      };
    case 'another':
      return {
        text: `Do you have another ${CATEGORY_LABEL[step.kind]} to add? Yes or no is fine.`,
        optional: true,
      };
    case 'traits':
      return {
        text: 'How would you describe yourself as a worker? Words like reliable, creative, organized, hardworking, or communicative are useful — or use your own words.',
        optional: true,
      };
    case 'done':
      return { text: '', optional: false };
  }
}

function apply(session: ResumeSession, step: ResumeStep): ResumeSession {
  const { optional } = askFor(step);
  return { ...session, step, optional };
}

function findEntry(session: ResumeSession, id: string) {
  return session.experiences.find((e) => e.id === id);
}

function patchEntry(session: ResumeSession, id: string, rawLine: string, dates?: string): ResumeSession {
  return {
    ...session,
    experiences: session.experiences.map((e) =>
      e.id === id
        ? {
            ...e,
            raw: rawLine.trim() ? [...e.raw, rawLine.trim()] : e.raw,
            dates: dates ?? e.dates,
          }
        : e,
    ),
  };
}

function afterExperience(session: ResumeSession, kind: ExperienceKind, draftId: string): ResumeSession {
  const entry = findEntry(session, draftId);
  const blob = entry?.raw.join(' ') ?? '';
  if (entry && !entry.dates && !hasDates(blob)) {
    return apply(session, { id: 'dates', kind, draftId });
  }
  if (entry && needsFollowup(blob)) {
    return apply(session, { id: 'followup', kind, draftId, round: 0 });
  }
  return apply(session, { id: 'another', kind });
}

function isNo(text: string): boolean {
  return /^(no|nope|nah|that's all|thats all|done|finished|nothing else)$/i.test(text.trim().replace(/[.!]+$/, ''));
}

function isYes(text: string): boolean {
  return /^(yes|yep|yeah|sure|one more|another)$/i.test(text.trim().replace(/[.!]+$/, ''));
}

function finish(session: ResumeSession, note?: string) {
  const finished = apply(session, { id: 'done' });
  return {
    session: finished,
    document: buildResumeDocument(finished),
    reply:
      note ??
      "I'm turning that into a professional one-page resume. Preview it below, download the PDF, or edit a section and regenerate.",
  };
}

export function nextResumeTurn(
  session: ResumeSession,
  userText: string,
): { session: ResumeSession; reply: string; document?: ResumeDocument } {
  const text = userText.trim();
  const step = session.step;

  if (step.id === 'name') {
    if (!text || isSkip(text) || text.length < 2) {
      return {
        session: apply(session, { id: 'name' }),
        reply: 'I need a full name for the top of the resume. What name should we use?',
      };
    }
    const next = apply({ ...session, name: text }, { id: 'address' });
    return { session: next, reply: `Thanks, ${text}. ${askFor(next.step).text}` };
  }

  if (step.id === 'address') {
    const next = apply(
      { ...session, address: isSkip(text) ? '' : text },
      { id: 'email' },
    );
    return { session: next, reply: askFor(next.step).text };
  }

  if (step.id === 'email') {
    const next = apply({ ...session, email: isSkip(text) ? '' : text }, { id: 'phone' });
    return { session: next, reply: askFor(next.step).text };
  }

  if (step.id === 'phone') {
    const next = apply({ ...session, phone: isSkip(text) ? '' : text }, { id: 'goal' });
    return { session: next, reply: askFor(next.step).text };
  }

  if (step.id === 'goal') {
    const next = apply({ ...session, goal: isSkip(text) ? '' : text }, { id: 'education' });
    return { session: next, reply: askFor(next.step).text };
  }

  if (step.id === 'education') {
    if (isSkip(text)) {
      const next = apply({ ...session, educationRaw: '' }, nextCategory());
      return { session: next, reply: askFor(next.step).text };
    }
    const next = apply({ ...session, educationRaw: text }, { id: 'education_more' });
    return { session: next, reply: askFor(next.step).text };
  }

  if (step.id === 'education_more') {
    const next = apply(
      { ...session, educationExtra: isSkip(text) ? '' : text },
      nextCategory(),
    );
    return { session: next, reply: askFor(next.step).text };
  }

  if (step.id === 'category') {
    if (isSkip(text) || isNo(text)) {
      const next = apply(session, nextCategory(step.kind));
      if (next.step.id === 'traits' && session.traitsRaw.trim()) {
        return finish(next);
      }
      return { session: next, reply: askFor(next.step).text };
    }
    const dates = extractDates(text);
    const id = `e${session.experiences.length + 1}-${step.kind}`;
    const withExp: ResumeSession = {
      ...session,
      experiences: [...session.experiences, { id, kind: step.kind, raw: [text], dates }],
    };
    const next = afterExperience(withExp, step.kind, id);
    return { session: next, reply: askFor(next.step).text };
  }

  if (step.id === 'dates') {
    const dates = isSkip(text) ? undefined : extractDates(text) ?? text;
    const updated = patchEntry(session, step.draftId, '', dates);
    const entry = findEntry(updated, step.draftId);
    const blob = entry?.raw.join(' ') ?? '';
    if (entry && needsFollowup(blob)) {
      const next = apply(updated, { id: 'followup', kind: step.kind, draftId: step.draftId, round: 0 });
      return { session: next, reply: askFor(next.step).text };
    }
    const next = apply(updated, { id: 'another', kind: step.kind });
    return { session: next, reply: askFor(next.step).text };
  }

  if (step.id === 'followup') {
    const updated =
      isSkip(text) || isNo(text) || /^done$/i.test(text) ? session : patchEntry(session, step.draftId, text);
    const blob = findEntry(updated, step.draftId)?.raw.join(' ') ?? '';
    if (step.round === 0 && !isSkip(text) && !/^done$/i.test(text) && needsFollowup(blob)) {
      const next = apply(updated, { id: 'followup', kind: step.kind, draftId: step.draftId, round: 1 });
      return { session: next, reply: askFor(next.step).text };
    }
    const next = apply(updated, { id: 'another', kind: step.kind });
    return { session: next, reply: askFor(next.step).text };
  }

  if (step.id === 'another') {
    if (isYes(text)) {
      const next = apply(session, { id: 'category', kind: step.kind });
      return {
        session: next,
        reply: `Okay — tell me about the next ${CATEGORY_LABEL[step.kind]}. What was it, what did you do, and when?`,
      };
    }
    const next = apply(session, nextCategory(step.kind));
    if (next.step.id === 'traits' && session.traitsRaw.trim()) {
      return finish(next);
    }
    return { session: next, reply: askFor(next.step).text };
  }

  if (step.id === 'traits') {
    return finish({ ...session, traitsRaw: isSkip(text) ? session.traitsRaw : text });
  }

  return finish(session, 'Your resume is ready. You can edit the text below and regenerate the PDF.');
}

export function continueResume(session: ResumeSession): { session: ResumeSession; reply: string } {
  const next = apply(session, { id: 'category', kind: 'other' });
  return { session: next, reply: askFor(next.step).text };
}
