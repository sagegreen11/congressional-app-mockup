import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme/tokens';

export function Logo() {
  return (
    <View style={styles.row}>
      <View style={styles.mark}>
        <View style={styles.peak} />
      </View>
      <Text style={styles.word}>nextshift</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mark: {
    width: 18,
    height: 16,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  peak: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 13,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.brown,
  },
  word: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.brown,
    letterSpacing: 0.3,
  },
});
