import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { CategoryCard } from '@/components/category-card';
import { Screen } from '@/components/screen';
import { ShoeMark } from '@/components/shoe-mark';
import { resourceCategories } from '@/data/resources';
import { colors, fonts, spacing } from '@/theme/tokens';

export default function ResourcesScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.top}>
        <ShoeMark width={120} height={84} />
        <Text style={styles.title}>Resources</Text>
      </View>
      <View style={styles.grid}>
        {resourceCategories.map((category) => (
          <View key={category.id} style={styles.cell}>
            <CategoryCard
              title={category.title}
              icon={category.icon}
              onPress={() => router.push(`/resources/${category.id}`)}
            />
          </View>
        ))}
      </View>
      <View style={[styles.wedge, { pointerEvents: 'none' }]} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: 4,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 36,
    color: colors.brown,
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
  wedge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    borderTopWidth: 120,
    borderTopColor: 'transparent',
    borderRightWidth: 160,
    borderRightColor: colors.brown,
  },
});
