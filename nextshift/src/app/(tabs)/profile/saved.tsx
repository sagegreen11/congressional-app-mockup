import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { JobCard } from '@/components/job-card';
import { Screen } from '@/components/screen';
import { useSaved } from '@/context/saved-context';
import { jobs } from '@/data/jobs';
import { colors, fonts, spacing } from '@/theme/tokens';

export default function SavedJobsScreen() {
  const router = useRouter();
  const { savedJobIds, isSaved, toggleJob } = useSaved();
  const saved = jobs.filter((job) => savedJobIds.includes(job.id));

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Saved Jobs</Text>
        {saved.length === 0 ? (
          <Text style={styles.empty}>No saved postings yet. Bookmark a job from the Jobs tab.</Text>
        ) : (
          <View style={styles.list}>
            {saved.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                saved={isSaved(job.id)}
                onSave={() => toggleJob(job.id)}
                onPress={() => router.push(`/jobs/${job.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.brown,
    textAlign: 'center',
  },
  empty: {
    fontFamily: fonts.sans,
    color: colors.ink,
    textAlign: 'center',
  },
  list: {
    gap: spacing.sm,
  },
});
