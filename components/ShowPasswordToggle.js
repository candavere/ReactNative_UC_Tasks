import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, fontSizes, spacing } from '../theme';

/**
 * The "Show password" / "Hide password" toggle.
 *
 * The password TextInput stays in control of the input; this button just tells
 * it whether to draw the characters or mask them as dots.
 */
export default function ShowPasswordToggle({ visible, onPress }) {
  return (
    <Text
      // A Pressable wrapped around a Text, so it can sit inside the input row.
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
