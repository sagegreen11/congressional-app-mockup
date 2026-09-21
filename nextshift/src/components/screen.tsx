import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Header } from '@/components/header';
import { colors } from '@/theme/tokens';

type ScreenProps = {
  children: ReactNode;
  right?: ReactNode;
};

export function Screen({ children, right }: ScreenProps) {
  return (
    <View style={styles.root}>
      <Header right={right} />
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  body: {
    flex: 1,
  },
});
