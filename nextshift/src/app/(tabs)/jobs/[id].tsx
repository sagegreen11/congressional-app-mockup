import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { useSaved } from '@/context/saved-context';
import { jobs } from '@/data/jobs';
import { colors, fonts, radii, spacing } from '@/theme/tokens';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isSaved, toggleJob } = useSaved();
  const job = jobs.find((item) => item.id === id);

  if (!job) {
    return (
      <Screen>
        <Text style={styles.missing}>This posting is no longer in the prototype set.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>{job.city}</Text>
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.employer}>{job.employer}</Text>
        <View style={styles.panel}>
          <Text style={styles.body}>{job.summary}</Text>
          <Text style={styles.meta}>{job.location}</Text>
          <Text style={styles.meta}>{job.pay} · {job.type}</Text>
          <Text style={styles.meta}>{job.transit}</Text>
          {job.entryLevel ? <Text style={styles.badge}>Entry-level</Text> : null}
          <Text style={styles.prototype}>Prototype posting · not a live job listing</Text>
        </View>
        <PrimaryButton
          label={isSaved(job.id) ? 'Saved' : 'Save job'}
          tone="cream"
          onPress={() => toggleJob(job.id)}
        />
        <PrimaryButton
          label="How to get there"
          onPress={() =>
            router.push({
              pathname: '/directions',
              params: { name: job.employer, address: job.location },
            })
          }
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  missing: {
    fontFamily: fonts.sans,
    color: colors.brown,
    padding: spacing.lg,
  },
  kicker: {
    fontFamily: fonts.sansMedium,
    color: colors.brown,
    textAlign: 'center',
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.brown,
    textAlign: 'center',
  },
  employer: {
    fontFamily: fonts.sansSemibold,
    fontSize: 16,
    color: colors.ink,
    textAlign: 'center',
  },
  panel: {
    backgroundColor: colors.mutedBlue,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: 8,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.brown,
  },
  badge: {
    fontFamily: fonts.sansSemibold,
    fontSize: 12,
    color: colors.brown,
    marginTop: 4,
  },
  prototype: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.prototype,
    marginTop: 8,
  },
});
