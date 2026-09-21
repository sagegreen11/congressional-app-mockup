import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { MapPreview } from '@/components/map-preview';
import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { SearchBar } from '@/components/search-bar';
import { colors, fonts, radii, spacing } from '@/theme/tokens';

export default function DirectionsScreen() {
  const { name, address } = useLocalSearchParams<{ name?: string; address?: string }>();
  const destination = name || 'Hackensack, NJ';
  const line = address || 'Bergen County prototype destination';

  return (
    <Screen>
      <View style={styles.content}>
        <Text style={styles.title}>How to get there?</Text>
        <SearchBar value={destination} onChangeText={() => {}} placeholder="destination" />
        <Text style={styles.address}>{line}</Text>
        <View style={styles.modes}>
          <Mode label="walk" value="18 min" />
          <Mode label="bus" value="12 min" />
          <Mode label="train" value="22 min" />
        </View>
        <MapPreview tall label="Transit preview · Google Maps later" />
        <PrimaryButton label="Open Directions" onPress={() => {}} />
        <Text style={styles.note}>Times are placeholders. Live routing is not connected yet.</Text>
      </View>
    </Screen>
  );
}

function Mode({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.mode}>
      <Text style={styles.modeLabel}>{label}</Text>
      <Text style={styles.modeValue}>{value}</Text>
    </View>
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
