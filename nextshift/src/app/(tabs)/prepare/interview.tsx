import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { ShoeMark } from '@/components/shoe-mark';
import {
  buildInterviewReview,
  nextInterviewerLine,
  type InterviewTurn,
} from '@/lib/interview-engine';
import {
  generatedLine,
  INTERVIEW_LANGS,
  renderPrompt,
  speechCode,
  ui,
  type InterviewLang,
  type InterviewPrompt,
  type InterviewUiKey,
} from '@/lib/interview-locale';
import {
  canListen,
  listenOnce,
  requestMicrophone,
  speakAloud,
  stopListening,
  stopSpeaking,
} from '@/lib/interview-voice';
import { colors, fonts, radii, spacing } from '@/theme/tokens';

type Message = { id: string; from: 'coach' | 'you'; text: string; prompt?: InterviewPrompt };
type Phase = 'idle' | 'speaking' | 'listening' | 'thinking' | 'done';
type StatusKey = Extract<
  InterviewUiKey,
  'ready' | 'speaking' | 'needWeb' | 'yourTurn' | 'missed' | 'micBlocked' | 'thinking' | 'complete' | 'allowMic'
>;

export default function InterviewScreen() {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [draft, setDraft] = useState('');
  const [partial, setPartial] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [statusKey, setStatusKey] = useState<StatusKey>('ready');
  const [lang, setLang] = useState<InterviewLang>('en');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm0',
      from: 'coach',
      text: '',
    },
  ]);

  const sessionRef = useRef(0);
  const turnsRef = useRef<InterviewTurn[]>([]);
  const finishedRef = useRef(false);
  const messagesRef = useRef(messages);
  const langRef = useRef(lang);
  const scrollRef = useRef<ScrollView>(null);
  messagesRef.current = messages;
  langRef.current = lang;

  const voiceLang = () => speechCode(langRef.current);
  const chooseLang = (next: InterviewLang) => {
    langRef.current = next;
    setLang(next);
  };
  const projectTurns = (language: InterviewLang): InterviewTurn[] =>
    turnsRef.current.map((turn) =>
      turn.prompt ? { ...turn, text: renderPrompt(language, turn.prompt) } : turn,
    );

  useEffect(() => {
    return () => {
      sessionRef.current += 1;
      stopListening();
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, partial, statusKey, lang]);

  const toTurns = (list: Message[]): InterviewTurn[] =>
    list
      .filter((message) => message.id !== 'm0' && message.id !== 'review')
      .map((message) => ({
        role: message.from === 'coach' ? ('interviewer' as const) : ('candidate' as const),
        text: message.prompt ? renderPrompt(langRef.current, message.prompt) : message.text,
        prompt: message.prompt,
        themeId: message.id === 'q-0' ? 'opening' : undefined,
      }));

  const bubbleText = (message: Message) => {
    if (message.id === 'm0') return ui(lang, 'ready');
    if (message.id === 'review') return buildInterviewReview(projectTurns(lang), lang);
    if (message.from === 'coach' && message.prompt) return renderPrompt(lang, message.prompt);
    return message.text;
  };

  const speakThenListen = async (session: number, prompt: InterviewPrompt) => {
    setPhase('speaking');
    setStatusKey('speaking');
    await speakAloud(renderPrompt(langRef.current, prompt), voiceLang());
    if (session !== sessionRef.current) return;
    await captureAnswer(session);
  };

  const captureAnswer = async (session: number) => {
    if (!canListen()) {
      setPhase('listening');
      setStatusKey('needWeb');
      return;
    }
    setPhase('listening');
    setPartial('');
    setStatusKey('yourTurn');
    try {
      const heard = await listenOnce((text) => {
        if (session === sessionRef.current) setPartial(text);
      }, voiceLang());
      if (session !== sessionRef.current) return;
      setPartial('');
      if (!heard) {
        setStatusKey('missed');
        setPhase('listening');
        return;
      }
      await handleCandidateText(session, heard);
    } catch {
      if (session !== sessionRef.current) return;
      setPartial('');
      setPhase('listening');
      setStatusKey('micBlocked');
    }
  };

  const handleCandidateText = async (session: number, text: string) => {
    const trimmed = text.trim();
    if (!trimmed || finishedRef.current) return;

    setPhase('thinking');
    setStatusKey('thinking');
    const you: Message = { id: `a-${Date.now()}`, from: 'you', text: trimmed };
    const withYou = [...messagesRef.current.filter((message) => message.id !== 'm0'), you];
    turnsRef.current = [...projectTurns(langRef.current), { role: 'candidate', text: trimmed }];
    const next = nextInterviewerLine(turnsRef.current, langRef.current);

    if (next.kind === 'complete') {
      finishedRef.current = true;
      setMessages([...withYou, { id: 'review', from: 'coach', text: next.text }]);
      setFinished(true);
      setStarted(true);
      setPhase('done');
      setStatusKey('complete');
      setDraft('');
      await speakAloud(generatedLine(langRef.current, 'thanks'), voiceLang());
      return;
    }

    turnsRef.current = [
      ...turnsRef.current,
      { role: 'interviewer', text: next.text, themeId: next.themeId, prompt: next.prompt },
    ];
    setMessages([...withYou, { id: `q-${Date.now()}`, from: 'coach', text: next.text, prompt: next.prompt }]);
    setDraft('');
    if (session !== sessionRef.current || !next.prompt) return;
    await speakThenListen(session, next.prompt);
  };

  const start = async () => {
    sessionRef.current += 1;
    const session = sessionRef.current;
    stopListening();
    stopSpeaking();
    setStarted(true);
    finishedRef.current = false;
    setFinished(false);
    setDraft('');
    setPartial('');
    const openingPrompt: InterviewPrompt = { questionKey: 'opening' };
    const openingText = renderPrompt(langRef.current, openingPrompt);
    const opening: Message = { id: 'q-0', from: 'coach', text: openingText, prompt: openingPrompt };
    setMessages([opening]);
    turnsRef.current = [{ role: 'interviewer', text: openingText, themeId: 'opening', prompt: openingPrompt }];
    const mic = requestMicrophone().catch(() => {
      if (session === sessionRef.current) {
        setStatusKey('allowMic');
      }
    });
    if (session !== sessionRef.current) return;
    await speakThenListen(session, openingPrompt);
    await mic;
  };

  const submitTyped = async () => {
    if (!draft.trim() || finished) return;
    const session = sessionRef.current;
    stopListening();
    await handleCandidateText(session, draft);
  };

  const onSpeakPress = async () => {
    if (finished) return;
    const session = sessionRef.current;
    if (phase === 'speaking') return;
    stopSpeaking();
    await captureAnswer(session);
  };

  const finishInterview = async () => {
    sessionRef.current += 1;
    stopListening();
    stopSpeaking();
    finishedRef.current = true;
    const source = turnsRef.current.length ? projectTurns(langRef.current) : toTurns(messagesRef.current);
    const review = buildInterviewReview(source, langRef.current);
    setMessages((current) => [
      ...current.filter((message) => message.id !== 'm0' && message.id !== 'review'),
      { id: 'review', from: 'coach', text: review },
    ]);
    setFinished(true);
    setPhase('done');
    setStatusKey('complete');
    await speakAloud(generatedLine(langRef.current, 'thanks'), voiceLang());
  };

  return (
    <Screen>
      <View style={styles.top}>
        <ShoeMark width={110} height={78} />
        <Text style={styles.title}>{ui(lang, 'title')}</Text>
      </View>
      <ScrollView ref={scrollRef} style={styles.chat} contentContainerStyle={styles.chatContent}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[styles.bubble, message.from === 'you' ? styles.you : styles.coach]}>
            <Text style={styles.bubbleText}>{bubbleText(message)}</Text>
          </View>
        ))}
        {partial ? (
          <View style={[styles.bubble, styles.you]}>
            <Text style={styles.bubbleText}>{partial}</Text>
          </View>
        ) : null}
      </ScrollView>
      <View style={styles.controls}>
        <View style={styles.langRow}>
          {INTERVIEW_LANGS.map((item) => {
            const on = lang === item.id;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={() => chooseLang(item.id)}
                style={[styles.langBtn, on && styles.langBtnOn]}>
                <Text style={[styles.langBtnText, on && styles.langBtnTextOn]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.status}>{ui(lang, statusKey)}</Text>
        {!started ? (
          <PrimaryButton label={ui(lang, 'start')} onPress={start} />
        ) : (
          <>
            <View style={styles.inputRow}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder={ui(lang, 'typeAnswer')}
                placeholderTextColor={colors.prototype}
                style={styles.input}
                editable={!finished}
              />
              <Pressable onPress={submitTyped} style={styles.send} disabled={finished}>
                <Text style={styles.sendText}>{ui(lang, 'send')}</Text>
              </Pressable>
            </View>
            <PrimaryButton
              label={phase === 'listening' ? ui(lang, 'listening') : ui(lang, 'speak')}
              onPress={onSpeakPress}
              disabled={finished || phase === 'speaking' || phase === 'thinking'}
            />
            <View style={styles.row}>
              <PrimaryButton label={ui(lang, 'restart')} tone="cream" style={{ flex: 1 }} onPress={start} />
              {started && !finished ? (
                <PrimaryButton label={ui(lang, 'finish')} tone="blue" style={{ flex: 1 }} onPress={finishInterview} />
              ) : null}
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    alignItems: 'center',
    paddingTop: spacing.md,
    gap: 4,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.brown,
  },
  chat: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  chatContent: {
    gap: 10,
    paddingVertical: spacing.md,
  },
  bubble: {
    maxWidth: '88%',
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  coach: {
    alignSelf: 'flex-start',
    backgroundColor: colors.mutedBlue,
  },
  you: {
    alignSelf: 'flex-end',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.mutedBlue,
  },
  bubbleText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  controls: {
    padding: spacing.lg,
    gap: 10,
  },
  langRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  langBtn: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.mutedBlue,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langBtnOn: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  langBtnText: {
    fontFamily: fonts.sansSemibold,
    fontSize: 13,
    color: colors.brown,
  },
  langBtnTextOn: {
    color: colors.ink,
  },
  status: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.prototype,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.mutedBlue,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.sans,
    color: colors.brown,
  },
  send: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: colors.blue,
    justifyContent: 'center',
  },
  sendText: {
    fontFamily: fonts.sansSemibold,
    color: colors.brown,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
});
