import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, fontSizes, spacing } from '../theme';

export default function ShowPasswordToggle({ visible, onPress }) {
  return (
    <Text
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: visible }}
      accessibilityLabel={visible ? 'Hide password' : 'Show password'}
      style={styles.toggle}
    >
      {visible ? 'Hide' : 'Show'}
    </Text>
  );
}

const styles = StyleSheet.create({
  toggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.primary,
    fontSize: fontSizes.label,
    fontWeight: '600',
  },
});
