export const colors = {
  blue: '#8BB8CA',
  cream: '#F7F2E8',
  brown: '#68452F',
  mutedBlue: '#9DBECB',
  white: '#FFFBF6',
  ink: '#3F2A1C',
  prototype: '#8A6A54',
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

export const fonts = {
  serif: 'PlayfairDisplay_600SemiBold',
  serifRegular: 'PlayfairDisplay_500Medium',
  serifItalic: 'PlayfairDisplay_400Regular_Italic',
  sans: 'DMSans_400Regular',
  sansMedium: 'DMSans_500Medium',
  sansSemibold: 'DMSans_600SemiBold',
} as const;

export const type = {
  hero: {
    fontFamily: fonts.serif,
    fontSize: 42,
    lineHeight: 46,
    color: colors.brown,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 32,
    lineHeight: 38,
    color: colors.brown,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    lineHeight: 28,
    color: colors.brown,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },
  ui: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.brown,
  },
  label: {
    fontFamily: fonts.sansSemibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
    color: colors.brown,
  },
} as const;

export const shadow = {
  card: {
    shadowColor: colors.brown,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
} as const;
