import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { colors, fonts, radii, spacing } from '@/theme/tokens';

type PrimaryButtonProps = PressableProps & {
  label: string;
  tone?: 'brown' | 'blue' | 'cream';
};

export function PrimaryButton({ label, tone = 'brown', style, ...rest }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={(state) => [
        styles.base,
        tone === 'brown' && styles.brown,
        tone === 'blue' && styles.blue,
        tone === 'cream' && styles.cream,
        state.pressed && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      <Text style={[styles.label, tone === 'cream' && styles.creamLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brown: {
    backgroundColor: colors.brown,
  },
  blue: {
    backgroundColor: colors.blue,
  },
  cream: {
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.brown,
  },
  pressed: {
    opacity: 0.82,
  },
  label: {
    fontFamily: fonts.sansSemibold,
    fontSize: 15,
    color: colors.cream,
  },
  creamLabel: {
    color: colors.brown,
  },
});
