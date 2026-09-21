import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { useSaved } from '@/context/saved-context';
import { jobs } from '@/data/jobs';
import { colors, fonts, radii, spacing } from '@/theme/tokens';

const rows = [
  { label: 'Saved Jobs', href: '/profile/saved' },
  { label: 'Applications', href: '/profile/applications' },
  { label: 'Resume', href: '/prepare/resume' },
  { label: 'Notifications', href: '/notifications' },
  { label: 'Settings', href: '/profile/settings' },
  { label: 'Privacy', href: '/profile/privacy' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { savedJobIds } = useSaved();
  const savedCount = jobs.filter((job) => savedJobIds.includes(job.id)).length;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.lede}>Bergen County · prototype account</Text>
        <View style={styles.card}>
          <Text style={styles.name}>Alex Rivera</Text>
          <Text style={styles.meta}>{savedCount} saved jobs</Text>
        </View>
        <View style={styles.list}>
          {rows.map((row) => (
            <Pressable
              key={row.label}
              onPress={() => router.push(row.href)}
              accessibilityRole="button"
              accessibilityLabel={row.label}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.brown} />
            </Pressable>
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
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 36,
    color: colors.brown,
    textAlign: 'center',
  },
  lede: {
    fontFamily: fonts.sans,
    textAlign: 'center',
    color: colors.ink,
  },
  card: {
    backgroundColor: colors.mutedBlue,
    borderRadius: radii.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.brown,
  },
  meta: {
    fontFamily: fonts.sans,
    color: colors.ink,
  },
  list: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  row: {
    minHeight: 54,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.mutedBlue,
  },
  pressed: {
    backgroundColor: colors.cream,
  },
  rowLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    color: colors.brown,
  },
});
