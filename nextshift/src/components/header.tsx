import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/logo';
import { colors, spacing } from '@/theme/tokens';

type HeaderProps = {
  right?: ReactNode;
};

export function Header({ right }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  };

  return (
    <View style={[styles.bar, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.left}>
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.cream} />
        </Pressable>
        <Logo />
      </View>
      {right ?? <View style={styles.rightSpacer} />}
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
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  back: {
    width: 32,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSpacer: {
    width: 32,
    height: 28,
  },
});
