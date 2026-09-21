import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrototypeNote } from '@/components/prototype-note';
import { ResourceCard } from '@/components/resource-card';
import { Screen } from '@/components/screen';
import { SearchBar } from '@/components/search-bar';
import { categoryCopy, resources, type ResourceCategory } from '@/data/resources';
import { colors, fonts, spacing } from '@/theme/tokens';

export default function ResourceListScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: ResourceCategory }>();
  const [query, setQuery] = useState('');
  const meta = categoryCopy[category];

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((resource) => {
      if (resource.category !== category) return false;
      if (!q) return true;
      return `${resource.name} ${resource.city} ${resource.description}`.toLowerCase().includes(q);
    });
  }, [category, query]);

  if (!meta) {
    return (
      <Screen>
        <Text style={styles.missing}>That resource group is not in this prototype.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.top}>
        <Text style={styles.title}>{meta.title}</Text>
        <Ionicons name={meta.icon} size={28} color={colors.brown} />
        <SearchBar value={query} onChangeText={setQuery} />
        <PrototypeNote />
      </View>
      <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent}>
        {items.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onDirections={() =>
              router.push({
                pathname: '/directions',
                params: { name: resource.name, address: resource.address },
              })
            }
          />
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 30,
    lineHeight: 36,
    color: colors.brown,
    textAlign: 'center',
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.brown,
  },
  sheetContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  missing: {
    fontFamily: fonts.sans,
    color: colors.brown,
    padding: spacing.lg,
  },
});
