import { Platform } from 'react-native';

export const fontFamily = Platform.select({
  ios: 'Helvetica Neue',
  web: 'Helvetica Neue, Helvetica, Arial, sans-serif',
  android: 'sans-serif',
  default: 'System',
});

export const typography = {
  title: {
    fontFamily,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  titleCompact: {
    fontFamily,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  body: {
    fontFamily,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  label: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  caption: {
    fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
};

export const colors = {
  background: '#F1F0FA',
  card: '#FFFFFF',
  primary: '#5B4FE9',
  primaryPressed: '#4438D1',
  primaryDisabled: '#B8B3E3',
  text: '#1E1B2E',
  textMuted: '#6E6A8A',
  textOnPrimary: '#FFFFFF',
  textDisabled: '#FFFFFF',
  border: '#E2E0F3',
  borderStrong: '#D9D6F2',
  error: '#D92D20',
  errorBackground: '#FDECEA',
  success: '#15803D',
  link: '#5B4FE9',
  accentSoft: '#ECEAFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
};

export const touchTarget = 48;
export const contentMaxWidth = 520;
export const shortHeight = 520;
