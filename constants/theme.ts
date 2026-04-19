export const AppColors = {
  primary: '#1E2A5E',
  primaryHover: '#3C4F92',
  secondary: '#4CC1E9',
  white: '#FFFFFF',
  black: '#0F0F0F',
  error: '#DC2626',
  success: '#16A34A',
  surface: '#F4F4F4',
  textPrimary: '#1A1A1A',
  textSecondary: '#1E2A5E',
  border: '#C0C0C0',
};

export const Typography = {
  h1: { fontSize: 40, fontFamily: 'IBMPlexSans_700Bold' },
  h2: { fontSize: 32, fontFamily: 'IBMPlexSans_700Bold' },
  h3: { fontSize: 28, fontFamily: 'IBMPlexSans_600SemiBold' },
  h4: { fontSize: 24, fontFamily: 'IBMPlexSans_600SemiBold' },
  h5: { fontSize: 20, fontFamily: 'IBMPlexSans_500Medium' },
  bodyLarge: { fontSize: 16, fontFamily: 'IBMPlexSans_400Regular' },
  bodySmall: { fontSize: 14, fontFamily: 'IBMPlexSans_400Regular' },
  caption: { fontSize: 12, fontFamily: 'IBMPlexSans_400Regular' },
  button: { fontSize: 16, fontFamily: 'IBMPlexSans_600SemiBold' },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const Colors = {
  light: {
    text: AppColors.textPrimary,
    background: AppColors.white,
    tint: AppColors.primary,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: AppColors.primary,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};
