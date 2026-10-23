import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import {
  TYPING_DURATIONS,
  applyTypedValue,
  createTypingState,
  loadNewSentence,
  passageMarks,
  remainingSec,
  tickTyping,
  typingMetrics,
  type TypingDuration,
  type TypingState,
} from '@/lib/typing-engine';
import { colors, fonts, radii, spacing } from '@/theme/tokens';

export default function TypingPracticeScreen() {
  const inputRef = useRef<TextInput>(null);
  const [now, setNow] = useState(() => Date.now());
  const [session, setSession] = useState<TypingState>(() => createTypingState(30));

  useEffect(() => {
    if (!session.startedAt || session.finished) return;
    const id = setInterval(() => {
      const stamp = Date.now();
      setNow(stamp);
      setSession((current) => tickTyping(current, stamp));
    }, 100);
    return () => clearInterval(id);
  }, [session.startedAt, session.finished]);

  const marks = passageMarks(session);
  const metrics = typingMetrics(session, now);
  const left = Math.ceil(remainingSec(session, now));

  const restart = (duration: TypingDuration = session.duration) => {
    setSession(createTypingState(duration));
    setNow(Date.now());
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
          automaticallyAdjustKeyboardInsets>
          <Text style={styles.title}>Typing Practice</Text>
          <Text style={styles.lede}>Type the sentence as accurately and quickly as you can.</Text>

          <View style={styles.durations} accessibilityRole="radiogroup">
            {TYPING_DURATIONS.map((item) => {
              return (
                <Pressable
                  key={item}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: session.duration === item }}
                  accessibilityLabel={`${item} seconds`}
                  disabled={Boolean(session.startedAt) && !session.finished}
                  onPress={() => restart(item)}
                  style={[styles.duration, session.duration === item && styles.durationOn]}>
                  <Text style={[styles.durationText, session.duration === item && styles.durationTextOn]}>
                    {item}s
                  </Text>
                </Pressable>
              );
            })}
            <View style={styles.timerChip} accessibilityLiveRegion="polite">
              <Text style={styles.timerLabel}>{session.finished ? 'Done' : `${left}s`}</Text>
            </View>
          </View>

          {session.finished ? (
            <View style={styles.results} accessibilityRole="summary">
              <Text style={styles.resultsTitle}>Session results</Text>
              <Text style={styles.metric}>WPM {metrics.wpm}</Text>
              <Text style={styles.metric}>Accuracy {metrics.accuracy}%</Text>
              <Text style={styles.detail}>
                {metrics.correct} correct · {metrics.incorrect} incorrect · {metrics.elapsedSec}s elapsed
              </Text>
              <Text style={styles.formula}>
                WPM is typed characters / 5 / minutes. Accuracy is correct characters / typed characters.
              </Text>
              <PrimaryButton label="Practice again" onPress={() => restart()} />
            </View>
          ) : (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Focus typing area"
                onPress={() => inputRef.current?.focus()}
                style={styles.passageWrap}>
                <Text style={styles.passage} accessibilityLabel={session.target}>
                  {marks.map((mark, index) => (
                    <Text
                      key={`${mark.char}-${index}`}
                      style={[
                        styles.char,
                        mark.state === 'pending' && styles.pending,
                        mark.state === 'correct' && styles.correct,
                        mark.state === 'incorrect' && styles.incorrect,
                        mark.state === 'active' && styles.active,
                      ]}>
                      {mark.char === ' ' ? '\u00A0' : mark.char}
                    </Text>
                  ))}
                </Text>
              </Pressable>

              <TextInput
                ref={inputRef}
                value={session.typed}
                onChangeText={(value) => {
                  const stamp = Date.now();
                  setNow(stamp);
                  setSession((current) => applyTypedValue(current, value, stamp));
                }}
                autoFocus
                autoCorrect={false}
                autoCapitalize="none"
                autoComplete="off"
                spellCheck={false}
                blurOnSubmit={false}
                importantForAutofill="no"
                accessibilityLabel="Type the sentence shown above"
                placeholder="Tap here and start typing"
                placeholderTextColor={colors.prototype}
                style={styles.input}
              />
            </>
          )}

          <View style={styles.row}>
            <PrimaryButton label="Restart" tone="cream" style={styles.flexBtn} onPress={() => restart()} />
            <PrimaryButton
              label="New sentence"
              tone="blue"
              style={styles.flexBtn}
              onPress={() => {
                setSession((current) => loadNewSentence(current));
                inputRef.current?.focus();
              }}
              disabled={session.finished}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.brown,
    textAlign: 'center',
  },
  lede: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
    textAlign: 'center',
  },
  durations: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  duration: {
    minWidth: 52,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.mutedBlue,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationOn: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  durationText: {
    fontFamily: fonts.sansSemibold,
    fontSize: 13,
    color: colors.brown,
  },
  durationTextOn: {
    color: colors.ink,
  },
  timerChip: {
    minWidth: 52,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerLabel: {
    fontFamily: fonts.sansSemibold,
    fontSize: 13,
    color: colors.cream,
  },
  passageWrap: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.mutedBlue,
    padding: spacing.lg,
    minHeight: 140,
    justifyContent: 'center',
  },
  passage: {
    fontFamily: fonts.sans,
    fontSize: 22,
    lineHeight: 34,
    color: colors.ink,
  },
  char: {
    fontFamily: fonts.sans,
    fontSize: 22,
    lineHeight: 34,
  },
  pending: {
    color: colors.prototype,
  },
  correct: {
    color: colors.ink,
    fontFamily: fonts.sansSemibold,
    textDecorationLine: 'underline',
    textDecorationColor: colors.mutedBlue,
  },
  incorrect: {
    color: colors.brown,
    textDecorationLine: 'line-through',
    backgroundColor: colors.cream,
  },
  active: {
    color: colors.brown,
    backgroundColor: colors.mutedBlue,
    textDecorationLine: 'underline',
    textDecorationColor: colors.brown,
  },
  input: {
    minHeight: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.mutedBlue,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.brown,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flexBtn: {
    flex: 1,
  },
  results: {
    backgroundColor: colors.mutedBlue,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: 8,
  },
  resultsTitle: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.brown,
  },
  metric: {
    fontFamily: fonts.sansSemibold,
    fontSize: 18,
    color: colors.ink,
  },
  detail: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  formula: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 18,
    color: colors.prototype,
    marginBottom: 8,
  },
});
