import type { ExperienceEntry, ExperienceKind, ResumeSession } from './resume-types';
import type { EducationItem, ResumeDocument, RoleItem } from './resume-types';

const SKIP = /^(skip|none|n\/a|na|nope|pass|nothing|no thanks|dont have one|don't have one|not really|no)$/i;

export function isSkip(text: string): boolean {
  return SKIP.test(text.trim().replace(/[.!]+$/, ''));
}

function stripPerson(text: string): string {
  return text
    .replace(/\bI['’]m\b/gi, '')
    .replace(/\bI['’]ve\b/gi, '')
    .replace(/\bI['’]d\b/gi, '')
    .replace(/\bI'm\b/gi, '')
    .replace(/\bme\b/gi, '')
    .replace(/\bmine\b/gi, '')
    .replace(/\bI\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function noFirstPerson(text: string): string {
  return text
    .replace(/\bI\b/g, '')
    .replace(/\bme\b/gi, '')
    .replace(/\bmy\b/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/^[, ]+/, '')
    .trim();
}

function sentenceCase(text: string): string {
  const t = text.trim().replace(/^[a-z]/, (c) => c.toUpperCase());
  return /[.?!]$/.test(t) ? t : `${t}.`;
}

function asBullet(text: string): string {
  let t = noFirstPerson(text).replace(/^[. ,]+/, '').replace(/[.]+$/, '');
  t = t.replace(/^(also|and then|and|then)\s+/i, '');
  return sentenceCase(t).replace(/\.$/, '');
}

type Pattern = {
  test: RegExp;
  shortOnly?: boolean;
  bullets: (raw: string) => string[];
  skills?: string[];
  title?: string;
  organization?: string;
};

const PATTERNS: Pattern[] = [
  {
    test: /\b(watch(ed|ing)?|babysit(?:ting)?|look(?:ed|ing)? after|take care of|took care of).{0,50}(siblings?|brothers?|sisters?|kids?|children)\b/i,
    shortOnly: true,
    title: 'Childcare',
    organization: 'Family',
    skills: ['Childcare', 'Responsibility', 'Time management'],
    bullets: () => [
      'Provided consistent childcare for younger siblings, managing daily routines, meals, activities, and safety',
    ],
  },
  {
    test: /\b(help(?:ed|ing)?|work(?:ed|ing)?).{0,40}(mom|dad|parent|family).{0,40}(business|store|shop|company)\b/i,
    shortOnly: true,
    title: 'Operations Support',
    organization: 'Family business',
    skills: ['Organization', 'Customer service', 'Administrative support'],
    bullets: () => [
      'Supported day-to-day operations of a family business, assisting with organization, customer interactions, and administrative tasks',
    ],
  },
  {
    test: /\b(help(?:ed|ing)?|tutor(?:ed|ing)?).{0,40}(younger )?(students?|kids?|classmates?).{0,40}(math|reading|homework|english|science)\b/i,
    title: 'Peer Tutor',
    skills: ['Tutoring', 'Communication', 'Patience'],
    bullets: (raw) => {
      const subject = raw.match(/\b(math|reading|homework|english|science)\b/i)?.[1] ?? 'schoolwork';
      const subj = subject.toLowerCase() === 'homework' ? 'schoolwork' : subject.toLowerCase();
      return [
        `Provided ${subj} support to younger students, explaining concepts and helping students strengthen problem-solving skills`,
      ];
    },
  },
  {
    test: /\b(mow(?:ed|ing)?|yard|lawn)\b/i,
    shortOnly: true,
    title: 'Yard Work',
    skills: ['Reliability', 'Physical work'],
    bullets: () => ['Maintained residential lawns and outdoor spaces, including mowing and general yard upkeep'],
  },
  {
    test: /\b(cash(?:ier|ing)|register|checkout)\b/i,
    title: 'Cashier',
    skills: ['Customer service', 'Cash handling', 'Communication'],
    bullets: () => ['Assisted customers at checkout, handled transactions, and maintained a clean, organized register area'],
  },
  {
    test: /\b(bag(?:ged|ging) groceries|stock(?:ed|ing)|shelves)\b/i,
    skills: ['Teamwork', 'Organization'],
    bullets: (raw) => {
      const bits: string[] = [];
      if (/bag/i.test(raw)) bits.push('Bagged groceries and assisted customers with purchases');
      if (/stock|shelf/i.test(raw)) bits.push('Stocked shelves and kept product displays organized');
      return bits.length ? bits : ['Supported store operations, including stocking and assisting customers'];
    },
  },
  {
    test: /\b(walk(?:ed|ing)? (the )?dogs?|pet sitt?ing|dogs?)\b/i,
    shortOnly: true,
    title: 'Pet Care',
    skills: ['Reliability', 'Animal care'],
    bullets: () => ['Provided pet care, including walking dogs and looking after animals on an agreed schedule'],
  },
  {
    test: /\b(volunteer).{0,40}(church|food|shelter|library|hospital|school)\b/i,
    title: 'Volunteer',
    skills: ['Service', 'Teamwork'],
    bullets: (raw) => {
      const place = raw.match(/\b(church|food bank|shelter|library|hospital|school)\b/i)?.[1];
      return [
        `Supported volunteer operations${place ? ` at a ${place.toLowerCase()}` : ''}, assisting with tasks as assigned and helping the team serve the community`,
      ];
    },
  },
];

const VERB_START: [RegExp, string][] = [
  [/^help(?:ed|ing)?(?:\s+out)?\s+(with\s+)?/i, 'Assisted with '],
  [/^watch(?:ed|ing)?\s+/i, 'Provided care for '],
  [/^look(?:ed|ing)? after\s+/i, 'Looked after '],
  [/^took care of\s+/i, 'Took care of '],
  [/^take care of\s+/i, 'Took care of '],
  [/^organiz(?:e|ed|ing)\s+/i, 'Organized '],
  [/^manag(?:e|ed|ing)\s+/i, 'Managed '],
  [/^assist(?:ed|ing)?\s+(with\s+)?/i, 'Assisted with '],
  [/^coordinat(?:e|ed|ing)\s+/i, 'Coordinated '],
  [/^creat(?:e|ed|ing)\s+/i, 'Created '],
  [/^develop(?:ed|ing)?\s+/i, 'Developed '],
  [/^led\s+/i, 'Led '],
  [/^lead(?:ing)?\s+/i, 'Led '],
  [/^support(?:ed|ing)?\s+/i, 'Supported '],
  [/^communicat(?:e|ed|ing)\s+/i, 'Communicated '],
  [/^tutor(?:ed|ing)?\s+/i, 'Tutored '],
  [/^maintain(?:ed|ing)?\s+/i, 'Maintained '],
  [/^design(?:ed|ing)?\s+/i, 'Designed '],
  [/^teach(?:ing)?\s+/i, 'Taught '],
  [/^taught\s+/i, 'Taught '],
  [/^build(?:ing)?\s+/i, 'Built '],
  [/^built\s+/i, 'Built '],
  [/^improv(?:e|ed|ing)\s+/i, 'Improved '],
  [/^work(?:ed|ing)?\s+(on|at|with)\s+/i, 'Worked $1 '],
  [/^clean(?:ed|ing)?\s+/i, 'Cleaned '],
  [/^cook(?:ed|ing)?\s+/i, 'Prepared '],
  [/^made\s+/i, 'Created '],
  [/^talk(?:ed|ing)?\s+to\s+/i, 'Communicated with '],
  [/^ran\s+/i, 'Ran '],
  [/^run(?:ning)?\s+/i, 'Ran '],
  [/^sold\s+/i, 'Sold '],
  [/^sell(?:ing)?\s+/i, 'Sold '],
];

function professionalizeLine(line: string): string {
  let t = stripPerson(line).replace(/^[. ,:-]+/, '');
  if (!t) return '';
  for (const [re, verb] of VERB_START) {
    if (re.test(t)) {
      t = t.replace(re, verb.endsWith(' ') ? verb : `${verb} `);
      break;
    }
  }
  t = t.replace(/\bthe the\b/gi, 'the');
  t = asBullet(t);
  if (!/^[A-Z]/.test(t)) t = t.charAt(0).toUpperCase() + t.slice(1);
  return t;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function isVagueExperience(text: string): boolean {
  const t = stripDatePhrases(text.trim());
  if (wordCount(t) < 5) return true;
  if (/^(i )?(just )?(helped|worked there|did stuff|did things|it was (fun|fine|ok|okay)|idk)\.?$/i.test(t)) {
    return true;
  }
  const hasAction =
    /\b(help|helped|watch|lead|led|organi[sz]|creat|manag|teach|taught|tutor|build|built|improv|assist|volunteer|work|worked|play|clean|cook|care|ran|run|sell|sold|stock|bag|cash|design|write|wrote|plan|babysit)\w*\b/i.test(
      t,
    );
  return !hasAction && wordCount(t) < 14;
}

export function needsFollowup(text: string): boolean {
  const duties = stripDatePhrases(text);
  return isVagueExperience(duties) || wordCount(duties) < 12;
}

function hasSpecificDuties(text: string): boolean {
  return wordCount(text) >= 10 || /[,;]| and /.test(text);
}

export function expandExperience(entry: ExperienceEntry): string[] {
  const joined = stripDatePhrases(entry.raw.join(' ')).trim();
  if (!joined) return [];
  const bullets: string[] = [];
  const seen = new Set<string>();

  const add = (b: string) => {
    const clean = b.replace(/[.]+$/, '').trim();
    const key = clean.toLowerCase();
    if (!clean || seen.has(key)) return;
    seen.add(key);
    bullets.push(clean);
  };

  const pieces = splitDuties(joined);
  const parts = pieces.length ? pieces : [joined];
  for (const piece of parts) {
    if (!hasSpecificDuties(piece)) {
      const pattern = PATTERNS.find((item) => item.test.test(piece));
      if (pattern) {
        pattern.bullets(piece).forEach(add);
        continue;
      }
    }
    const line = professionalizeLine(piece);
    if (line) add(line);
  }

  if (!bullets.length) {
    for (const pattern of PATTERNS) {
      if (pattern.test.test(joined)) pattern.bullets(joined).forEach(add);
    }
  }

  return bullets.slice(0, 5);
}

function splitDuties(text: string): string[] {
  return text
    .split(/(?<=\w)[.!;](?:\s+|$)|(?:\s+\band then\b\s+)|(?:\s+\balso\b\s+)/i)
    .map((p) => p.trim())
    .filter((p) => p.length > 2 && !extractDates(p));
}

function stripDatePhrases(text: string): string {
  const months =
    '(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
  return text
    .replace(
      new RegExp(
        `((?:${months}\\.?\\s*)?(?:20\\d{2}|19\\d{2}))\\s*(?:[-–—]|to)\\s*((?:${months}\\.?\\s*)?(?:present|current|now|20\\d{2}|19\\d{2}))`,
        'gi',
      ),
      ' ',
    )
    .replace(/\b(from\s+)?(20\d{2}|19\d{2})\s*(?:[-–—]|to)\s*(present|20\d{2})\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function inferRole(entry: ExperienceEntry): { title: string; organization?: string } {
  const joined = stripDatePhrases(entry.raw.join(' '));
  for (const pattern of PATTERNS) {
    if (pattern.test.test(joined) && (pattern.title || pattern.organization)) {
      return {
        title: pattern.title ?? fallbackTitle(entry.kind),
        organization: pattern.organization,
      };
    }
  }
  const at = joined.match(
    /\b(?:as an?|as)\s+([^,.]+?)\s+(?:at|for|with)\s+([^,.]+)/i,
  );
  if (at) {
    return { title: titleCase(at[1]), organization: titleCase(at[2]) };
  }
  const at2 = joined.match(/\b(?:at|for|with)\s+([A-Z][\w&.'’-]*(?:\s+[A-Z][\w&.'’-]*)*)/);
  const org = at2?.[1];
  const job = joined.match(
    /\b(cashier|stocker|bagger|server|host|hostess|lifeguard|tutor|counselor|intern|volunteer|captain|president|secretary|treasurer|member)\b/i,
  );
  return {
    title: job ? titleCase(job[1]) : fallbackTitle(entry.kind),
    organization: org ? org.trim() : undefined,
  };
}

function fallbackTitle(kind: ExperienceKind): string {
  switch (kind) {
    case 'work':
      return 'Team Member';
    case 'volunteer':
      return 'Volunteer';
    case 'school':
      return 'School Activity';
    case 'club':
      return 'Club Member';
    case 'leadership':
      return 'Leader';
    case 'project':
      return 'Project';
    default:
      return 'Experience';
  }
}

function titleCase(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

export function parseEducation(raw: string, extra: string): EducationItem | null {
  const text = `${raw} ${extra}`.trim();
  if (!text || isSkip(raw)) return null;
  const grad = text.match(
    /\b(?:class of|graduat(?:e|ing|ion)?|expected)?\s*((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)?\s*20\d{2})\b/i,
  );
  const loc = text.match(/\b(?:in|at)\s+([A-Z][A-Za-z.]+(?:\s+[A-Z][A-Za-z.]+){0,3})(?:\s*,\s*([A-Z]{2}))?/);
  let school = raw
    .replace(/\b(class of|graduat\w*|expected|currently|i (go|went) to)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (loc) school = school.replace(loc[0], '').trim();
  if (grad) school = school.replace(grad[0], '').trim();
  school = school.replace(/\b20\d{2}\b/g, '').replace(/\bexpected\b/gi, '');
  school = school.replace(/[.,;]+/g, (m, i, src) => (i === src.length - 1 ? '' : m)).replace(/\s+/g, ' ').replace(/[.,; ]+$/, '').trim() || raw.trim();
  const details = extra && !isSkip(extra) ? professionalizeLine(extra) : undefined;
  return {
    school,
    location: loc ? [loc[1], loc[2]].filter(Boolean).join(', ') : undefined,
    graduation: grad?.[1] ? `Expected ${titleCase(grad[1])}` : undefined,
    details,
  };
}

export function extractDates(text: string): string | undefined {
  const months =
    '(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
  const range = text.match(
    new RegExp(
      `((?:${months}\\.?\\s*)?(?:20\\d{2}|19\\d{2}))\\s*(?:[-–—]|to)\\s*((?:${months}\\.?\\s*)?(?:present|current|now|20\\d{2}|19\\d{2}))`,
      'i',
    ),
  );
  if (range) return prettyDates(`${range[1]} – ${range[2]}`);
  const years = text.match(/\b(20\d{2}|19\d{2})\b/g);
  if (years?.length === 1 && /\b(present|current(ly)?)\b/i.test(text)) return `${years[0]} – Present`;
  if (years && years.length >= 2) return `${years[0]} – ${years[years.length - 1]}`;
  if (/^\s*(present|current|now)\s*$/i.test(text)) return 'Present';
  const single = text.match(new RegExp(`${months}\\.?\\s*20\\d{2}`, 'i'));
  if (single && text.trim().length < 48) return prettyDates(single[0]);
  return undefined;
}

function prettyDates(text: string): string {
  return text
    .replace(/\bto\b/gi, '–')
    .replace(/\s*[-–—]\s*/g, ' – ')
    .replace(/\b(current(ly)?|now)\b/gi, 'Present')
    .replace(/\s+/g, ' ')
    .trim();
}

export function hasDates(text: string): boolean {
  return Boolean(extractDates(text)) || /\b(20\d{2}|present|last summer|this year|freshman|sophomore|junior|senior)\b/i.test(text);
}

const SKILL_HINTS: [RegExp, string][] = [
  [/\b(childcare|sibling|babysit)/i, 'Childcare'],
  [/\b(customer|cashier|register|checkout)/i, 'Customer service'],
  [/\b(organiz)/i, 'Organization'],
  [/\b(communicat|explain|people)/i, 'Communication'],
  [/\b(lead|captain|president)/i, 'Leadership'],
  [/\b(tutor|teach)/i, 'Tutoring'],
  [/\b(team|club|sport)/i, 'Teamwork'],
  [/\b(computer|code|software|excel)/i, 'Computer skills'],
  [/\b(spanish|bilingual)/i, 'Bilingual'],
  [/\b(clean|maintain)/i, 'Attention to detail'],
  [/\b(time|on time|punctual|reliable)/i, 'Reliability'],
];

export function collectSkills(session: ResumeSession, roles: RoleItem[]): string[] {
  const skills = new Set<string>();
  const blob = `${session.traitsRaw} ${session.experiences.map((e) => e.raw.join(' ')).join(' ')}`;
  for (const [re, skill] of SKILL_HINTS) {
    if (re.test(blob)) skills.add(skill);
  }
  for (const pattern of PATTERNS) {
    if (pattern.skills && session.experiences.some((e) => pattern.test.test(e.raw.join(' ')))) {
      pattern.skills.forEach((s) => skills.add(s));
    }
  }
  const traits = session.traitsRaw
    .split(/[,;/]| and /i)
    .map((t) => t.trim())
    .filter((t) => t.length > 2 && !isSkip(t) && t.split(' ').length <= 3);
  for (const trait of traits) {
    const label = titleCase(noFirstPerson(trait));
    const lower = label.toLowerCase();
    if (![...skills].some((s) => s.toLowerCase().includes(lower) || lower.includes(s.toLowerCase()))) {
      skills.add(label);
    }
  }
  if (!roles.length && !skills.size) return [];
  return [...skills].slice(0, 10);
}

export function buildSummary(session: ResumeSession, roles: RoleItem[]): string | undefined {
  const traits = session.traitsRaw
    .split(/[,;/]| and /i)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t && !isSkip(t) && t.split(' ').length <= 3)
    .slice(0, 3);
  const goal = session.goal && !isSkip(session.goal) ? session.goal.trim().replace(/[.]+$/, '') : '';
  const first = roles[0];
  const who = traits.length ? traits.join(', ') : '';
  if (goal && first) {
    return sentenceCase(
      `Motivated applicant seeking ${noFirstPerson(goal).toLowerCase()}, with experience in ${
        first.title
      }${who ? ` and a reputation for being ${who}` : ''}`,
    ).replace(/^Motivated applicant/, (s) => s);
  }
  if (goal) {
    return sentenceCase(
      `Applicant seeking ${noFirstPerson(goal).toLowerCase()}${who ? `, bringing a ${who} work style` : ''}`,
    );
  }
  if (first) {
    return sentenceCase(
      `Reliable candidate with experience as ${first.title}${
        first.organization ? ` with ${first.organization}` : ''
      }${who ? `, known for being ${who}` : ''}`,
    );
  }
  if (who) {
    return sentenceCase(`Entry-level candidate known for being ${who}, ready to contribute in a first job`);
  }
  return undefined;
}

function toRole(entry: ExperienceEntry): RoleItem {
  const inferred = inferRole(entry);
  return {
    id: entry.id,
    title: inferred.title,
    organization: inferred.organization,
    dates: entry.dates,
    bullets: expandExperience(entry),
  };
}

export function buildResumeDocument(session: ResumeSession): ResumeDocument {
  const name = session.name.trim() || 'Name';
  const education = parseEducation(session.educationRaw, session.educationExtra);
  const work: RoleItem[] = [];
  const volunteer: RoleItem[] = [];
  const leadership: RoleItem[] = [];
  const projects: RoleItem[] = [];
  const other: RoleItem[] = [];

  for (const entry of session.experiences) {
    const role = toRole(entry);
    if (!role.bullets.length) continue;
    if (entry.kind === 'work') work.push(role);
    else if (entry.kind === 'volunteer') volunteer.push(role);
    else if (entry.kind === 'project') projects.push(role);
    else if (entry.kind === 'other') other.push(role);
    else leadership.push(role);
  }

  const experience = [...work, ...other];
  const allRoles = [...experience, ...projects, ...leadership, ...volunteer];

  return {
    name,
    address: session.address && !isSkip(session.address) ? session.address.trim() : undefined,
    email: session.email && !isSkip(session.email) ? session.email.trim() : undefined,
    phone: session.phone && !isSkip(session.phone) ? session.phone.trim() : undefined,
    summary: buildSummary(session, allRoles),
    education: education ? [education] : [],
    experience,
    projects,
    leadership,
    volunteer,
    skills: collectSkills(session, allRoles),
  };
}
