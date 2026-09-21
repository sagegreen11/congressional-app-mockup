import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/logo';
import { colors, spacing } from '@/theme/tokens';

type HeaderProps = {
  right?: ReactNode;
};

export function Header({ right }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingTop: Math.max(insets.top, 12) }]}>
      <Logo />
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.blue,
    paddingHorizontal: spacing.lg,
    paddingBottom: 14,
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
});
