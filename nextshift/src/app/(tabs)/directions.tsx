import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { MapPreview } from '@/components/map-preview';
import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { SearchBar } from '@/components/search-bar';
import { googleDirectionsAppUrl, type TravelMode } from '@/lib/google-maps';
import { colors, fonts, radii, spacing } from '@/theme/tokens';

const MODE_TIMES: Record<TravelMode, string> = {
  walk: '18 min',
  bus: '12 min',
  train: '22 min',
};

export default function DirectionsScreen() {
  const { name, address } = useLocalSearchParams<{ name?: string; address?: string }>();
  const [destination, setDestination] = useState(name || 'Hackensack, NJ');
  const [mode, setMode] = useState<TravelMode>('bus');
  const line = address || 'Bergen County, NJ';
  const query = address || destination || line;

  return (
    <Screen>
      <View style={styles.content}>
        <Text style={styles.title}>How to get there?</Text>
        <SearchBar value={destination} onChangeText={setDestination} placeholder="destination" />
        <Text style={styles.address}>{line}</Text>
        <View style={styles.modes}>
          {(['walk', 'bus', 'train'] as const).map((item) => (
            <Mode
              key={item}
              label={item}
              value={MODE_TIMES[item]}
              selected={mode === item}
              onPress={() => setMode(item)}
            />
          ))}
        </View>
        <MapPreview tall query={query} directions mode={mode} label="Google Maps" />
        <PrimaryButton
          label="Open Directions"
          onPress={() => Linking.openURL(googleDirectionsAppUrl(address || destination, mode))}
        />
        <Text style={styles.note}>Live Google Maps directions from your current location.</Text>
      </View>
    </Screen>
  );
}

function Mode({
  label,
  value,
  selected,
  onPress,
}: {
  label: string;
  value: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }} style={[styles.mode, selected && styles.modeSelected]}>
      <Text style={styles.modeLabel}>{label}</Text>
      <Text style={styles.modeValue}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    flex: 1,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.brown,
    textAlign: 'center',
  },
  address: {
    fontFamily: fonts.sans,
    color: colors.ink,
    textAlign: 'center',
  },
  modes: {
    flexDirection: 'row',
    gap: 8,
  },
  mode: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.mutedBlue,
  },
  modeSelected: {
    backgroundColor: colors.mutedBlue,
    borderColor: colors.brown,
  },
  modeLabel: {
    fontFamily: fonts.serifItalic,
    fontSize: 14,
    color: colors.brown,
  },
  modeValue: {
    fontFamily: fonts.sansSemibold,
    fontSize: 13,
    color: colors.ink,
    marginTop: 2,
  },
  note: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.prototype,
    textAlign: 'center',
  },
});
