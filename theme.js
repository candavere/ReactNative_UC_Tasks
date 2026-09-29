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
  background: '#F4F6FA',
  card: '#FFFFFF',
  primary: '#1F4FD8',
  primaryPressed: '#173CA8',
  primaryDisabled: '#A9B4CC',
  text: '#111827',
  textMuted: '#4B5563',
  textOnPrimary: '#FFFFFF',
  textDisabled: '#F3F4F6',
  border: '#D1D5DB',
  borderStrong: '#9CA3AF',
  error: '#B42318',
  errorBackground: '#FEF3F2',
  success: '#15803D',
  link: '#1F4FD8',
  accentSoft: '#E7EDFB',
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
  md: 10,
  lg: 16,
  pill: 999,
};

export const touchTarget = 48;
export const contentMaxWidth = 520;
export const shortHeight = 520;
