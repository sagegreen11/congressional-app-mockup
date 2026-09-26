import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { JobCard } from '@/components/job-card';
import { MapPreview } from '@/components/map-preview';
import { PrototypeNote } from '@/components/prototype-note';
import { Screen } from '@/components/screen';
import { SearchBar } from '@/components/search-bar';
import { useSaved } from '@/context/saved-context';
import { jobs } from '@/data/jobs';
import { colors, fonts, spacing } from '@/theme/tokens';

export default function JobsScreen() {
  const router = useRouter();
  const { isSaved, toggleJob } = useSaved();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((job) =>
      `${job.title} ${job.employer} ${job.city}`.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>nextshift</Text>
        <Text style={styles.title}>Jobs Near You</Text>
        <SearchBar value={query} onChangeText={setQuery} placeholder="search towns or roles" />
        <MapPreview label="Bergen County jobs" query="Bergen County, NJ" />
        <PrototypeNote text="Listings are sample postings for this prototype." />
        <View style={styles.list}>
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              saved={isSaved(job.id)}
              onSave={() => toggleJob(job.id)}
              onPress={() => router.push(`/jobs/${job.id}`)}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  kicker: {
    fontFamily: fonts.serifItalic,
    fontSize: 16,
    color: colors.brown,
    textAlign: 'center',
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.brown,
    textAlign: 'center',
    marginBottom: 4,
  },
  list: {
    gap: spacing.sm,
  },
});
