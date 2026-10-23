import {
  generatedLine,
  interviewGenerationRequest,
  renderPrompt,
  type InterviewLang,
  type InterviewPrompt,
  type PhraseKey,
} from './interview-locale';

export type { InterviewLang, InterviewPrompt };

export type InterviewTurn = {
  role: 'interviewer' | 'candidate';
  text: string;
  themeId?: string;
  prompt?: InterviewPrompt;
};

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
  reactionKey: PhraseKey;
  reactionVars?: Record<string, string>;
  questionKey: PhraseKey;
  questionVars?: Record<string, string>;
};

const VAGUE =
  /\b(stuff|whatever|idk|i don't know|i dont know|not sure|kind of|sort of|maybe|nothing much|the usual|no sé|no se|nada mucho|no mucho|algo así|algo asi)\b|不知道|还好|随便|没什么|一般/i;

const METHOD =
  /\b(tested|tried|practiced|figured|fixed|asked|changed|kept (going|trying|at it)|refused to stop|until i figured|probé|probe|intenté|intente|practiqué|practique|arreglé|arregle|pregunté|pregunte|cambié|cambie|seguí|segui|no paré|no pare)\b|试了|尝试|练习|修好|问了|改了|一直在/i;

const OUTCOME =
  /\b(until i figured|until i stopped|stopped making|it worked|i finished|i got it|we got it|changed the outcome|in the end|finally|al final|funcionó|funciono|lo logré|lo logre|terminé|termine)\b|最后|终于|成功了|做好了/i;

const FILLER = /\b(like|you know|um+|uh+|basically|literally|i mean|o sea|pues|eh+)\b|那个|就是|嗯+/gi;

const STORY =
  /\b(when i|one time|i started|i built|i kept|because|una vez|empecé|empece|construí|construi|porque|ya que)\b|因为|有一次|那次|当时|后来/i;

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
  { label: 'persistent', pattern: /\b(persistent|persistence|stubborn|wouldn't stop|would not stop|refused to stop|didn't give up|did not give up|kept (going|trying|at it)|until i figured|persistente|perseverante|no me rendí|no me rendi|seguí intentando|segui intentando)\b|坚持|不放弃/i },
  { label: 'competitive', pattern: /\b(competitive|compete|winning|beat|competitivo|competitiva)\b|好胜|竞争/i },
  { label: 'reliable', pattern: /\b(reliable|on time|show up|dependable|responsible|responsable|confiable|fiable)\b|可靠|守时/i },
  { label: 'curious', pattern: /\b(curious|curiosity|wanted to understand|figure out why|curioso|curiosa)\b|好奇/i },
  { label: 'helpful', pattern: /\b(helpful|helping|help people|take care of|servicial|ayudar)\b|乐于助人|帮忙/i },
  { label: 'calm', pattern: /\b(calm|patient|patience|tranquilo|tranquila|paciente)\b|冷静|有耐心/i },
  { label: 'hardworking', pattern: /\b(hardworking|hard-working|work hard|put in the hours|trabajador|trabajadora|esforzado|esforzada)\b|勤奋|努力/i },
  { label: 'independent', pattern: /\b(independent|on my own|by myself|independiente)\b|独立/i },
  { label: 'organized', pattern: /\b(organized|organisation|organization|planning ahead|organizado|organizada)\b|有条理/i },
  { label: 'creative', pattern: /\b(creative|creativity|creativo|creativa)\b|有创造力/i },
  { label: 'honest', pattern: /\b(honest|honesty|honesto|honesta)\b|诚实/i },
  { label: 'ambitious', pattern: /\b(ambitious|ambition|i want to get better|ambicioso|ambiciosa)\b|有进取心/i },
  { label: 'caring', pattern: /\b(caring|kind|empathetic|amable|atento|atenta)\b|体贴|善良/i },
  { label: 'shy', pattern: /\b(shy|quiet|introverted|tímido|timido|tímida|timida)\b|内向|害羞/i },
  { label: 'outgoing', pattern: /\b(outgoing|extroverted|people person|extrovertido|extrovertida)\b|外向/i },
];

