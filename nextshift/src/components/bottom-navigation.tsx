import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '@/theme/tokens';

const TABS = [
  { name: 'index', label: 'Home', icon: 'home-outline', iconOn: 'home' },
  { name: 'jobs', label: 'Jobs', icon: 'briefcase-outline', iconOn: 'briefcase' },
  { name: 'resources', label: 'Resources', icon: 'grid-outline', iconOn: 'grid' },
  { name: 'prepare', label: 'Prepare', icon: 'school-outline', iconOn: 'school' },
  { name: 'profile', label: 'Profile', icon: 'person-outline', iconOn: 'person' },
] as const;

type BottomNavigationProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
};

export function BottomNavigation({ state, navigation }: BottomNavigationProps) {
  const insets = useSafeAreaInsets();
  const current = state.routes[state.index]?.name ?? 'index';

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab) => {
        const active = current === tab.name;
        return (
          <Pressable
            key={tab.name}
            onPress={() => navigation.navigate(tab.name)}
            style={styles.item}
            accessibilityRole="button"
            accessibilityLabel={tab.label}>
            <Ionicons
              name={active ? tab.iconOn : tab.icon}
              size={22}
              color={colors.cream}
            />
            <Text style={[styles.label, active && styles.activeLabel]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.blue,
    flexDirection: 'row',
    paddingTop: 10,
    paddingHorizontal: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.cream,
    opacity: 0.9,
  },
  activeLabel: {
    fontFamily: fonts.sansSemibold,
    opacity: 1,
  },
});
