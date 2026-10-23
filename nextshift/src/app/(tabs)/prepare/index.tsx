import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { CategoryCard } from '@/components/category-card';
import { Screen } from '@/components/screen';
import { ShoeMark } from '@/components/shoe-mark';
import { colors, fonts, spacing } from '@/theme/tokens';

const items = [
  { href: '/prepare/interview', title: 'Interview AI', icon: 'chatbubbles-outline' as const },
  { href: '/prepare/resume', title: 'Resume Assistant', icon: 'document-text-outline' as const },
  { href: '/prepare/videos', title: 'Prep Videos', icon: 'play-outline' as const },
  { href: '/prepare/walkthrough', title: 'Application Walkthrough', icon: 'list-outline' as const },
  { href: '/prepare/typing', title: 'Typing Practice', icon: 'keypad-outline' as const },
];

export default function PrepareScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.top}>
        <ShoeMark width={120} height={84} />
        <Text style={styles.title}>Prepare</Text>
        <Text style={styles.lede}>Practice, paperwork, and first-week confidence — all still on-device for this prototype.</Text>
      </View>
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.href} style={styles.cell}>
            <CategoryCard title={item.title} icon={item.icon} onPress={() => router.push(item.href)} />
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: 8,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 36,
    color: colors.brown,
  },
  lede: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  cell: {
    width: '47%',
    flexGrow: 1,
  },
});
