import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { ShoeMark } from '@/components/shoe-mark';
import {
  buildInterviewReview,
  nextInterviewerLine,
  OPENING_QUESTION,
  type InterviewTurn,
} from '@/lib/interview-engine';
import {
  canListen,
  listenOnce,
  requestMicrophone,
  speakAloud,
  stopListening,
  stopSpeaking,
} from '@/lib/interview-voice';
import { colors, fonts, radii, spacing } from '@/theme/tokens';

type Message = { id: string; from: 'coach' | 'you'; text: string };
type Phase = 'idle' | 'speaking' | 'listening' | 'thinking' | 'done';

export default function InterviewScreen() {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [draft, setDraft] = useState('');
  const [partial, setPartial] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [status, setStatus] = useState('When you are ready, start a short practice interview for an entry-level role.');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm0',
      from: 'coach',
      text: 'When you are ready, start a short practice interview for an entry-level role.',
    },
  ]);

  const sessionRef = useRef(0);
  const turnsRef = useRef<InterviewTurn[]>([]);
  const finishedRef = useRef(false);
  const messagesRef = useRef(messages);
  const scrollRef = useRef<ScrollView>(null);
  messagesRef.current = messages;

  useEffect(() => {
    return () => {
      sessionRef.current += 1;
      stopListening();
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, partial, status]);

  const toTurns = (list: Message[]): InterviewTurn[] =>
    list
      .filter((message) => message.id !== 'm0')
      .map((message) => ({
        role: message.from === 'coach' ? 'interviewer' : 'candidate',
        text: message.text,
      }));

  const speakThenListen = async (session: number, question: string) => {
    setPhase('speaking');
    setStatus('The interviewer is speaking.');
    await speakAloud(question);
    if (session !== sessionRef.current) return;
    await captureAnswer(session);
  };

  const captureAnswer = async (session: number) => {
    if (!canListen()) {
      setPhase('listening');
      setStatus('Voice listening needs the web app in Chrome or Edge. You can also type your answer.');
      return;
    }
    setPhase('listening');
    setPartial('');
    setStatus('Your turn — speak your answer.');
    try {
      const heard = await listenOnce((text) => {
        if (session === sessionRef.current) setPartial(text);
      });
      if (session !== sessionRef.current) return;
      setPartial('');
      if (!heard) {
        setStatus('I did not catch that. Tap Speak and try again, or type your answer.');
        setPhase('listening');
        return;
      }
      await handleCandidateText(session, heard);
    } catch {
      if (session !== sessionRef.current) return;
      setPartial('');
      setPhase('listening');
      setStatus('Microphone was blocked or unavailable. Allow the mic, tap Speak, or type your answer.');
    }
  };

  const handleCandidateText = async (session: number, text: string) => {
    const trimmed = text.trim();
    if (!trimmed || finishedRef.current) return;

    setPhase('thinking');
    setStatus('Listening to what you said and preparing a follow-up.');
    const you: Message = { id: `a-${Date.now()}`, from: 'you', text: trimmed };
    const withYou = [...messagesRef.current.filter((message) => message.id !== 'm0'), you];
    turnsRef.current = [...turnsRef.current, { role: 'candidate', text: trimmed }];
    const next = nextInterviewerLine(turnsRef.current);

    if (next.kind === 'complete') {
      finishedRef.current = true;
      setMessages([...withYou, { id: 'review', from: 'coach', text: next.text }]);
      setFinished(true);
      setStarted(true);
      setPhase('done');
      setStatus('Interview complete. Read the overview below.');
      setDraft('');
      await speakAloud('Thank you. I put a written overview of this interview on the screen.');
      return;
    }

    turnsRef.current = [
      ...turnsRef.current,
      { role: 'interviewer', text: next.text, themeId: next.themeId },
    ];
    setMessages([...withYou, { id: `q-${Date.now()}`, from: 'coach', text: next.text }]);
    setDraft('');
    if (session !== sessionRef.current) return;
    await speakThenListen(session, next.text);
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
    const opening: Message = { id: 'q-0', from: 'coach', text: OPENING_QUESTION };
    setMessages([opening]);
    turnsRef.current = [{ role: 'interviewer', text: OPENING_QUESTION }];
    const mic = requestMicrophone().catch(() => {
      if (session === sessionRef.current) {
        setStatus('Allow the microphone to speak your answers, or type them.');
      }
    });
    if (session !== sessionRef.current) return;
    await speakThenListen(session, OPENING_QUESTION);
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
    const review = buildInterviewReview(turnsRef.current.length ? turnsRef.current : toTurns(messagesRef.current));
    setMessages((current) => [
      ...current.filter((message) => message.id !== 'm0'),
      { id: 'review', from: 'coach', text: review },
    ]);
    setFinished(true);
    setPhase('done');
    setStatus('Interview complete. Read the overview below.');
    await speakAloud('Thank you. I put a written overview of this interview on the screen.');
  };

  return (
    <Screen>
      <View style={styles.top}>
        <ShoeMark width={110} height={78} />
        <Text style={styles.title}>Interview AI</Text>
      </View>
      <ScrollView ref={scrollRef} style={styles.chat} contentContainerStyle={styles.chatContent}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[styles.bubble, message.from === 'you' ? styles.you : styles.coach]}>
            <Text style={styles.bubbleText}>{message.text}</Text>
          </View>
        ))}
        {partial ? (
          <View style={[styles.bubble, styles.you]}>
            <Text style={styles.bubbleText}>{partial}</Text>
          </View>
        ) : null}
      </ScrollView>
      <View style={styles.controls}>
        <Text style={styles.status}>{status}</Text>
        {!started ? (
          <PrimaryButton label="Start" onPress={start} />
        ) : (
          <>
            <View style={styles.inputRow}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Type an answer"
                placeholderTextColor={colors.prototype}
                style={styles.input}
                editable={!finished}
              />
              <Pressable onPress={submitTyped} style={styles.send} disabled={finished}>
                <Text style={styles.sendText}>Send</Text>
              </Pressable>
            </View>
            <PrimaryButton
              label={phase === 'listening' ? 'Listening...' : 'Speak'}
              onPress={onSpeakPress}
              disabled={finished || phase === 'speaking' || phase === 'thinking'}
            />
            <View style={styles.row}>
              <PrimaryButton label="Restart" tone="cream" style={{ flex: 1 }} onPress={start} />
              {started && !finished ? (
                <PrimaryButton label="Finish" tone="blue" style={{ flex: 1 }} onPress={finishInterview} />
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
