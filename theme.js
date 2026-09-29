// Shared colours, spacing and font sizes.
//
// I put these in one file instead of repeating the same hex codes in every
// screen. That way, if I want to change the brand colour later I change it in
// one place and all three screens stay consistent.

// Every colour below is a dark shade on a light background, which keeps the
// text contrast high enough to read comfortably.
export const colors = {
  background: '#F4F6FA',
  card: '#FFFFFF',
  primary: '#1F4FD8', // blue - main buttons
  primaryPressed: '#173CA8',
  primaryDisabled: '#A9B4CC', // greyed out when the form is not valid yet
  text: '#111827',
  textMuted: '#4B5563',
  textOnPrimary: '#FFFFFF',
  border: '#D1D5DB',
  error: '#B42318', // dark red - error messages
  errorBackground: '#FEF3F2',
  link: '#1F4FD8',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const fontSizes = {
  title: 28,
  heading: 20,
  body: 16,
  label: 14,
  error: 14,
};
