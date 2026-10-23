import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Job } from '@/data/jobs';
import { colors, fonts, radii, spacing } from '@/theme/tokens';

type JobCardProps = {
  job: Job;
  saved: boolean;
  onPress: () => void;
  onSave: () => void;
  compact?: boolean;
};

export function JobCard({ job, saved, onPress, onSave, compact }: JobCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={job.title}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.top}>
        <Text style={styles.title}>{job.title}</Text>
        <Pressable onPress={onSave} hitSlop={8} style={styles.save}>
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color={colors.brown} />
        </Pressable>
      </View>
      <Text style={styles.employer}>{job.employer}</Text>
      <Text style={styles.meta}>{job.city}</Text>
      {!compact ? <Text style={styles.summary}>{job.summary}</Text> : null}
      <View style={styles.tags}>
        {job.entryLevel ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>Entry-level</Text>
          </View>
        ) : null}
        {job.pay ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{job.pay}</Text>
          </View>
        ) : null}
        {job.type ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{job.type}</Text>
          </View>
        ) : null}
        {job.transit ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{job.transit}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.mutedBlue,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 6,
  },
  pressed: {
    opacity: 0.88,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.brown,
  },
  save: {
    paddingTop: 2,
  },
  employer: {
    fontFamily: fonts.sansSemibold,
    fontSize: 14,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.ink,
  },
  summary: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    backgroundColor: colors.cream,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.brown,
  },
});
