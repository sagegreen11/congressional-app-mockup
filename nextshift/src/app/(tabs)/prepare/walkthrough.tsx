import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { colors, fonts, radii, spacing } from '@/theme/tokens';

const steps = [
  {
    title: 'Read the posting twice',
    body: 'Circle the hours, the neighborhood, and one skill they repeat. That is what your first sentence should answer.',
  },
  {
    title: 'Prepare two stories',
    body: 'One about showing up. One about helping a person. Keep each under 45 seconds.',
  },
  {
    title: 'Apply in one sitting',
    body: 'Use the same phone number and email everywhere. Save a screenshot of the confirmation.',
  },
  {
    title: 'Plan the first commute',
    body: 'Check walking, bus, and train before you say yes. NextShift will later open live directions from here.',
  },
];

export default function WalkthroughScreen() {
  const [step, setStep] = useState(0);
  const current = steps[step];

  return (
    <Screen>
      <View style={styles.body}>
        <Text style={styles.kicker}>
          Step {step + 1} of {steps.length}
        </Text>
        <Text style={styles.title}>Application Walkthrough</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{current.title}</Text>
          <Text style={styles.cardBody}>{current.body}</Text>
        </View>
        <View style={styles.row}>
          <PrimaryButton
            label="Back"
            tone="cream"
            style={{ flex: 1 }}
            onPress={() => setStep((value) => Math.max(0, value - 1))}
          />
          <PrimaryButton
            label={step === steps.length - 1 ? 'Done' : 'Next'}
            style={{ flex: 1 }}
            onPress={() => setStep((value) => Math.min(steps.length - 1, value + 1))}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  kicker: {
    fontFamily: fonts.sansMedium,
    color: colors.brown,
    textAlign: 'center',
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 30,
    color: colors.brown,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.mutedBlue,
    borderRadius: radii.md,
    padding: spacing.lg,
    minHeight: 180,
    gap: 10,
  },
  cardTitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.brown,
  },
  cardBody: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    color: colors.ink,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 'auto',
  },
});
