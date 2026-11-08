import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { ShoeMark } from '@/components/shoe-mark';
import { AiClientError, requestCoachReply, requestSpeech, type CoachTurn } from '@/lib/ai-client';
import { INTERVIEW_LANGS, speechCode, ui, type InterviewLang, type InterviewUiKey } from '@/lib/interview-locale';
import {
  canListen,
  listenOnce,
  playAnswer,
  requestMicrophone,
  stopListening,
  stopSpeaking,
} from '@/lib/interview-voice';
import { colors, fonts, radii, spacing } from '@/theme/tokens';

type Message = { id: string; from: 'coach' | 'you'; text: string };
type Phase = 'idle' | 'speaking' | 'listening' | 'thinking' | 'done';
type StatusKey = Extract<
  InterviewUiKey,
  | 'ready'
  | 'speaking'
  | 'needWeb'
  | 'yourTurn'
  | 'missed'
  | 'micBlocked'
  | 'thinking'
  | 'complete'
  | 'allowMic'
  | 'preparing'
  | 'coachUnavailable'
  | 'audioUnavailable'
  | 'rateLimited'
  | 'missingKey'
  | 'invalidKey'
  | 'modelUnavailable'
>;

function newConversationId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `c-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function statusFor(error: unknown): StatusKey {
  if (!(error instanceof AiClientError)) return 'coachUnavailable';
  if (error.code === 'rate_limited') return 'rateLimited';
  if (error.code === 'missing_key') return 'missingKey';
  if (error.code === 'invalid_key') return 'invalidKey';
  if (error.code === 'model_unavailable') return 'modelUnavailable';
  if (error.code === 'empty') return 'missed';
  return 'coachUnavailable';
}

export default function InterviewScreen() {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [draft, setDraft] = useState('');
  const [partial, setPartial] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [statusKey, setStatusKey] = useState<StatusKey>('ready');
  const [lang, setLang] = useState<InterviewLang>('en');
  const [messages, setMessages] = useState<Message[]>([{ id: 'm0', from: 'coach', text: '' }]);

  const sessionRef = useRef(0);
  const historyRef = useRef<CoachTurn[]>([]);
  const conversationRef = useRef(newConversationId());
  const finishedRef = useRef(false);
  const sendingRef = useRef(false);
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

  const bubbleText = (message: Message) => (message.id === 'm0' ? ui(lang, 'ready') : message.text);

  const speakThenCapture = async (session: number, text: string, listenAfter: boolean) => {
    if (session !== sessionRef.current) return;

    setPhase('speaking');
    let blob: Blob | null = null;
    try {
      blob = await requestSpeech(text, langRef.current);
    } catch {
      if (session !== sessionRef.current) return;
      setStatusKey('audioUnavailable');
    }
    if (session !== sessionRef.current) return;
    if (blob) setStatusKey('speaking');
    await playAnswer(text, voiceLang(), blob);
    if (session !== sessionRef.current || !listenAfter || finishedRef.current) return;
    await captureAnswer(session);
  };

  const captureAnswer = async (session: number) => {
    if (!canListen()) {
      setPhase('idle');
      setStatusKey('needWeb');
      return;
    }
    setPhase('listening');
    setPartial('');
    setStatusKey('yourTurn');
    try {
      const transcript = (
        await listenOnce((text) => {
          if (session === sessionRef.current) setPartial(text);
        }, voiceLang())
      ).trim();
      if (session !== sessionRef.current) return;
      setPartial('');
      if (!transcript) {
        setStatusKey('missed');
        setPhase('idle');
        return;
      }
      await handleCandidateText(session, transcript);
    } catch {
      if (session !== sessionRef.current) return;
      setPartial('');
      setPhase('idle');
      setStatusKey('micBlocked');
    }
  };

  const handleCandidateText = async (session: number, text: string) => {
    const trimmed = text.trim();
    if (!trimmed || finishedRef.current || sendingRef.current) return;
    sendingRef.current = true;
    setPhase('thinking');
    setStatusKey('thinking');
    const you: Message = { id: `a-${Date.now()}`, from: 'you', text: trimmed };
    setMessages([...messagesRef.current.filter((message) => message.id !== 'm0'), you]);
    try {
      const result = await requestCoachReply({
        conversationId: conversationRef.current,
        language: langRef.current,
        intent: 'message',
        message: trimmed,
        history: historyRef.current,
      });
      if (session !== sessionRef.current) return;
      historyRef.current = result.history;
      setDraft('');
      setMessages((current) => [
        ...current.filter((message) => message.id !== 'm0'),
        { id: `q-${Date.now()}`, from: 'coach', text: result.text },
      ]);
      setPhase('idle');
      sendingRef.current = false;
      await speakThenCapture(session, result.text, true);
    } catch (error) {
      if (session !== sessionRef.current) return;
      const key = statusFor(error);
      setStatusKey(key);
      setMessages((current) => [
        ...current.filter((message) => message.id !== 'm0'),
        { id: `e-${Date.now()}`, from: 'coach', text: ui(langRef.current, key) },
      ]);
      setPhase('idle');
    } finally {
      sendingRef.current = false;
    }
  };

  const start = async () => {
    sessionRef.current += 1;
    const session = sessionRef.current;
    stopListening();
    stopSpeaking();
    sendingRef.current = true;
    conversationRef.current = newConversationId();
    historyRef.current = [];
    finishedRef.current = false;
    setStarted(true);
    setFinished(false);
    setDraft('');
    setPartial('');
    setMessages([{ id: 'm0', from: 'coach', text: '' }]);
    setPhase('thinking');
    setStatusKey('preparing');
    const mic = requestMicrophone().catch(() => {
      if (session === sessionRef.current) setStatusKey('allowMic');
    });
    try {
      const result = await requestCoachReply({
        conversationId: conversationRef.current,
        language: langRef.current,
        intent: 'opening',
        history: [],
      });
      if (session !== sessionRef.current) return;
      historyRef.current = result.history;
      setMessages([{ id: 'q-0', from: 'coach', text: result.text }]);
      setPhase('idle');
      sendingRef.current = false;
      await speakThenCapture(session, result.text, true);
    } catch (error) {
      if (session !== sessionRef.current) return;
      const key = statusFor(error);
      setMessages([{ id: 'err', from: 'coach', text: ui(langRef.current, key) }]);
      setStatusKey(key);
      setPhase('idle');
    } finally {
      sendingRef.current = false;
    }
    await mic;
  };

  const submitTyped = async () => {
    if (!draft.trim() || finished || phase === 'thinking') return;
    sessionRef.current += 1;
    const session = sessionRef.current;
    stopListening();
    stopSpeaking();
    await handleCandidateText(session, draft);
  };

  const onSpeakPress = async () => {
    if (finished || phase === 'speaking' || phase === 'thinking' || phase === 'listening') return;
    const session = sessionRef.current;
    stopSpeaking();
    await captureAnswer(session);
  };

  const finishInterview = async () => {
    if (sendingRef.current) return;
    sessionRef.current += 1;
    const session = sessionRef.current;
    stopListening();
    stopSpeaking();
    sendingRef.current = true;
    setPhase('thinking');
    setStatusKey('preparing');
    try {
      const result = await requestCoachReply({
        conversationId: conversationRef.current,
        language: langRef.current,
        intent: 'review',
        history: historyRef.current,
      });
      if (session !== sessionRef.current) return;
      historyRef.current = result.history;
      finishedRef.current = true;
      setMessages((current) => [
        ...current.filter((message) => message.id !== 'm0' && message.id !== 'review'),
        { id: 'review', from: 'coach', text: result.text },
      ]);
      setFinished(true);
      setPhase('done');
      setStatusKey('complete');
      sendingRef.current = false;
      await speakThenCapture(session, result.text, false);
    } catch (error) {
      if (session !== sessionRef.current) return;
      const key = statusFor(error);
      setStatusKey(key);
      setMessages((current) => [
        ...current.filter((message) => message.id !== 'm0'),
        { id: `e-${Date.now()}`, from: 'coach', text: ui(langRef.current, key) },
      ]);
      setPhase('idle');
    } finally {
      sendingRef.current = false;
    }
  };

  const busy = phase === 'thinking';

  return (
    <Screen>
      <View style={styles.top}>
        <ShoeMark width={110} height={78} />
        <Text style={styles.title}>{ui(lang, 'title')}</Text>
      </View>
      <ScrollView ref={scrollRef} style={styles.chat} contentContainerStyle={styles.chatContent}>
        {messages.map((message) => (
          <View key={message.id} style={[styles.bubble, message.from === 'you' ? styles.you : styles.coach]}>
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
          <PrimaryButton label={ui(lang, 'start')} onPress={start} disabled={busy} />
        ) : (
          <>
            <View style={styles.inputRow}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder={ui(lang, 'typeAnswer')}
                placeholderTextColor={colors.prototype}
                style={styles.input}
                editable={!finished && !busy}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={ui(lang, 'send')}
                onPress={submitTyped}
                style={styles.send}
                disabled={finished || busy || !draft.trim()}>
                <Text style={styles.sendText}>{ui(lang, 'send')}</Text>
              </Pressable>
            </View>
            <PrimaryButton
              label={phase === 'listening' ? ui(lang, 'listening') : ui(lang, 'speak')}
              onPress={onSpeakPress}
              disabled={finished || phase === 'speaking' || busy || phase === 'listening'}
            />
            <View style={styles.row}>
              <PrimaryButton label={ui(lang, 'restart')} tone="cream" style={{ flex: 1 }} onPress={start} disabled={busy} />
              {started && !finished ? (
                <PrimaryButton label={ui(lang, 'finish')} tone="blue" style={{ flex: 1 }} onPress={finishInterview} disabled={busy} />
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
