import { type ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { colors } from '@/theme/tokens';

export function PhoneShell({ children }: { children: ReactNode }) {
  if (Platform.OS !== 'web') {
    return <View style={styles.fill}>{children}</View>;
  }

  return (
    <View style={styles.page}>
      <View style={styles.phone}>
        <View style={styles.fill}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  page: {
    flex: 1,
    backgroundColor: '#DDD6C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phone: {
    width: 390,
    height: 844,
    maxWidth: '100%',
    maxHeight: '100%',
    backgroundColor: colors.cream,
    overflow: 'hidden',
    flexDirection: 'column',
  },
});
