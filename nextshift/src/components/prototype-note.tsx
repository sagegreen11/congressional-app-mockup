import { StyleSheet, Text } from 'react-native';

import { colors, fonts } from '@/theme/tokens';

export function PrototypeNote({ text = 'Prototype data for Bergen County walkthroughs.' }: { text?: string }) {
  return <Text style={styles.note}>{text}</Text>;
}

const styles = StyleSheet.create({
  note: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.prototype,
    textAlign: 'center',
  },
});