const EMOTIONS: { label: string; pattern: RegExp }[] = [
  { label: 'frustrated', pattern: /\b(frustrated|frustrating|annoyed|stuck|frustrad[oa]|atascad[oa])\b|沮丧|卡住|烦/i },
  { label: 'proud', pattern: /\b(proud|pride|orgullos[oa])\b|自豪|骄傲/i },
  { label: 'nervous', pattern: /\b(nervous|anxious|scared|intimidated|nervios[oa]|ansios[oa])\b|紧张|害怕/i },
  { label: 'excited', pattern: /\b(excited|pumped|eager|emocionad[oa]|entusiasm[oa])\b|兴奋|激动/i },
  { label: 'stressed', pattern: /\b(stressed|overwhelmed|pressure|estresad[oa]|agobiad[oa])\b|压力|不堪/i },
];

const VALUE_HINTS: { label: string; pattern: RegExp }[] = [
  { label: 'solving real problems', pattern: /\b(needed|real problem|actually help|for my church|for my family|problema real|ayudar de verdad)\b|真正的问题|帮到/i },
  { label: 'doing the work yourself', pattern: /\b(i built|i made|i tested|i figured|lo hice|lo construí|lo construi|lo probé|lo probe)\b|我做了|我自己/i },
  { label: 'showing up for people', pattern: /\b(customers|neighbors|team|family|church|clientes|vecinos|familia|equipo)\b|客户|家人|团队|邻居/i },
  { label: 'getting things right', pattern: /\b(until it worked|figured it out|refused to stop|hasta que funcionó|hasta que funciono)\b|直到做好|弄明白/i },
];

