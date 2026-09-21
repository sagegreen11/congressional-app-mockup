import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii } from '@/theme/tokens';

type MapPreviewProps = {
  label?: string;
  tall?: boolean;
};

export function MapPreview({ label = 'Bergen County area · map placeholder', tall }: MapPreviewProps) {
  return (
    <View style={[styles.map, tall && styles.tall]}>
      <View style={[styles.road, styles.h1]} />
      <View style={[styles.road, styles.h2]} />
      <View style={[styles.road, styles.v1]} />
      <View style={[styles.road, styles.v2]} />
      <View style={styles.water} />
      <View style={styles.pin} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 148,
    borderRadius: radii.md,
    backgroundColor: colors.mutedBlue,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  tall: {
    height: 220,
  },
  road: {
    position: 'absolute',
    backgroundColor: colors.cream,
    opacity: 0.55,
  },
  h1: {
    top: 42,
    left: 0,
    right: 0,
    height: 6,
  },
  h2: {
    top: 96,
    left: 20,
    right: 8,
    height: 4,
  },
  v1: {
    top: 0,
    bottom: 0,
    left: '28%',
    width: 5,
  },
  v2: {
    top: 18,
    bottom: 24,
    left: '62%',
    width: 4,
  },
  water: {
    position: 'absolute',
    right: 12,
    top: 18,
    width: 70,
    height: 54,
    borderRadius: 40,
    backgroundColor: colors.blue,
    opacity: 0.9,
  },
  pin: {
    position: 'absolute',
    left: '46%',
    top: 58,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.brown,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.brown,
    backgroundColor: colors.cream,
    alignSelf: 'flex-start',
    margin: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
});
