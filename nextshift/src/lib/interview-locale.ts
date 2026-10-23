export type InterviewLang = 'en' | 'es' | 'zh-CN';

export const INTERVIEW_LANGS: { id: InterviewLang; label: string; speech: string }[] = [
  { id: 'en', label: 'English', speech: 'en-US' },
  { id: 'es', label: 'Español', speech: 'es-ES' },
  { id: 'zh-CN', label: '中文（简体）', speech: 'zh-CN' },
];

export function speechCode(lang: InterviewLang): string {
  return INTERVIEW_LANGS.find((item) => item.id === lang)?.speech ?? 'en-US';
}

export function interviewGenerationRequest(language: InterviewLang) {
  return {
    language,
    instruction: [
      `The user's selected Interviewer AI language is ${language}.`,
      '',
      'Generate ALL user-facing content in this language.',
      '',
      'Supported languages:',
      '- English (en)',
      '- Spanish (es)',
      '- Simplified Mandarin Chinese (zh-CN)',
      '',
      'Do not mix languages unless the user explicitly requests it.',
    ].join('\n'),
  };
}

export function detectAnswerLanguage(text: string): InterviewLang {
  const cjk = (text.match(/[\u3400-\u9fff]/g) ?? []).length;
  const letters = (text.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) ?? []).length;
  const esMarks = (text.match(/[áéíóúüñ¿¡]/gi) ?? []).length;
  const esWords = (
    text.match(
      /\b(el|la|los|las|que|yo|soy|estoy|para|con|una|un|en|mi|me|por|como|porque|gusta|trabajo|quiero|busco|también|tambien)\b/gi,
    ) ?? []
  ).length;
  const enWords = (
    text.match(/\b(the|and|i|i'm|im|my|to|for|with|work|like|because|when|would|you|that|this|about)\b/gi) ?? []
  ).length;
  if (cjk >= 2 && cjk >= letters) return 'zh-CN';
  if ((esMarks > 0 || esWords >= 2) && esWords >= enWords) return 'es';
  return 'en';
}

type Pack = Record<InterviewLang, string>;

function pack(en: string, es: string, zh: string): Pack {
  return { en, es, 'zh-CN': zh };
}

const UI = {
  title: pack('Interview AI', 'Entrevista IA', '智能面试'),
  start: pack('Start', 'Iniciar', '开始'),
  send: pack('Send', 'Enviar', '发送'),
  speak: pack('Speak', 'Hablar', '说话'),
  listening: pack('Listening...', 'Escuchando...', '正在听…'),
  restart: pack('Restart', 'Reiniciar', '重新开始'),
  finish: pack('Finish', 'Terminar', '结束'),
  typeAnswer: pack('Type an answer', 'Escribe una respuesta', '输入回答'),
  ready: pack(
    'When you are ready, start a short practice interview for an entry-level role.',
    'Cuando quieras, inicia una entrevista corta de práctica para un puesto de nivel inicial.',
    '准备好后，开始一场面向入门岗位的简短模拟面试。',
  ),
  speaking: pack('The interviewer is speaking.', 'La persona entrevistadora está hablando.', '面试官正在说话。'),
  needWeb: pack(
    'Voice listening needs the web app in Chrome or Edge. You can also type your answer.',
    'Para escuchar tu voz hace falta la app web en Chrome o Edge. También puedes escribir tu respuesta.',
    '语音识别需要在 Chrome 或 Edge 的网页版中使用。你也可以输入回答。',
  ),
  yourTurn: pack('Your turn — speak your answer.', 'Tu turno: di tu respuesta.', '轮到你了，请说出你的回答。'),
  missed: pack(
    'I did not catch that. Tap Speak and try again, or type your answer.',
    'No te escuché. Toca Hablar e inténtalo de nuevo, o escribe tu respuesta.',
    '我没听清。点“说话”再试一次，或输入你的回答。',
  ),
  micBlocked: pack(
    'Microphone was blocked or unavailable. Allow the mic, tap Speak, or type your answer.',
    'El micrófono está bloqueado o no disponible. Permítelo, toca Hablar o escribe tu respuesta.',
    '麦克风被拦截或不可用。请允许使用麦克风、点“说话”，或输入回答。',
  ),
  thinking: pack(
    'Listening to what you said and preparing a follow-up.',
    'Estoy entendiendo lo que dijiste y preparando una pregunta de seguimiento.',
    '正在理解你说的话，并准备追问。',
  ),
  complete: pack(
    'Interview complete. Read the overview below.',
    'Entrevista terminada. Lee el resumen de abajo.',
    '面试结束。请阅读下面的总结。',
  ),
  allowMic: pack(
    'Allow the microphone to speak your answers, or type them.',
    'Permite el micrófono para decir tus respuestas, o escríbelas.',
    '请允许使用麦克风来回答，或直接输入。',
  ),
};

export type InterviewUiKey = keyof typeof UI;

export function ui(lang: InterviewLang, key: InterviewUiKey): string {
  return UI[key][interviewGenerationRequest(lang).language];
}

const TERMS: Record<string, { es: string; 'zh-CN': string }> = {
  persistent: { es: 'persistente', 'zh-CN': '有毅力' },
  competitive: { es: 'competitivo', 'zh-CN': '好胜' },
  reliable: { es: 'fiable', 'zh-CN': '可靠' },
  curious: { es: 'curioso', 'zh-CN': '好奇' },
  helpful: { es: 'servicial', 'zh-CN': '乐于助人' },
  calm: { es: 'tranquilo', 'zh-CN': '冷静' },
  hardworking: { es: 'trabajador', 'zh-CN': '勤奋' },
  independent: { es: 'independiente', 'zh-CN': '独立' },
  organized: { es: 'organizado', 'zh-CN': '有条理' },
  creative: { es: 'creativo', 'zh-CN': '有创造力' },
  honest: { es: 'honesto', 'zh-CN': '诚实' },
  ambitious: { es: 'ambicioso', 'zh-CN': '有进取心' },
  caring: { es: 'atento', 'zh-CN': '体贴' },
  shy: { es: 'tímido', 'zh-CN': '内向' },
  outgoing: { es: 'extrovertido', 'zh-CN': '外向' },
  'comfortable leading': { es: 'cómodo liderando', 'zh-CN': '乐于带头' },
  frustrated: { es: 'frustrado', 'zh-CN': '沮丧' },
  proud: { es: 'orgulloso', 'zh-CN': '自豪' },
  nervous: { es: 'nervioso', 'zh-CN': '紧张' },
  excited: { es: 'emocionado', 'zh-CN': '兴奋' },
  stressed: { es: 'estresado', 'zh-CN': '有压力' },
  'software engineering': { es: 'ingeniería de software', 'zh-CN': '软件工程' },
  'grocery or retail': { es: 'tienda o comercio', 'zh-CN': '零售或超市' },
  'food service': { es: 'restauración', 'zh-CN': '餐饮' },
  'warehouse work': { es: 'almacén', 'zh-CN': '仓储' },
  childcare: { es: 'cuidado infantil', 'zh-CN': '托幼' },
  healthcare: { es: 'salud', 'zh-CN': '医疗护理' },
  'office or admin work': { es: 'oficina o administración', 'zh-CN': '行政办公' },
  'building games': { es: 'crear videojuegos', 'zh-CN': '游戏' },
  'making things': { es: 'hacer cosas', 'zh-CN': '动手制作' },
  music: { es: 'música', 'zh-CN': '音乐' },
  sports: { es: 'deporte', 'zh-CN': '运动' },
  art: { es: 'arte', 'zh-CN': '艺术' },
  cooking: { es: 'cocinar', 'zh-CN': '烹饪' },
  reading: { es: 'leer', 'zh-CN': '阅读' },
  'being outdoors': { es: 'estar al aire libre', 'zh-CN': '户外活动' },
  'taking the lead in groups': { es: 'tomar la iniciativa en grupo', 'zh-CN': '在小组里带头' },
  'working in groups': { es: 'trabajar en grupo', 'zh-CN': '团队合作' },
  'teaching yourself': { es: 'aprender por tu cuenta', 'zh-CN': '自学' },
  'staying until it is right': { es: 'seguir hasta que quede bien', 'zh-CN': '做到满意为止' },
  'helping when it is busy': { es: 'ayudar cuando hay prisa', 'zh-CN': '忙的时候帮忙' },
  'solving real problems': { es: 'resolver problemas reales', 'zh-CN': '解决真正的问题' },
  'doing the work yourself': { es: 'hacer el trabajo tú mismo', 'zh-CN': '自己动手把事做成' },
  'showing up for people': { es: 'estar para los demás', 'zh-CN': '为别人出现' },
  'getting things right': { es: 'hacer las cosas bien', 'zh-CN': '把事情做对' },
  work: { es: 'el trabajo', 'zh-CN': '工作' },
  that: { es: 'eso', 'zh-CN': '那件事' },
  'the job you named': { es: 'el trabajo que nombraste', 'zh-CN': '你提到的那份工作' },
};

export function term(lang: InterviewLang, label: string): string {
  if (!label || lang === 'en') return label;
  return TERMS[label.toLowerCase()]?.[lang] ?? label;
}

const PHRASES = {
  opening: pack('What kind of job are you looking for?', '¿Qué tipo de trabajo estás buscando?', '你在找什么样的工作？'),
  fun: pack('What do you like to do for fun?', '¿Qué te gusta hacer en tu tiempo libre?', '你平时喜欢做什么？'),
  backToJob: pack('I\'ll come back to the job side.', 'Volveré al tema del trabajo.', '我们稍后再谈工作。'),
  lookingAt: pack('So you\'re looking at {job}.', 'Entonces estás pensando en {job}.', '所以你想找的是{job}。'),
  'link.reaction': pack(
    '{hobbyLead} in your free time and looking at {job} is not a random pair.',
    '{hobbyLead} en tu tiempo libre y buscar {job} no es una coincidencia.',
    '你把业余时间用在{hobby}上，同时又想做{job}，这并不是随便搭配。',
  ),
  'link.question': pack(
    'What part of {hobby} do you think would actually show up in {job} work?',
    '¿Qué parte de {hobby} crees que se notaría de verdad en un trabajo de {job}?',
    '你觉得{hobby}里的哪一部分，会真正出现在{job}的工作里？',
  ),
  'hobbyJob.reaction': pack(
    'You already spend time on {hobby}, and you want {job}.',
    'Ya dedicas tiempo a {hobby}, y quieres {job}.',
    '你已经把时间花在{hobby}上，又想做{job}。',
  ),
  'hobbyJob.question': pack(
    'When {hobby} gets frustrating, what do you do — and is that how you\'d want to work on the job too?',
    'Si se te complica {hobby}, ¿qué haces, y así te gustaría trabajar también?',
    '如果{hobby}变得不顺利，你会怎么做？你希望工作中也这样吗？',
  ),
  'jobFit.reaction': pack('So the job you\'re aiming at is {job}.', 'El trabajo al que apuntas es {job}.', '你想做的工作是{job}。'),
  'jobFit.question': pack(
    'What about that kind of work feels like a fit with how you already like to spend your time?',
    '¿Qué de ese trabajo encaja con cómo te gusta pasar el tiempo?',
    '那种工作和你平时喜欢花时间的方式，哪里对得上？',
  ),
  'hobbyStory.reaction': pack(
    'I\'m more interested in how you are when you\'re doing {hobby} than in a generic work speech.',
    'Me interesa más cómo eres cuando haces {hobby} que un discurso genérico de trabajo.',
    '我更想了解你投入在{hobby}里时的样子，而不是一套空的工作套话。',
  ),
  'hobbyStory.question': pack(
    'Tell me about a time {hobby} didn\'t go smoothly and what you did next.',
    'Cuéntame un momento en que {hobby} no salió bien y qué hiciste después.',
    '讲一次{hobby}不顺利的时候，以及你接下来做了什么。',
  ),
  'needI.reaction': pack(
    'I heard the group in that answer more clearly than I heard you.',
    'En esa respuesta oí más al grupo que a ti.',
    '那句回答里，我听到的更多是团队，而不是你自己。',
  ),
  'needI.question': pack(
    'What did you personally do that someone else on the team did not?',
    '¿Qué hiciste tú que otra persona del equipo no hizo?',
    '你自己做了什么、是别人没做的？',
  ),
  'tiny.reaction': pack('I only caught "{raw}".', 'Solo alcancé a oír «{raw}».', '我只听到了「{raw}」。'),
  'tiny.question': pack(
    'What were you actually trying to tell me about yourself there?',
    '¿Qué querías decirme realmente sobre ti ahí?',
    '那时候你其实想让我了解你的哪一面？',
  ),
  'short.reaction': pack('That was only a start — {snippet}.', 'Eso fue solo un comienzo: {snippet}.', '那只是个开头：{snippet}。'),
  'short.question': pack(
    'Can you give me one real moment that shows what you mean?',
    '¿Puedes darme un momento real que muestre lo que quieres decir?',
    '你能不能给我一个真实的时刻，说明你的意思？',
  ),
  'vague.reaction': pack(
    'I\'m still missing the actual picture behind {snippet}.',
    'Todavía no veo el cuadro real detrás de {snippet}.',
    '我还是没抓住{snippet}背后真正的画面。',
  ),
  'vague.question': pack(
    'If I watched you handle a hard hour, what would I notice about how you behave?',
    'Si te viera en una hora difícil, ¿qué notaría de cómo te comportas?',
    '如果我看着你度过难熬的一小时，会注意到你怎样做事？',
  ),
  'leadComfort.reaction': pack(
    'You mentioned that you tend to take the lead when working in groups.',
    'Dijiste que sueles tomar la iniciativa cuando trabajas en grupo.',
    '你提到在小组里你往往会带头。',
  ),
  'leadComfort.question': pack(
    'What do you think makes you comfortable taking on that role?',
    '¿Qué crees que te hace sentir cómodo en ese papel?',
    '你觉得是什么让你能安心担起那个角色？',
  ),
  'leadConflict.reaction': pack(
    'Taking the lead in a group is different from just having ideas.',
    'Liderar un grupo no es lo mismo que solo tener ideas.',
    '在小组里带头，和只是有想法不是一回事。',
  ),
  'leadConflict.question': pack(
    'What do you do when someone else in the group wants to go a different way?',
    '¿Qué haces cuando alguien del grupo quiere ir por otro lado?',
    '如果组里有人想走另一条路，你会怎么做？',
  ),
  'groupRole.reaction': pack(
    'You brought up working in a group, not just working alone.',
    'Mencionaste trabajar en grupo, no solo en solitario.',
    '你提到的是团队合作，不只是独自做事。',
  ),
  'groupRole.question': pack(
    'What part of that do you usually take on without being asked?',
    '¿Qué parte sueles asumir sin que te lo pidan?',
    '哪一部分是你通常不用别人请就会自己担起来的？',
  ),
  'traitEmotion.reaction': pack(
    'You describe yourself as pretty {trait}, even when you\'re {emotion}.',
    'Te describes como bastante {trait}, incluso cuando estás {emotion}.',
    '你说自己相当{trait}，即使在{emotion}的时候也是如此。',
  ),
  'traitEmotion.question': pack(
    'Has there been a time when that {trait} side really changed the outcome of a difficult situation?',
    '¿Hubo un momento en que ese lado {trait} cambió de verdad el resultado de algo difícil?',
    '有没有一次，你{trait}的那一面真的改变了困难局面的结果？',
  ),
  'twoTraits.reaction': pack(
    'You called yourself {traitList} — those don\'t always show up the same way.',
    'Dijiste que eres {traitList}: eso no siempre se ve de la misma forma.',
    '你说自己是{traitList}——这些不一定会以同一种方式出现。',
  ),
  'twoTraits.question': pack(
    'When do you notice the {a} side taking over, and when does the {b} side?',
    '¿Cuándo notas que toma el control tu lado {a}, y cuándo el {b}?',
    '你什么时候会发现{a}占上风，什么时候是{b}？',
  ),
  'traitStory.reaction': pack(
    'The way you tell that, {trait} isn\'t a slogan — it\'s how you handled {snippet}.',
    'Por cómo lo cuentas, {trait} no es un eslogan: es cómo manejaste {snippet}.',
    '从你讲的方式看，{trait}不是口号，而是你处理{snippet}的方式。',
  ),
  'traitStory.question': pack(
    'What did you do in the moment you were most tempted to stop?',
    '¿Qué hiciste en el momento en que más quisiste parar?',
    '在你最想放弃的那一刻，你做了什么？',
  ),
  'traitExample.reaction': pack('You named {trait} about yourself.', 'Te describiste como {trait}.', '你用{trait}来形容自己。'),
  'traitExample.question': pack(
    'What\'s a specific situation where someone else would have seen that in you?',
    '¿En qué situación concreta alguien más habría visto eso en ti?',
    '有哪个具体场合，别人会从你身上看出这一点？',
  ),
  'implied.reaction': pack(
    'You didn\'t call yourself {trait}. {evidence} — that\'s {trait} in practice.',
    'No te llamaste {trait}. {evidence}: eso es {trait} en la práctica.',
    '你没有自称{trait}。{evidence}——那就是实际中的{trait}。',
  ),
  'implied.question': pack(
    'Where else has that same instinct shown up?',
    '¿Dónde más ha aparecido ese mismo instinto?',
    '同样的直觉还在别的地方出现过吗？',
  ),
  'emotion.reaction': pack(
    'The feeling in that story is {emotion}, not just the task.',
    'El sentimiento en esa historia es {emotion}, no solo la tarea.',
    '那个故事里的感觉是{emotion}，不只是任务本身。',
  ),
  'emotion.question': pack(
    'When that feeling hits, what do you do next instead of walking away?',
    'Cuando llega esa sensación, ¿qué haces en vez de irte?',
    '那种感觉来的时候，你接下来会做什么，而不是走开？',
  ),
  'motive.reaction': pack(
    'It sounds like the driver was {motive}, more than the activity on the surface.',
    'Parece que lo que te movía era {motive}, más que la actividad en la superficie.',
    '听起来真正推动你的是{motive}，而不只是表面上的那件事。',
  ),
  'motive.question': pack('What about that still matters to you now?', '¿Qué de eso te sigue importando ahora?', '其中哪一点现在对你仍然重要？'),
  'motiveCost.reaction': pack(
    'Staying with {motive} usually costs something — time, pride, or an easier option.',
    'Seguir con {motive} suele costar algo: tiempo, orgullo o una opción más fácil.',
    '坚持{motive}通常要付出代价：时间、面子，或一条更容易的路。',
  ),
  'motiveCost.question': pack('What did you give up to keep going?', '¿Qué dejaste para seguir adelante?', '为了继续下去，你放弃了什么？'),
  'methodNext.reaction': pack(
    'You didn\'t just name the problem — you said how you worked it: {method}.',
    'No solo nombraste el problema: dijiste cómo lo trabajaste: {method}.',
    '你不只是点出了问题，还说了你怎么处理：{method}。',
  ),
  'methodNext.question': pack(
    'What told you that approach was working?',
    '¿Qué te dijo que ese enfoque estaba funcionando?',
    '你怎么知道那种做法是有效的？',
  ),
  'methodAgain.reaction': pack(
    'That is a hands-on way of learning, not a speech about trying hard.',
    'Eso es una forma práctica de aprender, no un discurso sobre esforzarse.',
    '那是动手学的方式，不是一套“我很努力”的空话。',
  ),
  'methodAgain.question': pack(
    'If you had to do that again next week, what would you change first?',
    'Si tuvieras que hacerlo de nuevo la semana que viene, ¿qué cambiarías primero?',
    '如果下周还要再做一次，你会先改什么？',
  ),
  'busy.reaction': pack(
    'Helping when it is busy says more about how you work than about the job title.',
    'Ayudar cuando hay prisa dice más de cómo trabajas que del nombre del puesto.',
    '忙的时候愿意帮忙，比职位名称更能说明你怎么做事。',
  ),
  'busy.question': pack(
    'When everything is happening at once, how do you decide what to do first?',
    'Cuando todo pasa a la vez, ¿cómo decides qué hacer primero?',
    '什么都挤在一起时，你怎么决定先做什么？',
  ),
  'connect.reaction': pack(
    'That lines up with you talking about being {trait} earlier.',
    'Eso encaja con que antes hablaste de ser {trait}.',
    '这和你之前说自己{trait}是对得上的。',
  ),
  'connect.question': pack(
    'How does being {trait} show up in what you just described?',
    '¿Cómo se nota que eres {trait} en lo que acabas de describir?',
    '你刚描述的事情里，{trait}是怎么体现的？',
  ),
  'bridge.reaction': pack(
    'I\'m still holding onto you being {trait}, and now you\'re talking about {snippet}.',
    'Sigo con que eres {trait}, y ahora hablas de {snippet}.',
    '我还记着你{trait}，而现在你在谈{snippet}。',
  ),
  'bridge.question': pack(
    'Do those two things pull in the same direction for you, or do they clash?',
    '¿Esas dos cosas van en la misma dirección para ti, o chocan?',
    '对你来说这两件事是同一方向，还是会打架？',
  ),
  'needResult.reaction': pack(
    'I can follow the situation, but not yet what changed because of you.',
    'Sigo la situación, pero aún no qué cambió por ti.',
    '情况我听懂了，但还不知道因为你而改变了什么。',
  ),
  'needResult.question': pack(
    'How did it turn out after you stepped in?',
    '¿Cómo terminó después de que interviniste?',
    '你插手之后，结果怎么样？',
  ),
  'wrap.want': pack('you want {job}', 'quieres {job}', '你想做{job}'),
  'wrap.hobby': pack('you spend free time on {hobby}', 'dedicas tu tiempo libre a {hobby}', '业余时间做{hobby}'),
  'wrap.trait': pack('you come across as {trait}', 'te ves como alguien {trait}', '你给人的感觉是{trait}'),
  'wrap.picture': pack('I\'m starting to get a picture: {bits}.', 'Empiezo a ver un retrato: {bits}.', '我开始看到一幅画像：{bits}。'),
  'wrap.someone': pack(
    'The picture I\'m getting is someone who is {traitList}.',
    'La imagen que me hago es la de alguien {traitList}.',
    '我得到的印象是一个{traitList}的人。',
  ),
  'wrap.sides': pack(
    'You\'ve given me a few sides of how you work.',
    'Me has dado varios lados de cómo trabajas.',
    '你已经让我看到你做事的几面。',
  ),
  'wrap.question': pack(
    'Before we stop, is there one more thing a hiring manager should understand about you?',
    'Antes de terminar, ¿hay una cosa más que quien contrata debería entender de ti?',
    '结束前，还有没有一件事是招聘经理应该了解你的？',
  ),
  'open.reaction': pack('I\'m paying attention to {snippet}.', 'Estoy prestando atención a {snippet}.', '我在注意{snippet}。'),
  'open.question': pack(
    'What about that feels most like you, not just like the situation?',
    '¿Qué de eso se siente más como tú, y no solo como la situación?',
    '这里面哪一点最像你自己，而不只是那个情境？',
  ),
  'fresh.keep': pack(
    'I don\'t want to lose {hobby} or {job}.',
    'No quiero perder {hobby} ni {job}.',
    '我不想丢掉{hobby}或{job}。',
  ),
  'fresh.noRepeat': pack(
    'I don\'t want to re-ask something we already covered.',
    'No quiero repetir algo que ya cubrimos.',
    '我不想把已经问过的再问一遍。',
  ),
  'fresh.job': pack(
    'What would you want a hiring manager to understand about how you\'d show up in {job}?',
    '¿Qué querrías que quien contrata entendiera sobre cómo te presentarías en {job}?',
    '你希望招聘经理怎样理解你会在{job}里出现的样子？',
  ),
  'fresh.work': pack(
    'What is one thing about how you work that we have not gotten to yet?',
    '¿Qué hay de cómo trabajas que aún no hemos tocado?',
    '关于你怎么做事，还有哪一点我们没谈到？',
  ),
  thanks: pack(
    'Thank you. I put a written overview of this interview on the screen.',
    'Gracias. Dejé un resumen escrito de esta entrevista en la pantalla.',
    '谢谢。我把这次面试的书面总结放在屏幕上了。',
  ),
  'header.overview': pack('Interview Overview', 'Resumen de la entrevista', '面试概览'),
  'header.presented': pack('How You Presented Yourself', 'Cómo te presentaste', '你如何展现自己'),
  'header.strengths': pack('Strengths', 'Fortalezas', '优势'),
  'header.growth': pack('Areas for Improvement', 'Áreas de mejora', '可以改进的地方'),
  'header.communication': pack('Communication Feedback', 'Comentarios de comunicación', '沟通反馈'),
  'header.perQuestion': pack('Question-by-Question Feedback', 'Comentarios pregunta por pregunta', '逐题反馈'),
  'header.takeaways': pack('Key Takeaways', 'Puntos clave', '要点'),
  'empty.body': pack(
    'There was not enough spoken material yet to write a fair report.',
    'Aún no hubo suficiente material hablado para un informe justo.',
    '目前说的内容还不够，没法写出公允的总结。',
  ),
  'empty.takeaway': pack(
    'Answer one question with a full situation: what happened, what you did, and how it turned out.',
    'Responde una pregunta con una situación completa: qué pasó, qué hiciste y cómo terminó.',
    '用一个完整的情境回答一道题：发生了什么、你做了什么、结果如何。',
  ),
  'overview.one': pack(
    'This was a short exchange. You mainly said {quote}.',
    'Fue un intercambio corto. Sobre todo dijiste {quote}.',
    '这是一段很短的交流。你主要说了{quote}。',
  ),
  'overview.many': pack(
    'Over {count} answers, you came across as someone interested in {interest}{extra}. The later questions followed what you actually raised, not a generic script.',
    'En {count} respuestas, te mostraste como alguien interesado en {interest}{extra}. Las preguntas siguientes salieron de lo que tú planteaste, no de un guion genérico.',
    '在{count}次回答里，你给人的印象是一个对{interest}感兴趣的人{extra}。后面的问题顺着你真正提到的内容，而不是一套通用稿。',
  ),
  'overview.hobby': pack(
    ', who spends free time on {hobby}',
    ', que dedica su tiempo libre a {hobby}',
    '，业余时间花在{hobby}上',
  ),
  'overview.traits': pack(', and who is {traitList}', ' y que es {traitList}', '，而且{traitList}'),
  'presented.traits': pack('Recurring traits: {traitList}.', 'Rasgos que se repiten: {traitList}.', '反复出现的特质：{traitList}。'),
  'presented.activities': pack(
    'You spoke more about activities than about how you see yourself.',
    'Hablaste más de actividades que de cómo te ves.',
    '你谈活动比谈你怎么看自己更多。',
  ),
  'presented.behavior': pack(
    'How you described your behavior: {behaviorList}.',
    'Cómo describiste tu comportamiento: {behaviorList}.',
    '你描述自己做事的方式：{behaviorList}。',
  ),
  'presented.motive': pack(
    'Motivation that came through: {motive}.',
    'La motivación que se notó: {motive}.',
    '透出来的动力：{motive}。',
  ),
  'presented.emotion': pack(
    'Emotion you were willing to name: {emotionList}.',
    'Emoción que quisiste nombrar: {emotionList}.',
    '你愿意说出口的情绪：{emotionList}。',
  ),
  'presented.values': pack(
    'What seemed to matter to you: {valueList}.',
    'Lo que parecía importarte: {valueList}.',
    '对你似乎重要的事：{valueList}。',
  ),
  'strength.traitStory': pack(
    'You connected a self-description ({traitList}) to a real moment. Evidence: {quote}. That is stronger than listing adjectives alone.',
    'Conectaste una descripción de ti ({traitList}) con un momento real. Prueba: {quote}. Eso es más fuerte que solo enumerar adjetivos.',
    '你把对自己的描述（{traitList}）连到了一个真实时刻。依据：{quote}。这比只列形容词更有力。',
  ),
  'strength.implied': pack(
    'Your behavior showed a trait even when you did not label it ({trait}). Evidence: {quote}.',
    'Tu comportamiento mostró un rasgo aunque no lo nombraste ({trait}). Prueba: {quote}.',
    '即使你没有给它起名字，你的做法也显出了一种特质（{trait}）。依据：{quote}。',
  ),
  'strength.method': pack(
    'You explained what you actually did next, not only that something was hard. Evidence: {quote}.',
    'Explicaste qué hiciste después, no solo que algo fue difícil. Prueba: {quote}.',
    '你说明了接下来具体做了什么，而不只是说这件事很难。依据：{quote}。',
  ),
  'strength.motive': pack(
    'You gave a reason, not just an event, which helps someone understand your judgment. Evidence: {quote}.',
    'Diste una razón, no solo un hecho, y eso ayuda a entender tu criterio. Prueba: {quote}.',
    '你给了原因，而不只是一件事，这有助于别人理解你的判断。依据：{quote}。',
  ),
  'strength.fallback': pack(
    'You stayed in the conversation and answered in your own words rather than reciting a script. Evidence: {quote}.',
    'Seguiste en la conversación y respondiste con tus palabras, sin recitar un guion. Prueba: {quote}.',
    '你留在对话里，用自己的话回答，而不是背稿。依据：{quote}。',
  ),
  'label.what': pack('What: {text}', 'Qué: {text}', '是什么：{text}'),
  'label.why': pack('Why: {text}', 'Por qué: {text}', '为什么：{text}'),
  'label.how': pack('How: {text}', 'Cómo: {text}', '怎么做：{text}'),
  'label.from': pack('From this interview: {text}', 'De esta entrevista: {text}', '来自这次面试：{text}'),
  'growth.specific.title': pack('Be more specific with examples', 'Sé más concreto con los ejemplos', '举例要更具体'),
  'growth.specific.what': pack(
    'You described yourself as {trait}, but you did not walk through a situation with a beginning, your action, and a result.',
    'Te describiste como {trait}, pero no recorriste una situación con inicio, tu acción y un resultado.',
    '你说自己{trait}，但没有讲清一件事的开头、你的行动和结果。',
  ),
  'growth.specific.why': pack(
    'A hiring manager cannot tell the difference between a trait you have and a trait you wish you had.',
    'Quien contrata no puede distinguir un rasgo que tienes de un rasgo que te gustaría tener.',
    '招聘经理分不清这是你真有的特质，还是你希望自己有的特质。',
  ),
  'growth.specific.how': pack(
    'Pick one moment. Say what was going wrong, what you did, and what changed.',
    'Elige un momento. Di qué iba mal, qué hiciste y qué cambió.',
    '选一个时刻。说清当时哪里不对、你做了什么、后来变了什么。',
  ),
  'growth.role.title': pack('Name your role', 'Nombra tu papel', '说出你的角色'),
  'growth.role.what': pack(
    'At least one answer stayed with "we," so your personal work was hard to see.',
    'Al menos una respuesta se quedó en «nosotros», así que tu trabajo personal casi no se veía.',
    '至少有一次回答一直在说「我们」，所以很难看出你个人做了什么。',
  ),
  'growth.role.why': pack(
    'Interviewers hire a person, not a whole group.',
    'Quien entrevista contrata a una persona, no a todo un grupo.',
    '面试官雇的是一个人，不是一整组人。',
  ),
  'growth.role.how': pack(
    'After you mention the team, add one sentence that starts with "I" and names your step.',
    'Después de mencionar al equipo, añade una frase que empiece con «yo» y nombre tu paso.',
    '提到团队之后，补一句以「我」开头、说明你那一步的话。',
  ),
  'growth.thin.title': pack('Develop thin answers', 'Desarrolla las respuestas cortas', '把过短的回答展开'),
  'growth.thin.what': pack(
    'At least one response was too brief or too general to use.',
    'Al menos una respuesta fue demasiado breve o demasiado general para usarla.',
    '至少有一次回答太短或太笼统，没法用。',
  ),
  'growth.thin.why': pack(
    'Short or vague answers force the interviewer to invent the rest — and they may invent the wrong thing.',
    'Las respuestas cortas o vagas obligan a inventar el resto, y pueden inventar lo incorrecto.',
    '太短或太模糊的回答会逼面试官自己脑补，而且可能补错。',
  ),
  'growth.thin.how': pack(
    'Use three beats: situation, what you did, how it turned out.',
    'Usa tres pasos: la situación, qué hiciste y cómo terminó.',
    '用三拍：情境、你做了什么、结果如何。',
  ),
  'growth.results.title': pack('Connect traits to results', 'Conecta los rasgos con resultados', '把特质连到结果'),
  'growth.results.what': pack(
    'You came across as {trait}, but we did not hear a time that trait changed the outcome.',
    'Diste la impresión de ser {trait}, pero no oímos un momento en que ese rasgo cambiara el resultado.',
    '你给人的感觉是{trait}，但我们没听到这种特质改变结果的一次经历。',
  ),
  'growth.results.why': pack(
    'A trait only lands if something was different because you stayed with it.',
    'Un rasgo solo convence si algo fue distinto porque te quedaste con ello.',
    '一种特质只有在「因为你坚持，结果变了」的时候才站得住。',
  ),
  'growth.results.how': pack(
    'End the story with the result: what worked, what you learned, or what you would do again.',
    'Cierra la historia con el resultado: qué funcionó, qué aprendiste o qué repetirías.',
    '用结果收尾：什么奏效了、你学到了什么，或下次还会怎么做。',
  ),
  'growth.action.title': pack(
    'Say what you did, not only what happened',
    'Di qué hiciste, no solo qué pasó',
    '说出你做了什么，而不只是发生了什么',
  ),
  'growth.action.what': pack(
    'Some stories described a problem without your specific steps.',
    'Algunas historias describieron un problema sin tus pasos concretos.',
    '有些故事只讲了问题，没有你的具体步骤。',
  ),
  'growth.action.why': pack(
    'The interviewer needs a behavior they can picture you repeating at work.',
    'Quien entrevista necesita una conducta que pueda imaginarte repitiendo en el trabajo.',
    '面试官需要一个能想象你会在工作里重复的行为。',
  ),
  'growth.action.how': pack(
    'Add the action: asked, tested, stayed, split the work, checked again.',
    'Añade la acción: preguntaste, probaste, te quedaste, repartiste el trabajo, revisaste otra vez.',
    '补上动作：问了、试了、留下来、把工作分开、又检查了一遍。',
  ),
  'growth.tie.title': pack('Tie the same behavior to the job', 'Ata la misma conducta al trabajo', '把同样的做法连到工作上'),
  'growth.tie.what': pack(
    'You already gave usable material, but it still lives in the past tense of the story.',
    'Ya diste material útil, pero todavía vive en el pasado de la historia.',
    '你已经给了能用的材料，但它还停在故事的过去时里。',
  ),
  'growth.tie.why': pack(
    'Hiring managers want to know the behavior will show up on a shift, not only in the example.',
    'Quien contrata quiere saber que esa conducta aparecerá en un turno, no solo en el ejemplo.',
    '招聘经理想知道这种做法会出现在班次里，而不只是出现在例子里。',
  ),
  'growth.tie.how': pack(
    'Close with one sentence: how that same approach would show up in the first month of work.',
    'Cierra con una frase: cómo ese mismo enfoque se vería en el primer mes de trabajo.',
    '用一句话收尾：同样的做法会怎样出现在入职第一个月。',
  ),
  'comm.short': pack(
    'Clarity: several answers were so short an interviewer had to guess. Why it matters: they cannot hire a blank. How: add what was going on, what you did, and how it ended.',
    'Claridad: varias respuestas fueron tan cortas que había que adivinar. Por qué importa: no se puede contratar un espacio en blanco. Cómo: añade qué pasaba, qué hiciste y cómo terminó.',
    '清晰度：有几次回答短到面试官只能猜。为什么重要：没法雇用一段空白。怎么做：补上当时的情况、你做了什么、最后怎样。',
  ),
  'comm.long': pack(
    'Conciseness: you were willing to talk at length. Why it matters: a long answer can hide the point. How: land on what you did and why before you add extra context.',
    'Concisión: estuviste dispuesto a hablar largo. Por qué importa: una respuesta larga puede esconder el punto. Cómo: di primero qué hiciste y por qué, y luego el contexto.',
    '简洁：你愿意讲得很长。为什么重要：太长的回答会把重点藏起来。怎么做：先说你做了什么、为什么，再补背景。',
  ),
  'comm.ok': pack(
    'Clarity: answer length was generally usable — enough to follow without losing the thread.',
    'Claridad: la extensión de las respuestas, en general, se podía seguir sin perder el hilo.',
    '清晰度：回答的长度大体够用，能听下去而不丢主线。',
  ),
  'comm.specific': pack(
    'Specificity: a few answers stayed general. Why it matters: vague language is forgettable. How: replace "stuff" or "the usual" with one concrete action.',
    'Precisión: algunas respuestas se quedaron en lo general. Por qué importa: lo vago se olvida. Cómo: cambia «cosas» o «lo de siempre» por una acción concreta.',
    '具体性：有几次回答停在笼统层面。为什么重要：含糊的话记不住。怎么做：把「还行」或「随便」换成一个具体动作。',
  ),
  'comm.organizeWeak': pack(
    'Organization: some answers named a quality without a beginning, middle, and end. How: use one situation per claim.',
    'Organización: algunas respuestas nombraron una cualidad sin inicio, medio y final. Cómo: usa una situación por cada afirmación.',
    '结构：有些回答只点了一个品质，没有开头、经过和结尾。怎么做：每个说法配一个情境。',
  ),
  'comm.organizeOk': pack(
    'Organization: you often spoke in situations, which is easier to remember than a list of claims.',
    'Organización: a menudo hablaste con situaciones, y eso se recuerda mejor que una lista de afirmaciones.',
    '结构：你常常用情境来讲，这比一串说法更好记。',
  ),
  'comm.filler': pack(
    'Filler: the transcript shows repeated phrasing like "like" or "you know." Why it matters: it can make a strong point sound unsure. How: pause instead of filling the gap.',
    'Muletillas: la transcripción repite fórmulas como «o sea» o «pues». Por qué importa: pueden hacer que un punto fuerte suene inseguro. Cómo: haz una pausa en vez de rellenar el silencio.',
    '口头语：记录里反复出现「那个」或「就是」。为什么重要：它会让一个有力的点听起来没底气。怎么做：停一下，不要用口头语填空。',
  ),
  'comm.ownership': pack(
    'Ownership: group language showed up without a clear "I." Why it matters: the interviewer cannot tell what to hire. How: say the step that was yours.',
    'Responsabilidad: apareció el lenguaje de grupo sin un «yo» claro. Por qué importa: no se puede ver qué contratar. Cómo: di el paso que fue tuyo.',
    '归属：出现了团队说法，却没有清楚的「我」。为什么重要：面试官看不出该雇用的是哪一部分。怎么做：说出属于你的那一步。',
  ),
  'worked.traits': pack(
    'You revealed how you see yourself ({traitList}).',
    'Mostraste cómo te ves ({traitList}).',
    '你展现了你怎么看自己（{traitList}）。',
  ),
  'worked.behavior': pack(
    'You described an actual way you behave ({behavior}).',
    'Describiste una forma real de comportarte ({behavior}).',
    '你描述了一种真实的做法（{behavior}）。',
  ),
  'worked.story': pack(
    'You offered a situation instead of a one-word claim.',
    'Ofreciste una situación en vez de una frase de una palabra.',
    '你给了一个情境，而不是一句话的空说法。',
  ),
  'worked.words': pack('You answered in your own words.', 'Respondiste con tus propias palabras.', '你用自己的话作了回答。'),
  'improve.brief': pack('The answer was too brief to hang onto.', 'La respuesta fue demasiado breve para retenerla.', '这个回答太短，抓不住。'),
  'improve.vague': pack(
    'The language stayed general, so the meaning was easy to miss.',
    'El lenguaje se quedó en lo general, así que el sentido era fácil de perder.',
    '说法一直很笼统，意思很容易漏掉。',
  ),
  'improve.role': pack('Your personal role was unclear.', 'Tu papel personal no quedó claro.', '你个人的角色不清楚。'),
  'improve.result': pack(
    'We heard the struggle more clearly than the result.',
    'Se oyó la dificultad con más claridad que el resultado.',
    '困难听得比结果更清楚。',
  ),
  'improve.work': pack(
    'You could add one sentence about what you would do the same way at work.',
    'Podrías añadir una frase sobre qué harías igual en el trabajo.',
    '你可以补一句：同样的做法会怎样用在工作里。',
  ),
  'suggest.short': pack(
    'Restart with: "One time I... I did... and it ended with..."',
    'Empieza de nuevo así: «Una vez yo… Hice… y terminó con…»',
    '可以这样重新开口：「有一次我……我做了……最后……」',
  ),
  'suggest.keep': pack(
    'Keep the same story, and add what you personally did and what changed because of it.',
    'Quédate con la misma historia y añade qué hiciste tú y qué cambió por eso.',
    '留着同一个故事，补上你亲自做了什么，以及因此改变了什么。',
  ),
  'per.youSaid': pack('You said: {quote}', 'Dijiste: {quote}', '你说：{quote}'),
  'per.worked': pack('What worked: {text}', 'Lo que funcionó: {text}', '有效之处：{text}'),
  'per.stronger': pack('What could be stronger: {text}', 'Qué podría ser más fuerte: {text}', '可以更强的地方：{text}'),
  'per.try': pack('Try this: {text}', 'Prueba esto: {text}', '可以这样试：{text}'),
  'per.empty': pack(
    'Not enough full question-and-answer pairs to review one by one.',
    'No hay suficientes pares de pregunta y respuesta para revisarlas una por una.',
    '完整的问答还不够，没法逐题回顾。',
  ),
  'take.lead': pack(
    'If you lead with {trait}, immediately back it with a moment.',
    'Si empiezas con {trait}, apóyalo enseguida con un momento.',
    '如果你先说{trait}，马上用一个具体时刻把它撑住。',
  ),
  'take.pick': pack(
    'Pick one sentence about how you work, then prove it with a story.',
    'Elige una frase sobre cómo trabajas y pruébala con una historia.',
    '先用一句话说明你怎么做事，再用一个故事证明它。',
  ),
  'take.group': pack(
    'In group stories, say "I" for your part.',
    'En las historias de grupo, di «yo» cuando hables de tu parte.',
    '讲团队经历时，你自己的那部分要用「我」。',
  ),
  'take.result': pack(
    'End with a result: what changed because you stayed with it.',
    'Termina con un resultado: qué cambió porque te quedaste con ello.',
    '用结果收尾：因为你坚持，什么变了。',
  ),
};

export type PhraseKey = keyof typeof PHRASES;

const AND_LIST_VARS = new Set(['traitList', 'behaviorList', 'valueList', 'emotionList']);
const LEAD_VARS = new Set(['hobbyLead']);
const PLAIN_VARS = new Set([
  'snippet',
  'raw',
  'evidence',
  'method',
  'motive',
  'quote',
  'text',
  'extra',
  'bits',
  'count',
]);

function echoEnglish(text: string) {
  return text
    .replace(/\bI'm\b/g, "you're")
    .replace(/\bI've\b/g, "you've")
    .replace(/\bI'd\b/g, "you'd")
    .replace(/\bI\b/g, 'you')
    .replace(/\bmy\b/gi, 'your')
    .replace(/\bmine\b/gi, 'yours');
}

function sentenceStart(text: string, lang: InterviewLang) {
  if (!text || lang === 'zh-CN') return text;
  return text.charAt(0).toLocaleUpperCase(lang === 'es' ? 'es' : 'en-US') + text.slice(1);
}

function localizeInsert(lang: InterviewLang, value: string, lead = false) {
  const translated = term(lang, value);
  const sameLanguage = lang === 'en' || detectAnswerLanguage(value) === lang || translated !== value;
  if (sameLanguage) return lead ? sentenceStart(translated, lang) : translated;
  return lang === 'zh-CN' ? `「${value}」` : `«${value}»`;
}

function joinAnd(lang: InterviewLang, items: string[]) {
  const list = items.filter(Boolean);
  if (list.length <= 1) return list[0] ?? '';
  if (lang === 'zh-CN') return list.join('和');
  if (list.length === 2) return lang === 'es' ? `${list[0]} y ${list[1]}` : `${list[0]} and ${list[1]}`;
  const head = list.slice(0, -1).join(', ');
  return lang === 'es' ? `${head} y ${list[list.length - 1]}` : `${head}, and ${list[list.length - 1]}`;
}

function joinComma(lang: InterviewLang, items: string[]) {
  const list = items.filter(Boolean);
  if (list.length <= 1) return list[0] ?? '';
  if (lang === 'zh-CN') return list.join('，');
  if (lang === 'es') return joinAnd(lang, list);
  return list.join(', ');
}

function line(lang: InterviewLang, key: PhraseKey, vars?: Record<string, string>) {
  const template = PHRASES[key][lang];
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => vars[name] ?? '');
}

function wrapPicture(lang: InterviewLang, job: string, hobby: string, trait: string) {
  const bits = [
    job ? line(lang, 'wrap.want', { job: term(lang, job) }) : '',
    hobby ? line(lang, 'wrap.hobby', { hobby: term(lang, hobby) }) : '',
    trait ? line(lang, 'wrap.trait', { trait: term(lang, trait) }) : '',
  ].filter(Boolean);
  return line(lang, 'wrap.picture', { bits: joinComma(lang, bits) });
}

export function generatedLine(language: InterviewLang, key: PhraseKey, vars?: Record<string, string>) {
  const lang = interviewGenerationRequest(language).language;
  if (key === 'wrap.picture') return wrapPicture(lang, vars?.job ?? '', vars?.hobby ?? '', vars?.trait ?? '');
  const localized: Record<string, string> = {};
  for (const [name, value] of Object.entries(vars ?? {})) {
    if (AND_LIST_VARS.has(name)) {
      localized[name] = joinAnd(
        lang,
        value
          .split('|')
          .filter(Boolean)
          .map((item) => localizeInsert(lang, item)),
      );
    } else if (LEAD_VARS.has(name)) {
      localized[name] = localizeInsert(lang, value, true);
    } else if (PLAIN_VARS.has(name)) {
      if ((name === 'snippet' || name === 'evidence' || name === 'method' || name === 'motive') && lang === 'en') {
        localized[name] = detectAnswerLanguage(value) === 'en' ? echoEnglish(value) : value;
      } else if (name === 'snippet' || name === 'evidence' || name === 'method' || name === 'motive') {
        localized[name] = localizeInsert(lang, value);
      } else {
        localized[name] = value;
      }
    } else {
      localized[name] = localizeInsert(lang, value);
    }
  }
  return line(lang, key, localized);
}

export type InterviewPrompt = {
  reactionKey?: PhraseKey;
  reactionVars?: Record<string, string>;
  questionKey?: PhraseKey;
  questionVars?: Record<string, string>;
};

export function renderPrompt(language: InterviewLang, prompt: InterviewPrompt): string {
  const lang = interviewGenerationRequest(language).language;
  const parts = [
    prompt.reactionKey ? generatedLine(lang, prompt.reactionKey, prompt.reactionVars) : '',
    prompt.questionKey ? generatedLine(lang, prompt.questionKey, prompt.questionVars) : '',
  ].filter(Boolean);
  return parts.join(lang === 'zh-CN' ? '' : ' ').replace(/[ \t]{2,}/g, ' ').trim();
}