const BEHAVIORS: { label: string; pattern: RegExp }[] = [
  { label: 'taking the lead in groups', pattern: /\b(take the lead|take charge|in charge|lead the group|when working in groups|tomar la iniciativa|me puse al frente)\b|带头|负责带/i },
  { label: 'working in groups', pattern: /\b(in groups|group work|on a team|with a team|teamwork|en grupo|en equipo|trabajo en equipo)\b|小组|团队合作|一起做/i },
  { label: 'teaching yourself', pattern: /\b(taught myself|self-taught|on my own|learning programming|started learning|aprendí solo|aprendi solo|por mi cuenta)\b|自学|自己学/i },
  { label: 'staying until it is right', pattern: /\b(refused to stop|until i figured|over and over|again and again|una y otra vez|hasta que quedó|hasta que quedo)\b|一遍又一遍|直到做对/i },
  { label: 'helping when it is busy', pattern: /\b(when (the store is |it('s| is) )?busy|slammed|helping customers|cuando hay prisa|ayudar a los clientes)\b|忙的时候|顾客很多/i },
];

const JOB_KINDS: { label: string; pattern: RegExp }[] = [
  { label: 'software engineering', pattern: /\b(software|programming|programmer|coding|developer|engineer|programación|programacion|programador|ingenier[íi]a)\b|软件|编程|工程师/i },
  { label: 'grocery or retail', pattern: /\b(grocery|retail|cashier|store|sales associate|tienda|cajero|comercio)\b|超市|零售|收银/i },
  { label: 'food service', pattern: /\b(cafe|café|restaurant|barista|kitchen|food|restaurante|cocina)\b|餐饮|餐厅|厨房/i },
  { label: 'warehouse work', pattern: /\b(warehouse|stock|shipping|logistics|almacén|almacen)\b|仓储|仓库/i },
  { label: 'childcare', pattern: /\b(childcare|daycare|babysit|kids|niños|ninos|cuidado infantil)\b|托幼|带孩子/i },
  { label: 'healthcare', pattern: /\b(nurse|cna|hospital|caregiver|medical|enfermer|salud)\b|护士|医院|护理/i },
  { label: 'office or admin work', pattern: /\b(office|admin|receptionist|clerical|oficina|administración|administracion)\b|行政|办公室/i },
];

const HOBBY_KINDS: { label: string; pattern: RegExp }[] = [
  { label: 'building games', pattern: /\b(games?|gaming|unity|roblox|minecraft|juegos|videojuegos)\b|游戏/i },
  { label: 'making things', pattern: /\b(build|building|make|making|diy|craft|hacer|construir)\b|动手|制作/i },
  { label: 'music', pattern: /\b(music|guitar|piano|singing|band|música|musica)\b|音乐|吉他/i },
  { label: 'sports', pattern: /\b(soccer|basketball|football|gym|running|sports|fútbol|futbol|deporte)\b|运动|足球/i },
  { label: 'art', pattern: /\b(draw|drawing|art|paint|design|dibujar|arte)\b|画画|设计/i },
  { label: 'cooking', pattern: /\b(cook|cooking|bake|baking|cocinar)\b|做饭|烹饪|烘焙/i },
  { label: 'reading', pattern: /\b(read|reading|books|leer|lectura)\b|读书|阅读/i },
  { label: 'being outdoors', pattern: /\b(hike|hiking|outdoors|fishing|garden|aire libre)\b|户外|爬山/i },
];

function labelFrom(text: string, bank: { label: string; pattern: RegExp }[], fallbackMax = 8) {
  const hit = bank.find((item) => item.pattern.test(text));
  if (hit) return hit.label;
  const stripped = text
    .replace(
      /^(i('m| am) looking for|i want|maybe|i like to|i enjoy|for fun i|in my free time i|estoy buscando|quiero|me gusta|busco|me gustaría|me gustaria)\s+/i,
      '',
    )
    .replace(/^(我在找|我想做|我想|我喜欢|我平时喜欢)/, '');
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

function measure(text: string) {
  const cjk = text.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const latin = text.split(/\s+/).filter((word) => /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(word)).length;
  if (cjk >= 2 && cjk >= latin) return Math.max(1, Math.round(cjk / 1.6) + latin);
  return Math.max(latin, wordCount(text));
}

function clip(text: string, maxWords = 12) {
  const cleaned = clean(text);
  const cjk = cleaned.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  if (cjk >= 2 && !cleaned.includes(' ')) {
    const max = Math.max(4, Math.round(maxWords * 1.6));
    return cleaned.length <= max ? cleaned : cleaned.slice(0, max);
  }
  const parts = cleaned.split(/\s+/);
  return parts.length <= maxWords ? parts.join(' ') : parts.slice(0, maxWords).join(' ');
}

function sentencesOf(text: string) {
  return clean(text)
    .split(/(?<=[.!?。！？])\s*/)
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

function mentionsSelf(text: string) {
  const withoutGroup = text.replace(/我们/g, '');
  return (
    /\b(i|i'm|i've|i'd|yo|soy|estoy|tengo|hice|hago|quería|queria)\b/i.test(text) ||
    /我/.test(withoutGroup)
  );
}

function mentionsGroup(text: string) {
  return /\b(we|nosotros|nosotras)\b/i.test(text) || /我们/.test(text);
}

function statedTraits(text: string): Signal[] {
  const intro =
    text.match(/describe myself as ([^.!?]+)/i)?.[1] ??
    text.match(/\b(?:i am|i'm|i'd say i(?:'m| am)|i tend to)\s+([^.!?]+)/i)?.[1] ??
    text.match(/\b(?:soy|me considero|me describo como|diría que soy|diria que soy|tiendo a ser)\s+([^.!?¿¡]+)/i)?.[1] ??
    text.match(/(?:我觉得自己|我认为自己|我这个人|我比较|我挺|我很|我是一个?)([^。！？\n]{1,20})/)?.[1];
  if (!intro) return [];
  return uniqueSignals(
    TRAIT_WORDS.filter((trait) => trait.pattern.test(intro)).map((trait) => ({
      label: trait.label,
      evidence: clip(intro, 14),
    })),
  );
}

function impliedTraits(text: string): Signal[] {
  const found: Signal[] = [];
  if (
    /(?:\b(refused to stop|wouldn't stop|kept (getting|trying|going)|until i figured|didn't give up|no me rendí|no me rendi|seguí intentando|segui intentando|no paré|no pare)\b|坚持|不放弃|一直试)/i.test(
      text,
    )
  ) {
    found.push({
      label: 'persistent',
      evidence: sentenceWith(text, /refused|figured|kept getting|give up|rendí|rendi|intentando|paré|pare|坚持|不放弃/i),
    });
  }
  if (/\b(practiced|over and over|again and again|until (i|it) (got it|worked|succeeded)|practiqué|practique|una y otra vez)\b|一遍又一遍/i.test(text)) {
    found.push({ label: 'competitive', evidence: sentenceWith(text, /practiced|over and over|again|practiqu|una y otra|一遍/i) });
  }
  if (/\b(on time|showed up|didn't miss|a tiempo|llegué|llegue)\b|守时|准时/i.test(text)) {
    found.push({ label: 'reliable', evidence: sentenceWith(text, /on time|showed up|a tiempo|llegu|守时|准时/i) });
  }
  if (/\b(helping customers|helped my|took care of|ayudé|ayude|cuidé|cuide)\b|帮忙|照顾/i.test(text)) {
    found.push({ label: 'helpful', evidence: sentenceWith(text, /help|take care|ayud|cuid|帮忙|照顾/i) });
  }
  if (/\b(take the lead|take charge|in charge|tomar la iniciativa)\b|带头/i.test(text)) {
    found.push({ label: 'comfortable leading', evidence: sentenceWith(text, /lead|charge|iniciativa|带头/i) });
  }
  return uniqueSignals(found);
}

function motivesIn(text: string): Signal[] {
  const because =
    text.match(/\bbecause ([^.!?]+)/i)?.[1] ??
    text.match(/\bporque ([^.!?¿¡]+)/i)?.[1] ??
    text.match(/因为([^。！？]+)/)?.[1];
  const wanted =
    text.match(/\bi wanted to ([^.!?]+)/i)?.[1] ??
    text.match(/\b(?:quería|queria|quise) ([^.!?¿¡]+)/i)?.[1] ??
    text.match(/我想([^。！？]{1,24})/)?.[1];
  const found: Signal[] = [];
  if (because) found.push({ label: clip(because, 12), evidence: clip(because, 16) });
  if (wanted) found.push({ label: clip(wanted, 10), evidence: clip(wanted, 16) });
  return found;
}

function readAnswer(text: string): Reading {
  const raw = clean(text);
  const count = measure(raw);
  const stated = uniqueSignals(statedTraits(raw));
  const implied = uniqueSignals(impliedTraits(raw)).filter(
    (item) => !stated.some((trait) => trait.label === item.label),
  );
  return {
    raw,
    wordCount: count,
    isShort: (count < 8 && stated.length === 0 && implied.length === 0) || count <= 3,
    isVague: VAGUE.test(raw) && count < 20 && stated.length === 0,
    hasStory: count >= 18 || STORY.test(raw),
    hasMethod: METHOD.test(raw),
    hasOutcome: OUTCOME.test(raw),
    usesWe: mentionsGroup(raw),
    usesI: mentionsSelf(raw),
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
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2 && !QUESTION_STOP.has(token)),
  );
}

function questionOnly(text: string) {
  const mark = Math.max(text.lastIndexOf('?'), text.lastIndexOf('？'));
  if (mark < 0) return text;
  const start = Math.max(text.lastIndexOf('.', mark - 1), text.lastIndexOf('。', mark - 1));
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

function fields(input: Record<string, string | undefined>): Record<string, string> | undefined {
  const entries = Object.entries(input).filter((entry): entry is [string, string] => Boolean(entry[1]));
  return entries.length ? Object.fromEntries(entries) : undefined;
}

function heard(text: string, max = 12) {
  const stripped = text
    .replace(/^(yeah|yes|ok|okay|i guess|sí|si|bueno|vale|pues|嗯+|啊|那个|就是)[，,。.!?]?\s*/i, '')
    .replace(/[.?!。！？]+$/g, '');
  return clip(stripped, max);
}

function promptOf(candidate: Candidate): InterviewPrompt {
  return {
    reactionKey: candidate.reactionKey,
    reactionVars: candidate.reactionVars,
    questionKey: candidate.questionKey,
    questionVars: candidate.questionVars,
  };
}

function alreadyAsked(turns: InterviewTurn[], candidate: Candidate, lang: InterviewLang) {
  const spoken = renderPrompt(lang, promptOf(candidate));
  const question = generatedLine(lang, candidate.questionKey, candidate.questionVars);
  return interviewerTurns(turns)
    .filter((turn) => turn.themeId !== 'opening' && turn.themeId !== 'opener-fun')
    .some((turn) => tooSimilar(turn.text, spoken) || tooSimilar(turn.text, question));
}

function askedIds(turns: InterviewTurn[]) {
  return new Set(interviewerTurns(turns).map((turn) => turn.themeId).filter(Boolean) as string[]);
}

function candidatesFor(last: Reading, portrait: Portrait, answerIndex: number): Candidate[] {
  const out: Candidate[] = [];
  const push = (
    id: string,
    reactionKey: PhraseKey,
    questionKey: PhraseKey,
    reactionVars?: Record<string, string | undefined>,
    questionVars?: Record<string, string | undefined>,
  ) => {
    out.push({
      id,
      reactionKey,
      questionKey,
      reactionVars: reactionVars ? fields(reactionVars) : undefined,
      questionVars: questionVars ? fields(questionVars) : undefined,
    });
  };

  const trait = last.statedTraits[0] ?? last.impliedTraits[0];
  const emotion = last.emotions[0];
  const motive = last.motives[0];
  const behavior = last.behaviors[0];
  const snippet = heard(last.sentences[0] ?? last.raw, 18);
  const job = portrait.jobInterest;
  const hobby = portrait.hobby;

  if (job && hobby && answerIndex >= 1) {
    push('job-hobby-link', 'link.reaction', 'link.question', { hobbyLead: hobby, hobby, job }, { hobby, job });
    push('hobby-into-job', 'hobbyJob.reaction', 'hobbyJob.question', { hobby, job }, { hobby });
    push('job-fit', 'jobFit.reaction', 'jobFit.question', { job });
    push('hobby-story', 'hobbyStory.reaction', 'hobbyStory.question', { hobby }, { hobby });
  }

  if (last.usesWe && !last.usesI) {
    push('need-i', 'needI.reaction', 'needI.question');
  }

  if (last.isShort && last.wordCount <= 3 && !(last.usesWe && !last.usesI)) {
    push('expand-tiny', 'tiny.reaction', 'tiny.question', { raw: last.raw.replace(/[.?!。！？]+$/g, '') });
  } else if (last.isShort) {
    push('expand-short', 'short.reaction', 'short.question', { snippet });
  }

  if (last.isVague) {
    push('clarify-vague', 'vague.reaction', 'vague.question', { snippet: heard(last.raw, 8) });
  }

  if (behavior?.label === 'taking the lead in groups') {
    push('lead-comfort', 'leadComfort.reaction', 'leadComfort.question');
    push('lead-conflict', 'leadConflict.reaction', 'leadConflict.question');
  }

  if (behavior?.label === 'working in groups') {
    push('group-role', 'groupRole.reaction', 'groupRole.question');
  }

  if (last.statedTraits.length && emotion) {
    push(
      `trait-emotion:${trait?.label}:${emotion.label}`,
      'traitEmotion.reaction',
      'traitEmotion.question',
      { trait: last.statedTraits[0].label, emotion: emotion.label },
      { trait: last.statedTraits[0].label },
    );
  }

  if (last.statedTraits.length > 1) {
    push(
      `two-traits:${last.statedTraits.map((item) => item.label).join('+')}`,
      'twoTraits.reaction',
      'twoTraits.question',
      { traitList: last.statedTraits.slice(0, 2).map((item) => item.label).join('|') },
      { a: last.statedTraits[0].label, b: last.statedTraits[1].label },
    );
  } else if (last.statedTraits.length === 1 && last.hasStory) {
    push(
      `trait-story:${last.statedTraits[0].label}`,
      'traitStory.reaction',
      'traitStory.question',
      { trait: last.statedTraits[0].label, snippet: heard(last.sentences[last.sentences.length - 1] ?? last.raw, 10) },
    );
  } else if (last.statedTraits.length === 1) {
    push(
      `trait-example:${last.statedTraits[0].label}`,
      'traitExample.reaction',
      'traitExample.question',
      { trait: last.statedTraits[0].label },
    );
  }

  if (last.impliedTraits.length && !last.statedTraits.length) {
    push(
      `implied:${last.impliedTraits[0].label}`,
      'implied.reaction',
      'implied.question',
      { trait: last.impliedTraits[0].label, evidence: heard(last.impliedTraits[0].evidence, 16) },
    );
  }

  if (emotion && !last.statedTraits.length) {
    push(`emotion:${emotion.label}`, 'emotion.reaction', 'emotion.question', { emotion: emotion.label });
  }

  if (motive) {
    push(`motive:${motive.label}`, 'motive.reaction', 'motive.question', { motive: motive.label });
    push(`motive-cost:${motive.label}`, 'motiveCost.reaction', 'motiveCost.question', { motive: motive.label });
  }

  if (last.hasMethod) {
    push('method-next', 'methodNext.reaction', 'methodNext.question', {
      method: heard(sentenceWith(last.raw, METHOD), 16),
    });
    push('method-again', 'methodAgain.reaction', 'methodAgain.question');
  }

  if (behavior?.label === 'helping when it is busy') {
    push('busy-priority', 'busy.reaction', 'busy.question');
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
      'connect.reaction',
      'connect.question',
      { trait: earlier.label },
      { trait: earlier.label },
    );
  }

  const unusedTrait = portrait.traits.find(
    (item) => !last.statedTraits.some((signal) => signal.label === item.label) && answerIndex >= 1,
  );
  if (unusedTrait) {
    push(
      `bridge:${unusedTrait.label}:${clip(last.raw, 6)}`,
      'bridge.reaction',
      'bridge.question',
      { trait: unusedTrait.label, snippet: heard(last.raw, 10) },
    );
  }

  if (last.hasStory && !last.hasOutcome) {
    push('need-result', 'needResult.reaction', 'needResult.question');
  }

  if (answerIndex >= 4) {
    if (portrait.jobInterest || portrait.hobby) {
      push('wrap-up', 'wrap.picture', 'wrap.question', {
        job: portrait.jobInterest,
        hobby: portrait.hobby,
        trait: portrait.traits[0]?.label,
      });
    } else if (portrait.traits[0]) {
      push('wrap-up', 'wrap.someone', 'wrap.question', {
        traitList: portrait.traits
          .slice(0, 2)
          .map((item) => item.label)
          .join('|'),
      });
    } else {
      push('wrap-up', 'wrap.sides', 'wrap.question');
    }
  }

  if (out.length === 0) {
    push(`open:${clip(last.raw, 5)}`, 'open.reaction', 'open.question', { snippet });
  }

  return out;
}

export function nextInterviewerLine(
  turns: InterviewTurn[],
  language: InterviewLang = 'en',
): { kind: 'question' | 'complete'; text: string; themeId?: string; prompt?: InterviewPrompt } {
  const lang = interviewGenerationRequest(language).language;
  const answers = candidateTurns(turns);
  if (answers.length >= 6) {
    return { kind: 'complete', text: buildInterviewReview(turns, lang) };
  }

  const last = readAnswer(answers[answers.length - 1]?.text.trim() ?? '');
  const portrait = portraitOf(turns);

  if (answers.length === 1) {
    const knownJob = portrait.jobInterest;
    const prompt: InterviewPrompt =
      last.isShort && !knownJob
        ? { reactionKey: 'backToJob', questionKey: 'fun' }
        : {
            reactionKey: 'lookingAt',
            reactionVars: { job: knownJob || heard(last.raw, 8) || 'that' },
            questionKey: 'fun',
          };
    return { kind: 'question', themeId: 'opener-fun', text: renderPrompt(lang, prompt), prompt };
  }

  const used = askedIds(turns);
  const options = candidatesFor(last, portrait, answers.length - 1).filter(
    (candidate) => !used.has(candidate.id) && !alreadyAsked(turns, candidate, lang),
  );

  const pick: Candidate = options[0] ?? {
    id: `fresh:${answers.length}`,
    reactionKey: portrait.hobby ? 'fresh.keep' : 'fresh.noRepeat',
    reactionVars: portrait.hobby
      ? { hobby: portrait.hobby, job: portrait.jobInterest || 'the job you named' }
      : undefined,
    questionKey: portrait.jobInterest ? 'fresh.job' : 'fresh.work',
    questionVars: portrait.jobInterest ? { job: portrait.jobInterest } : undefined,
  };

  const prompt = promptOf(pick);
  return { kind: 'question', themeId: pick.id, text: renderPrompt(lang, prompt), prompt };
}

function quote(text: string, lang: InterviewLang) {
  const clipped = clip(text, 24).replace(/[.?!。！？…]+$/g, '');
  const cjk = text.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const long = cjk >= 2 ? cjk > 48 : wordCount(text) > 24;
  const body = `${clipped}${long ? (lang === 'zh-CN' ? '…' : '...') : ''}`;
  if (lang === 'zh-CN') return `「${body}」`;
  if (lang === 'es') return `«${body}»`;
  return `"${body}"`;
}

function communicationNotes(readings: Reading[], lang: InterviewLang) {
  const notes: string[] = [];
  const avg = readings.reduce((sum, reading) => sum + reading.wordCount, 0) / Math.max(readings.length, 1);
  if (avg < 12) notes.push(generatedLine(lang, 'comm.short'));
  else if (avg > 70) notes.push(generatedLine(lang, 'comm.long'));
  else notes.push(generatedLine(lang, 'comm.ok'));

  if (readings.some((reading) => reading.isVague)) notes.push(generatedLine(lang, 'comm.specific'));

  if (readings.filter((reading) => reading.hasStory).length < Math.ceil(readings.length / 2)) {
    notes.push(generatedLine(lang, 'comm.organizeWeak'));
  } else {
    notes.push(generatedLine(lang, 'comm.organizeOk'));
  }

  if (readings.some((reading) => reading.fillerHeavy)) notes.push(generatedLine(lang, 'comm.filler'));
  if (readings.some((reading) => reading.usesWe && !reading.usesI)) notes.push(generatedLine(lang, 'comm.ownership'));
  return notes;
}

function growthItem(
  lang: InterviewLang,
  titleKey: PhraseKey,
  whatKey: PhraseKey,
  whyKey: PhraseKey,
  howKey: PhraseKey,
  vars?: Record<string, string>,
  evidence?: string,
) {
  return [
    `**${generatedLine(lang, titleKey)}**`,
    generatedLine(lang, 'label.what', { text: generatedLine(lang, whatKey, vars) }),
    generatedLine(lang, 'label.why', { text: generatedLine(lang, whyKey, vars) }),
    generatedLine(lang, 'label.how', { text: generatedLine(lang, howKey, vars) }),
    evidence ? generatedLine(lang, 'label.from', { text: evidence }) : null,
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildInterviewReview(turns: InterviewTurn[], language: InterviewLang = 'en'): string {
  const lang = interviewGenerationRequest(language).language;
  const portrait = portraitOf(turns);
  const readings = portrait.readings;
  const pairs = pairedAnswers(turns);

  if (readings.length === 0) {
    return [
      generatedLine(lang, 'header.overview'),
      generatedLine(lang, 'empty.body'),
      '',
      generatedLine(lang, 'header.takeaways'),
      `• ${generatedLine(lang, 'empty.takeaway')}`,
    ].join('\n');
  }

  const traitList = portrait.traits.map((item) => item.label);
  const extra = [
    portrait.hobby ? generatedLine(lang, 'overview.hobby', { hobby: portrait.hobby }) : '',
    traitList.length
      ? generatedLine(lang, 'overview.traits', { traitList: traitList.slice(0, 3).join('|') })
      : '',
  ].join('');
  const overview =
    readings.length === 1
      ? generatedLine(lang, 'overview.one', { quote: quote(readings[0].raw, lang) })
      : generatedLine(lang, 'overview.many', {
          count: String(readings.length),
          interest: portrait.jobInterest || 'work',
          extra,
        });

  const presented = [
    traitList.length
      ? generatedLine(lang, 'presented.traits', { traitList: traitList.join('|') })
      : generatedLine(lang, 'presented.activities'),
    portrait.behaviors[0]
      ? generatedLine(lang, 'presented.behavior', {
          behaviorList: portrait.behaviors.map((item) => item.label).join('|'),
        })
      : null,
    portrait.motives[0] ? generatedLine(lang, 'presented.motive', { motive: portrait.motives[0].label }) : null,
    portrait.emotions[0]
      ? generatedLine(lang, 'presented.emotion', {
          emotionList: portrait.emotions.map((item) => item.label).join('|'),
        })
      : null,
    portrait.values[0]
      ? generatedLine(lang, 'presented.values', {
          valueList: portrait.values.map((item) => item.label).join('|'),
        })
      : null,
  ]
    .filter(Boolean)
    .join(' ');

  const strengths: string[] = [];
  const traitStory = readings.find((reading) => reading.statedTraits.length && reading.hasStory);
  if (traitStory) {
    strengths.push(
      generatedLine(lang, 'strength.traitStory', {
        traitList: traitStory.statedTraits.map((item) => item.label).join('|'),
        quote: quote(traitStory.raw, lang),
      }),
    );
  }
  const implied = readings.find((reading) => reading.impliedTraits.length);
  if (implied) {
    strengths.push(
      generatedLine(lang, 'strength.implied', {
        trait: implied.impliedTraits[0].label,
        quote: quote(implied.impliedTraits[0].evidence, lang),
      }),
    );
  }
  const method = readings.find((reading) => reading.hasMethod);
  if (method) {
    strengths.push(generatedLine(lang, 'strength.method', { quote: quote(method.raw, lang) }));
  }
  const motive = readings.find((reading) => reading.motives.length);
  if (motive) {
    strengths.push(generatedLine(lang, 'strength.motive', { quote: quote(motive.motives[0].evidence, lang) }));
  }
  if (strengths.length === 0) {
    strengths.push(generatedLine(lang, 'strength.fallback', { quote: quote(readings[0].raw, lang) }));
  }

  const growth: string[] = [];
  if (readings.some((reading) => reading.statedTraits.length) && !readings.some((reading) => reading.hasStory || reading.hasMethod)) {
    const trait = readings.find((reading) => reading.statedTraits.length)?.statedTraits[0];
    growth.push(
      growthItem(
        lang,
        'growth.specific.title',
        'growth.specific.what',
        'growth.specific.why',
        'growth.specific.how',
        trait ? { trait: trait.label } : undefined,
        trait ? quote(trait.evidence, lang) : undefined,
      ),
    );
  }
  if (readings.some((reading) => reading.usesWe && !reading.usesI)) {
    const sample = readings.find((reading) => reading.usesWe && !reading.usesI);
    growth.push(
      growthItem(
        lang,
        'growth.role.title',
        'growth.role.what',
        'growth.role.why',
        'growth.role.how',
        undefined,
        sample ? quote(sample.raw, lang) : undefined,
      ),
    );
  }
  if (readings.some((reading) => reading.isShort || reading.isVague)) {
    const sample = readings.find((reading) => reading.isShort || reading.isVague);
    growth.push(
      growthItem(
        lang,
        'growth.thin.title',
        'growth.thin.what',
        'growth.thin.why',
        'growth.thin.how',
        undefined,
        sample ? quote(sample.raw, lang) : undefined,
      ),
    );
  }
  if (traitList.length && !readings.some((reading) => reading.hasOutcome)) {
    growth.push(
      growthItem(lang, 'growth.results.title', 'growth.results.what', 'growth.results.why', 'growth.results.how', {
        trait: traitList[0],
      }),
    );
  }
  if (readings.some((reading) => reading.hasStory && !reading.hasMethod && !reading.statedTraits.length)) {
    const sample = readings.find((reading) => reading.hasStory && !reading.hasMethod && !reading.statedTraits.length);
    growth.push(
      growthItem(
        lang,
        'growth.action.title',
        'growth.action.what',
        'growth.action.why',
        'growth.action.how',
        undefined,
        sample ? quote(sample.raw, lang) : undefined,
      ),
    );
  }
  if (growth.length === 0) {
    growth.push(growthItem(lang, 'growth.tie.title', 'growth.tie.what', 'growth.tie.why', 'growth.tie.how'));
  }

  const comm = communicationNotes(readings, lang);
  const perQuestion = pairs
    .map((pairItem, index) => {
      const reading = readAnswer(pairItem.answer);
      const worked = reading.statedTraits.length
        ? generatedLine(lang, 'worked.traits', {
            traitList: reading.statedTraits.map((item) => item.label).join('|'),
          })
        : reading.behaviors.length
          ? generatedLine(lang, 'worked.behavior', { behavior: reading.behaviors[0].label })
          : reading.hasStory
            ? generatedLine(lang, 'worked.story')
            : generatedLine(lang, 'worked.words');
      const improve =
        reading.isShort
          ? generatedLine(lang, 'improve.brief')
          : reading.isVague
            ? generatedLine(lang, 'improve.vague')
            : !reading.usesI && reading.usesWe
              ? generatedLine(lang, 'improve.role')
              : !reading.hasOutcome && reading.hasStory
                ? generatedLine(lang, 'improve.result')
                : generatedLine(lang, 'improve.work');
      const suggestion = reading.isShort ? generatedLine(lang, 'suggest.short') : generatedLine(lang, 'suggest.keep');
      return [
        `${index + 1}. ${clip(questionOnly(pairItem.question), 20)}`,
        `   ${generatedLine(lang, 'per.youSaid', { quote: quote(pairItem.answer, lang) })}`,
        `   ${generatedLine(lang, 'per.worked', { text: worked })}`,
        `   ${generatedLine(lang, 'per.stronger', { text: improve })}`,
        `   ${generatedLine(lang, 'per.try', { text: suggestion })}`,
      ].join('\n');
    })
    .join('\n\n');

  const takeaways = [
    traitList[0]
      ? generatedLine(lang, 'take.lead', { trait: traitList[0] })
      : generatedLine(lang, 'take.pick'),
    generatedLine(lang, 'take.group'),
    generatedLine(lang, 'take.result'),
  ];

  return [
    generatedLine(lang, 'header.overview'),
    overview,
    '',
    generatedLine(lang, 'header.presented'),
    presented,
    '',
    generatedLine(lang, 'header.strengths'),
    strengths.map((item, index) => `${index + 1}. ${item}`).join('\n'),
    '',
    generatedLine(lang, 'header.growth'),
    growth.map((item, index) => `${index + 1}. ${item}`).join('\n\n'),
    '',
    generatedLine(lang, 'header.communication'),
    comm.map((item) => `• ${item}`).join('\n'),
    '',
    generatedLine(lang, 'header.perQuestion'),
    perQuestion || generatedLine(lang, 'per.empty'),
    '',
    generatedLine(lang, 'header.takeaways'),
    takeaways.map((item) => `• ${item}`).join('\n'),
  ].join('\n');
}
