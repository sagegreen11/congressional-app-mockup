export type InterviewTurn = {
  role: 'interviewer' | 'candidate';
  text: string;
  themeId?: string;
};

export const OPENING_QUESTION = 'What kind of job are you looking for?';

export const FUN_QUESTION = 'What do you like to do for fun?';

type Signal = { label: string; evidence: string };

type Reading = {
  raw: string;
  wordCount: number;
  isShort: boolean;
  isVague: boolean;
  hasStory: boolean;
  hasMethod: boolean;
  hasOutcome: boolean;
  usesWe: boolean;
  usesI: boolean;
  fillerHeavy: boolean;
  statedTraits: Signal[];
  impliedTraits: Signal[];
  emotions: Signal[];
  motives: Signal[];
  values: Signal[];
  behaviors: Signal[];
  sentences: string[];
};

type Portrait = {
  traits: Signal[];
  emotions: Signal[];
  motives: Signal[];
  values: Signal[];
  behaviors: Signal[];
  readings: Reading[];
  jobInterest: string;
  hobby: string;
};

type Candidate = {
  id: string;
  reaction: string;
  question: string;
};

const VAGUE =
  /\b(stuff|whatever|idk|i don't know|i dont know|not sure|kind of|sort of|maybe|nothing much|the usual)\b/i;

const METHOD =
  /\b(tested|tried|practiced|figured|fixed|asked|changed|kept (going|trying|at it)|refused to stop|until i figured)\b/i;

const OUTCOME =
  /\b(until i figured|until i stopped|stopped making|it worked|i finished|i got it|we got it|changed the outcome|in the end|finally)\b/i;

const FILLER = /\b(like|you know|um+|uh+|basically|literally|i mean)\b/gi;

const QUESTION_STOP = new Set([
  'what',
  'when',
  'where',
  'which',
  'who',
  'how',
  'why',
  'do',
  'does',
  'did',
  'is',
  'are',
  'was',
  'were',
  'can',
  'could',
  'would',
  'should',
  'you',
  'your',
  'yours',
  'the',
  'a',
  'an',
  'and',
  'or',
  'to',
  'of',
  'in',
  'on',
  'for',
  'with',
  'that',
  'this',
  'there',
  'about',
  'me',
  'i',
  'we',
  'it',
  'if',
  'so',
  'as',
  'at',
  'be',
  'been',
  'have',
  'has',
  'had',
  'from',
  'just',
  'really',
  'pretty',
  'very',
]);

const TRAIT_WORDS: { label: string; pattern: RegExp }[] = [
  { label: 'persistent', pattern: /\b(persistent|persistence|stubborn|wouldn't stop|would not stop|refused to stop|didn't give up|did not give up|kept (going|trying|at it)|until i figured)\b/i },
  { label: 'competitive', pattern: /\b(competitive|compete|winning|beat)\b/i },
  { label: 'reliable', pattern: /\b(reliable|on time|show up|dependable|responsible)\b/i },
  { label: 'curious', pattern: /\b(curious|curiosity|wanted to understand|figure out why)\b/i },
  { label: 'helpful', pattern: /\b(helpful|helping|help people|take care of)\b/i },
  { label: 'calm', pattern: /\b(calm|patient|patience)\b/i },
  { label: 'hardworking', pattern: /\b(hardworking|hard-working|work hard|put in the hours)\b/i },
  { label: 'independent', pattern: /\b(independent|on my own|by myself)\b/i },
  { label: 'organized', pattern: /\b(organized|organisation|organization|planning ahead)\b/i },
  { label: 'creative', pattern: /\b(creative|creativity)\b/i },
  { label: 'honest', pattern: /\b(honest|honesty)\b/i },
  { label: 'ambitious', pattern: /\b(ambitious|ambition|i want to get better)\b/i },
  { label: 'caring', pattern: /\b(caring|kind|empathetic)\b/i },
  { label: 'shy', pattern: /\b(shy|quiet|introverted)\b/i },
  { label: 'outgoing', pattern: /\b(outgoing|extroverted|people person)\b/i },
];

const EMOTIONS: { label: string; pattern: RegExp }[] = [
  { label: 'frustrated', pattern: /\b(frustrated|frustrating|annoyed|stuck)\b/i },
  { label: 'proud', pattern: /\b(proud|pride)\b/i },
  { label: 'nervous', pattern: /\b(nervous|anxious|scared|intimidated)\b/i },
  { label: 'excited', pattern: /\b(excited|pumped|eager)\b/i },
  { label: 'stressed', pattern: /\b(stressed|overwhelmed|pressure)\b/i },
];

const VALUE_HINTS: { label: string; pattern: RegExp }[] = [
  { label: 'solving real problems', pattern: /\b(needed|real problem|actually help|for my church|for my family)\b/i },
  { label: 'doing the work yourself', pattern: /\b(i built|i made|i tested|i figured)\b/i },
  { label: 'showing up for people', pattern: /\b(customers|neighbors|team|family|church)\b/i },
  { label: 'getting things right', pattern: /\b(until it worked|figured it out|refused to stop)\b/i },
];

const BEHAVIORS: { label: string; pattern: RegExp }[] = [
  { label: 'taking the lead in groups', pattern: /\b(take the lead|take charge|in charge|lead the group|when working in groups)\b/i },
  { label: 'working in groups', pattern: /\b(in groups|group work|on a team|with a team|teamwork)\b/i },
  { label: 'teaching yourself', pattern: /\b(taught myself|self-taught|on my own|learning programming|started learning)\b/i },
  { label: 'staying until it is right', pattern: /\b(refused to stop|until i figured|over and over|again and again)\b/i },
  { label: 'helping when it is busy', pattern: /\b(when (the store is |it('s| is) )?busy|slammed|helping customers)\b/i },
];

const JOB_KINDS: { label: string; pattern: RegExp }[] = [
  { label: 'software engineering', pattern: /\b(software|programming|programmer|coding|developer|engineer)\b/i },
  { label: 'grocery or retail', pattern: /\b(grocery|retail|cashier|store|sales associate)\b/i },
  { label: 'food service', pattern: /\b(cafe|café|restaurant|barista|kitchen|food)\b/i },
  { label: 'warehouse work', pattern: /\b(warehouse|stock|shipping|logistics)\b/i },
  { label: 'childcare', pattern: /\b(childcare|daycare|babysit|kids)\b/i },
  { label: 'healthcare', pattern: /\b(nurse|cna|hospital|caregiver|medical)\b/i },
  { label: 'office or admin work', pattern: /\b(office|admin|receptionist|clerical)\b/i },
];

const HOBBY_KINDS: { label: string; pattern: RegExp }[] = [
  { label: 'building games', pattern: /\b(games?|gaming|unity|roblox|minecraft)\b/i },
  { label: 'making things', pattern: /\b(build|building|make|making|diy|craft)\b/i },
  { label: 'music', pattern: /\b(music|guitar|piano|singing|band)\b/i },
  { label: 'sports', pattern: /\b(soccer|basketball|football|gym|running|sports)\b/i },
  { label: 'art', pattern: /\b(draw|drawing|art|paint|design)\b/i },
  { label: 'cooking', pattern: /\b(cook|cooking|bake|baking)\b/i },
  { label: 'reading', pattern: /\b(read|reading|books)\b/i },
  { label: 'being outdoors', pattern: /\b(hike|hiking|outdoors|fishing|garden)\b/i },
];

function labelFrom(text: string, bank: { label: string; pattern: RegExp }[], fallbackMax = 8) {
  const hit = bank.find((item) => item.pattern.test(text));
  if (hit) return hit.label;
  const stripped = text.replace(
    /^(i('m| am) looking for|i want|maybe|i like to|i enjoy|for fun i|in my free time i)\s+/i,
    '',
  );
  return clip(stripped, fallbackMax) || 'that';
}

function candidateTurns(turns: InterviewTurn[]) {
  return turns.filter((turn) => turn.role === 'candidate');
}

function interviewerTurns(turns: InterviewTurn[]) {
  return turns.filter((turn) => turn.role === 'interviewer');
}

function pairedAnswers(turns: InterviewTurn[]) {
  const pairs: { question: string; answer: string }[] = [];
  let pending: string | null = null;
  for (const turn of turns) {
    if (turn.role === 'interviewer') pending = turn.text;
    if (turn.role === 'candidate' && pending) {
      pairs.push({ question: pending, answer: turn.text });
      pending = null;
    }
  }
  return pairs;
}

function clean(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function wordCount(text: string) {
  return clean(text).split(/\s+/).filter(Boolean).length;
}

function clip(text: string, maxWords = 12) {
  const parts = clean(text).split(' ');
  return parts.length <= maxWords ? parts.join(' ') : `${parts.slice(0, maxWords).join(' ')}`;
}

function asHeard(text: string) {
  return clip(text, 18)
    .replace(/\bI'm\b/g, "you're")
    .replace(/\bI've\b/g, "you've")
    .replace(/\bI\b/g, 'you')
    .replace(/\bmy\b/gi, 'your');
}

function sentencesOf(text: string) {
  return clean(text)
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function sentenceWith(text: string, pattern: RegExp) {
  return sentencesOf(text).find((sentence) => pattern.test(sentence)) ?? clip(text, 16);
}

function uniqueSignals(list: Signal[]) {
  const seen = new Set<string>();
  return list.filter((item) => {
    const key = item.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function matchSignals(text: string, bank: { label: string; pattern: RegExp }[]): Signal[] {
  return bank
    .filter((item) => item.pattern.test(text))
    .map((item) => ({ label: item.label, evidence: sentenceWith(text, item.pattern) }));
}

function statedTraits(text: string): Signal[] {
  const intro =
    text.match(/describe myself as ([^.!?]+)/i)?.[1] ??
    text.match(/\b(?:i am|i'm|i’d say i(?:'m| am)|i tend to)\s+([^.!?]+)/i)?.[1];
  if (!intro) return [];
  return uniqueSignals(
    TRAIT_WORDS.filter((trait) => new RegExp(`\\b${trait.label}\\b`, 'i').test(intro)).map((trait) => ({
      label: trait.label,
      evidence: clip(intro, 14),
    })),
  );
}

function impliedTraits(text: string): Signal[] {
  const found: Signal[] = [];
  if (/\b(refused to stop|wouldn't stop|kept (getting|trying|going)|until i figured|didn't give up)\b/i.test(text)) {
    found.push({ label: 'persistent', evidence: sentenceWith(text, /refused|figured|kept getting|give up/i) });
  }
  if (/\b(practiced|over and over|again and again|until (i|it) (got it|worked|succeeded))\b/i.test(text)) {
    found.push({ label: 'competitive', evidence: sentenceWith(text, /practiced|over and over|again/i) });
  }
  if (/\b(on time|showed up|didn't miss)\b/i.test(text)) {
    found.push({ label: 'reliable', evidence: sentenceWith(text, /on time|showed up/i) });
  }
  if (/\b(helping customers|helped my|took care of)\b/i.test(text)) {
    found.push({ label: 'helpful', evidence: sentenceWith(text, /help|take care/i) });
  }
  if (/\b(take the lead|take charge|in charge)\b/i.test(text)) {
    found.push({ label: 'comfortable leading', evidence: sentenceWith(text, /lead|charge/i) });
  }
  return uniqueSignals(found);
}

function motivesIn(text: string): Signal[] {
  const because = text.match(/because ([^.!?]+)/i)?.[1];
  const wanted = text.match(/i wanted to ([^.!?]+)/i)?.[1];
  const found: Signal[] = [];
  if (because) found.push({ label: clip(because, 12), evidence: clip(because, 16) });
  if (wanted) found.push({ label: `wanting to ${clip(wanted, 10)}`, evidence: clip(wanted, 16) });
  return found;
}

function readAnswer(text: string): Reading {
  const raw = clean(text);
  const count = wordCount(raw);
  const stated = uniqueSignals(statedTraits(raw));
  const implied = uniqueSignals(impliedTraits(raw)).filter(
    (item) => !stated.some((trait) => trait.label === item.label),
  );
  return {
    raw,
    wordCount: count,
    isShort: (count < 8 && stated.length === 0 && implied.length === 0) || count <= 3,
    isVague: VAGUE.test(raw) && count < 20 && stated.length === 0,
    hasStory: count >= 18 || /\b(when i|one time|i started|i built|i kept|because)\b/i.test(raw),
    hasMethod: METHOD.test(raw),
    hasOutcome: OUTCOME.test(raw),
    usesWe: /\bwe\b/i.test(raw) && !/\bi\b/i.test(raw),
    usesI: /\bi\b/i.test(raw),
    fillerHeavy: (raw.match(FILLER)?.length ?? 0) >= 3,
    statedTraits: stated,
    impliedTraits: implied,
    emotions: matchSignals(raw, EMOTIONS),
    motives: motivesIn(raw),
    values: matchSignals(raw, VALUE_HINTS),
    behaviors: matchSignals(raw, BEHAVIORS),
    sentences: sentencesOf(raw),
  };
}

function portraitOf(turns: InterviewTurn[]): Portrait {
  const readings = candidateTurns(turns).map((turn) => readAnswer(turn.text));
  return {
    readings,
    traits: uniqueSignals(readings.flatMap((reading) => [...reading.statedTraits, ...reading.impliedTraits])),
    emotions: uniqueSignals(readings.flatMap((reading) => reading.emotions)),
    motives: uniqueSignals(readings.flatMap((reading) => reading.motives)),
    values: uniqueSignals(readings.flatMap((reading) => reading.values)),
    behaviors: uniqueSignals(readings.flatMap((reading) => reading.behaviors)),
    jobInterest: readings[0] ? labelFrom(readings[0].raw, JOB_KINDS) : '',
    hobby: readings[1] ? labelFrom(readings[1].raw, HOBBY_KINDS) : '',
  };
}

function contentTokens(text: string) {
  return new Set(
    clean(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2 && !QUESTION_STOP.has(token)),
  );
}

function questionOnly(text: string) {
  const mark = text.lastIndexOf('?');
  if (mark < 0) return text;
  const start = text.lastIndexOf('.', mark - 1);
  return text.slice(start + 1, mark + 1).trim();
}

function tooSimilar(a: string, b: string) {
  const left = contentTokens(questionOnly(a));
  const right = contentTokens(questionOnly(b));
  if (left.size === 0 || right.size === 0) return false;
  let overlap = 0;
  for (const token of left) {
    if (right.has(token)) overlap += 1;
  }
  const ratio = overlap / Math.min(left.size, right.size);
  return ratio >= 0.5;
}

function alreadyAsked(turns: InterviewTurn[], candidate: Candidate) {
  const spoken = `${candidate.reaction} ${candidate.question}`;
  return interviewerTurns(turns)
    .filter((turn) => turn.text !== OPENING_QUESTION && !turn.text.includes(FUN_QUESTION))
    .some((turn) => tooSimilar(turn.text, spoken) || tooSimilar(turn.text, candidate.question));
}

function askedIds(turns: InterviewTurn[]) {
  return new Set(interviewerTurns(turns).map((turn) => turn.themeId).filter(Boolean) as string[]);
}

function pair(candidate: Candidate) {
  return `${candidate.reaction} ${candidate.question}`.replace(/\s+/g, ' ').trim();
}

function candidatesFor(last: Reading, portrait: Portrait, answerIndex: number): Candidate[] {
  const out: Candidate[] = [];
  const push = (id: string, reaction: string, question: string) => {
    out.push({ id, reaction, question });
  };

  const trait = last.statedTraits[0] ?? last.impliedTraits[0];
  const emotion = last.emotions[0];
  const motive = last.motives[0];
  const behavior = last.behaviors[0];
  const snippet = asHeard((last.sentences[0] ?? last.raw).replace(/[.?!]+$/, ''));
  const job = portrait.jobInterest;
  const hobby = portrait.hobby;

  if (job && hobby && answerIndex >= 1) {
    push(
      'job-hobby-link',
      `${hobby[0].toUpperCase()}${hobby.slice(1)} in your free time and looking at ${job} is not a random pair.`,
      `What part of ${hobby} do you think would actually show up in ${job} work?`,
    );
    push(
      'hobby-into-job',
      `You already spend time on ${hobby}, and you want ${job}.`,
      `When ${hobby} gets frustrating, what do you do — and is that how you'd want to work on the job too?`,
    );
    push(
      'job-fit',
      `So the job you're aiming at is ${job}.`,
      `What about that kind of work feels like a fit with how you already like to spend your time?`,
    );
    push(
      'hobby-story',
      `I'm more interested in how you are when you're doing ${hobby} than in a generic work speech.`,
      `Tell me about a time ${hobby} didn't go smoothly and what you did next.`,
    );
  }

  if (last.usesWe && !last.usesI) {
    push(
      'need-i',
      `I heard the group in that answer more clearly than I heard you.`,
      `What did you personally do that someone else on the team did not?`,
    );
  }

  if (last.isShort && last.wordCount <= 3 && !(last.usesWe && !last.usesI)) {
    push(
      'expand-tiny',
      `I only caught "${last.raw.replace(/[.?!]+$/, '')}."`,
      `What were you actually trying to tell me about yourself there?`,
    );
  } else if (last.isShort) {
    push(
      'expand-short',
      `That was only a start — ${snippet}.`,
      `Can you give me one real moment that shows what you mean?`,
    );
  }

  if (last.isVague) {
    push(
      'clarify-vague',
      `I'm still missing the actual picture behind ${asHeard(clip(last.raw, 8))}.`,
      `If I watched you handle a hard hour, what would I notice about how you behave?`,
    );
  }

  if (behavior?.label === 'taking the lead in groups') {
    push(
      'lead-comfort',
      `You mentioned that you tend to take the lead when working in groups.`,
      `What do you think makes you comfortable taking on that role?`,
    );
    push(
      'lead-conflict',
      `Taking the lead in a group is different from just having ideas.`,
      `What do you do when someone else in the group wants to go a different way?`,
    );
  }

  if (behavior?.label === 'working in groups' && behavior.label !== 'taking the lead in groups') {
    push(
      'group-role',
      `You brought up working in a group, not just working alone.`,
      `What part of that do you usually take on without being asked?`,
    );
  }

  if (last.statedTraits.length && emotion) {
    push(
      `trait-emotion:${trait?.label}:${emotion.label}`,
      `You describe yourself as pretty ${last.statedTraits[0].label}, even when you're ${emotion.label}.`,
      `Has there been a time when that ${last.statedTraits[0].label} side really changed the outcome of a difficult situation?`,
    );
  }

  if (last.statedTraits.length > 1) {
    push(
      `two-traits:${last.statedTraits.map((item) => item.label).join('+')}`,
      `You called yourself ${last.statedTraits
        .slice(0, 2)
        .map((item) => item.label)
        .join(' and ')} — those don't always show up the same way.`,
      `When do you notice the ${last.statedTraits[0].label} side taking over, and when does the ${last.statedTraits[1].label} side?`,
    );
  } else if (last.statedTraits.length === 1 && last.hasStory) {
    push(
      `trait-story:${last.statedTraits[0].label}`,
      `The way you tell that, ${last.statedTraits[0].label} isn't a slogan — it's how you handled ${asHeard(clip(last.sentences[last.sentences.length - 1] ?? last.raw, 10))}.`,
      `What did you do in the moment you were most tempted to stop?`,
    );
  } else if (last.statedTraits.length === 1) {
    push(
      `trait-example:${last.statedTraits[0].label}`,
      `You named ${last.statedTraits[0].label} about yourself.`,
      `What's a specific situation where someone else would have seen that in you?`,
    );
  }

  if (last.impliedTraits.length && !last.statedTraits.length) {
    push(
      `implied:${last.impliedTraits[0].label}`,
      `You didn't call yourself ${last.impliedTraits[0].label}. ${asHeard(last.impliedTraits[0].evidence).replace(/[.?!]+$/, '')} — that's ${last.impliedTraits[0].label} in practice.`,
      `Where else has that same instinct shown up?`,
    );
  }

  if (emotion && !last.statedTraits.length) {
    push(
      `emotion:${emotion.label}`,
      `The feeling in that story is ${emotion.label}, not just the task.`,
      `When that feeling hits, what do you do next instead of walking away?`,
    );
  }

  if (motive) {
    push(
      `motive:${motive.label}`,
      `It sounds like the driver was ${asHeard(motive.label)}, more than the activity on the surface.`,
      `What about that still matters to you now?`,
    );
    push(
      `motive-cost:${motive.label}`,
      `Staying with ${asHeard(motive.label)} usually costs something — time, pride, or an easier option.`,
      `What did you give up to keep going?`,
    );
  }

  if (last.hasMethod) {
    push(
      'method-next',
      `You didn't just name the problem — you said how you worked it: ${asHeard(sentenceWith(last.raw, METHOD))}.`,
      `What told you that approach was working?`,
    );
    push(
      'method-again',
      `That is a hands-on way of learning, not a speech about trying hard.`,
      `If you had to do that again next week, what would you change first?`,
    );
  }

  if (behavior?.label === 'helping when it is busy') {
    push(
      'busy-priority',
      `Helping when it is busy says more about how you work than about the job title.`,
      `When everything is happening at once, how do you decide what to do first?`,
    );
  }

  const earlier = portrait.traits.find((item) => {
    const before = portrait.readings.slice(0, -1).some((reading) =>
      [...reading.statedTraits, ...reading.impliedTraits].some((signal) => signal.label === item.label),
    );
    const now = [...last.statedTraits, ...last.impliedTraits].some((signal) => signal.label === item.label);
    return before && now;
  });
  if (earlier && answerIndex >= 1) {
    push(
      `connect:${earlier.label}:${answerIndex}`,
      `That lines up with you talking about being ${earlier.label} earlier.`,
      `How does being ${earlier.label} show up in what you just described?`,
    );
  }

  const unusedTrait = portrait.traits.find(
    (item) => !last.statedTraits.some((signal) => signal.label === item.label) && answerIndex >= 1,
  );
  if (unusedTrait) {
    push(
      `bridge:${unusedTrait.label}:${clip(last.raw, 6)}`,
      `I'm still holding onto you being ${unusedTrait.label}, and now you're talking about ${asHeard(clip(last.raw.replace(/^(yeah|yes|ok|okay|i guess)[,.]?\s+/i, ''), 10))}.`,
      `Do those two things pull in the same direction for you, or do they clash?`,
    );
  }

  if (last.hasStory && !last.hasOutcome) {
    push(
      'need-result',
      `I can follow the situation, but not yet what changed because of you.`,
      `How did it turn out after you stepped in?`,
    );
  }

  if (answerIndex >= 4) {
    push(
      'wrap-up',
      portrait.jobInterest || portrait.hobby
        ? `I'm starting to get a picture: ${[portrait.jobInterest && `you want ${portrait.jobInterest}`, portrait.hobby && `you spend free time on ${portrait.hobby}`, portrait.traits[0] && `you come across as ${portrait.traits[0].label}`]
            .filter(Boolean)
            .join(', ')}.`
        : portrait.traits[0]
          ? `The picture I'm getting is someone who is ${portrait.traits
              .slice(0, 2)
              .map((item) => item.label)
              .join(' and ')}.`
          : `You've given me a few sides of how you work.`,
      `Before we stop, is there one more thing a hiring manager should understand about you?`,
    );
  }

  if (out.length === 0) {
    push(
      `open:${clip(last.raw, 5)}`,
      `I'm paying attention to ${snippet}.`,
      `What about that feels most like you, not just like the situation?`,
    );
  }

  return out;
}

export function nextInterviewerLine(
  turns: InterviewTurn[],
): { kind: 'question' | 'complete'; text: string; themeId?: string } {
  const answers = candidateTurns(turns);
  if (answers.length >= 6) {
    return { kind: 'complete', text: buildInterviewReview(turns) };
  }

  const last = readAnswer(answers[answers.length - 1]?.text.trim() ?? '');
  const portrait = portraitOf(turns);

  if (answers.length === 1) {
    const job = portrait.jobInterest || asHeard(clip(last.raw, 8));
    return {
      kind: 'question',
      themeId: 'opener-fun',
      text: pair({
        id: 'opener-fun',
        reaction: last.isShort
          ? `I'll come back to the job side.`
          : `So you're looking at ${job}.`,
        question: FUN_QUESTION,
      }),
    };
  }

  const used = askedIds(turns);
  const options = candidatesFor(last, portrait, answers.length - 1).filter(
    (candidate) => !used.has(candidate.id) && !alreadyAsked(turns, candidate),
  );

  const pick = options[0] ?? {
    id: `fresh:${answers.length}`,
    reaction: portrait.hobby
      ? `I don't want to lose ${portrait.hobby} or ${portrait.jobInterest || 'the job you named'}.`
      : `I don't want to re-ask something we already covered.`,
    question: portrait.jobInterest
      ? `What would you want a hiring manager to understand about how you'd show up in ${portrait.jobInterest}?`
      : `What is one thing about how you work that we have not gotten to yet?`,
  };

  return { kind: 'question', themeId: pick.id, text: pair(pick) };
}

function quote(text: string) {
  const clipped = clip(text, 24);
  return `"${clipped}${wordCount(text) > 24 ? '...' : ''}"`;
}

function communicationNotes(readings: Reading[]) {
  const notes: string[] = [];
  const avg = readings.reduce((sum, reading) => sum + reading.wordCount, 0) / Math.max(readings.length, 1);
  if (avg < 12) {
    notes.push(
      'Clarity: several answers were so short an interviewer had to guess. Why it matters: they cannot hire a blank. How: add what was going on, what you did, and how it ended.',
    );
  } else if (avg > 70) {
    notes.push(
      'Conciseness: you were willing to talk at length. Why it matters: a long answer can hide the point. How: land on what you did and why before you add extra context.',
    );
  } else {
    notes.push('Clarity: answer length was generally usable — enough to follow without losing the thread.');
  }

  if (readings.some((reading) => reading.isVague)) {
    notes.push(
      'Specificity: a few answers stayed general. Why it matters: vague language is forgettable. How: replace "stuff" or "the usual" with one concrete action.',
    );
  }

  if (readings.filter((reading) => reading.hasStory).length < Math.ceil(readings.length / 2)) {
    notes.push(
      'Organization: some answers named a quality without a beginning, middle, and end. How: use one situation per claim.',
    );
  } else {
    notes.push('Organization: you often spoke in situations, which is easier to remember than a list of claims.');
  }

  if (readings.some((reading) => reading.fillerHeavy)) {
    notes.push(
      'Filler: the transcript shows repeated phrasing like "like" or "you know." Why it matters: it can make a strong point sound unsure. How: pause instead of filling the gap.',
    );
  }

  if (readings.some((reading) => reading.usesWe && !reading.usesI)) {
    notes.push(
      'Ownership: group language showed up without a clear "I." Why it matters: the interviewer cannot tell what to hire. How: say the step that was yours.',
    );
  }

  return notes;
}

function growthItem(title: string, what: string, why: string, how: string, evidence?: string) {
  return [
    `**${title}**`,
    `What: ${what}`,
    `Why: ${why}`,
    `How: ${how}`,
    evidence ? `From this interview: ${evidence}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildInterviewReview(turns: InterviewTurn[]): string {
  const portrait = portraitOf(turns);
  const readings = portrait.readings;
  const pairs = pairedAnswers(turns);

  if (readings.length === 0) {
    return [
      'Interview Overview',
      'There was not enough spoken material yet to write a fair report.',
      '',
      'Key Takeaways',
      '• Answer one question with a full situation: what happened, what you did, and how it turned out.',
    ].join('\n');
  }

  const traitList = portrait.traits.map((item) => item.label);
  const overview =
    readings.length === 1
      ? `This was a short exchange. You mainly said ${quote(readings[0].raw)}.`
      : `Over ${readings.length} answers, you came across as someone interested in ${
          portrait.jobInterest || 'work'
        }${portrait.hobby ? `, who spends free time on ${portrait.hobby}` : ''}${
          traitList.length ? `, and who is ${traitList.slice(0, 3).join(', ')}` : ''
        }. The later questions followed what you actually raised, not a generic script.`;

  const presented = [
    traitList.length
      ? `Recurring traits: ${traitList.join(', ')}.`
      : 'You spoke more about activities than about how you see yourself.',
    portrait.behaviors[0] ? `How you described your behavior: ${portrait.behaviors.map((item) => item.label).join(', ')}.` : null,
    portrait.motives[0] ? `Motivation that came through: ${portrait.motives[0].label}.` : null,
    portrait.emotions[0]
      ? `Emotion you were willing to name: ${portrait.emotions.map((item) => item.label).join(' and ')}.`
      : null,
    portrait.values[0] ? `What seemed to matter to you: ${portrait.values.map((item) => item.label).join(', ')}.` : null,
  ]
    .filter(Boolean)
    .join(' ');

  const strengths: string[] = [];
  const traitStory = readings.find((reading) => reading.statedTraits.length && reading.hasStory);
  if (traitStory) {
    strengths.push(
      `You connected a self-description (${traitStory.statedTraits.map((item) => item.label).join(', ')}) to a real moment. Evidence: ${quote(traitStory.raw)} That is stronger than listing adjectives alone.`,
    );
  }
  const implied = readings.find((reading) => reading.impliedTraits.length);
  if (implied) {
    strengths.push(
      `Your behavior showed a trait even when you did not label it (${implied.impliedTraits[0].label}). Evidence: ${quote(implied.impliedTraits[0].evidence)}`,
    );
  }
  const method = readings.find((reading) => reading.hasMethod);
  if (method) {
    strengths.push(`You explained what you actually did next, not only that something was hard. Evidence: ${quote(method.raw)}`);
  }
  const motive = readings.find((reading) => reading.motives.length);
  if (motive) {
    strengths.push(
      `You gave a reason, not just an event, which helps someone understand your judgment. Evidence: ${quote(motive.motives[0].evidence)}`,
    );
  }
  if (strengths.length === 0) {
    strengths.push(`You stayed in the conversation and answered in your own words rather than reciting a script. Evidence: ${quote(readings[0].raw)}`);
  }

  const growth: string[] = [];
  if (readings.some((reading) => reading.statedTraits.length) && !readings.some((reading) => reading.hasStory || reading.hasMethod)) {
    const trait = readings.find((reading) => reading.statedTraits.length)?.statedTraits[0];
    growth.push(
      growthItem(
        'Be more specific with examples',
        `You described yourself as ${trait?.label}, but you did not walk through a situation with a beginning, your action, and a result.`,
        'A hiring manager cannot tell the difference between a trait you have and a trait you wish you had.',
        'Pick one moment. Say what was going wrong, what you did, and what changed.',
        trait ? quote(trait.evidence) : undefined,
      ),
    );
  }
  if (readings.some((reading) => reading.usesWe && !reading.usesI)) {
    const sample = readings.find((reading) => reading.usesWe && !reading.usesI);
    growth.push(
      growthItem(
        'Name your role',
        'At least one answer stayed with "we," so your personal work was hard to see.',
        'Interviewers hire a person, not a whole group.',
        'After you mention the team, add one sentence that starts with "I" and names your step.',
        sample ? quote(sample.raw) : undefined,
      ),
    );
  }
  if (readings.some((reading) => reading.isShort || reading.isVague)) {
    const sample = readings.find((reading) => reading.isShort || reading.isVague);
    growth.push(
      growthItem(
        'Develop thin answers',
        'At least one response was too brief or too general to use.',
        'Short or vague answers force the interviewer to invent the rest — and they may invent the wrong thing.',
        'Use three beats: situation, what you did, how it turned out.',
        sample ? quote(sample.raw) : undefined,
      ),
    );
  }
  if (traitList.length && !readings.some((reading) => reading.hasOutcome)) {
    growth.push(
      growthItem(
        'Connect traits to results',
        `You came across as ${traitList[0]}, but we did not hear a time that trait changed the outcome.`,
        'Persistence or competitiveness only lands if something was different because you stayed with it.',
        'End the story with the result: what worked, what you learned, or what you would do again.',
      ),
    );
  }
  if (readings.some((reading) => reading.hasStory && !reading.hasMethod && !reading.statedTraits.length)) {
    const sample = readings.find((reading) => reading.hasStory && !reading.hasMethod && !reading.statedTraits.length);
    growth.push(
      growthItem(
        'Say what you did, not only what happened',
        'Some stories described a problem without your specific steps.',
        'The interviewer needs a behavior they can picture you repeating at work.',
        'Add the action: asked, tested, stayed, split the work, checked again.',
        sample ? quote(sample.raw) : undefined,
      ),
    );
  }
  if (growth.length === 0) {
    growth.push(
      growthItem(
        'Tie the same behavior to the job',
        'You already gave usable material, but it still lives in the past tense of the story.',
        'Hiring managers want to know the behavior will show up on a shift, not only in the example.',
        'Close with one sentence: how that same approach would show up in the first month of work.',
      ),
    );
  }

  const comm = communicationNotes(readings);

  const perQuestion = pairs
    .map((pairItem, index) => {
      const reading = readAnswer(pairItem.answer);
      const worked = reading.statedTraits.length
        ? `You revealed how you see yourself (${reading.statedTraits.map((item) => item.label).join(', ')}).`
        : reading.behaviors.length
          ? `You described an actual way you behave (${reading.behaviors[0].label}).`
          : reading.hasStory
            ? `You offered a situation instead of a one-word claim.`
            : `You answered in your own words.`;
      const improve = reading.isShort
        ? `The answer was too brief to hang onto.`
        : reading.isVague
          ? `The language stayed general, so the meaning was easy to miss.`
          : !reading.usesI && reading.usesWe
            ? `Your personal role was unclear.`
            : !reading.hasOutcome && reading.hasStory
              ? `We heard the struggle more clearly than the result.`
              : `You could add one sentence about what you would do the same way at work.`;
      const suggestion = reading.isShort
        ? `Restart with: "One time I... I did... and it ended with..."`
        : `Keep the same story, and add what you personally did and what changed because of it.`;
      return [
        `${index + 1}. ${clip(questionOnly(pairItem.question), 20)}`,
        `   You said: ${quote(pairItem.answer)}`,
        `   What worked: ${worked}`,
        `   What could be stronger: ${improve}`,
        `   Try this: ${suggestion}`,
      ].join('\n');
    })
    .join('\n\n');

  const takeaways = [
    traitList[0]
      ? `If you lead with ${traitList[0]}, immediately back it with a moment.`
      : `Pick one sentence about how you work, then prove it with a story.`,
    `In group stories, say "I" for your part.`,
    `End with a result: what changed because you stayed with it.`,
  ];

  return [
    'Interview Overview',
    overview,
    '',
    'How You Presented Yourself',
    presented,
    '',
    'Strengths',
    strengths.map((item, index) => `${index + 1}. ${item}`).join('\n'),
    '',
    'Areas for Improvement',
    growth.map((item, index) => `${index + 1}. ${item}`).join('\n\n'),
    '',
    'Communication Feedback',
    comm.map((item) => `• ${item}`).join('\n'),
    '',
    'Question-by-Question Feedback',
    perQuestion || 'Not enough full question-and-answer pairs to review one by one.',
    '',
    'Key Takeaways',
    takeaways.map((item) => `• ${item}`).join('\n'),
  ].join('\n');
}
