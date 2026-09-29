import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, spacing, touchTarget, typography } from '../theme';

export default function ShowPasswordToggle({ visible, onPress, label = 'password' }) {
  const accessibleLabel = visible ? `Hide ${label}` : `Show ${label}`;

  return (
    <Text
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: visible }}
      accessibilityLabel={accessibleLabel}
      style={styles.toggle}
    >
      {visible ? 'Hide' : 'Show'}
    </Text>
  );
}

const styles = StyleSheet.create({
  toggle: {
    minHeight: touchTarget,
    minWidth: touchTarget,
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingHorizontal: spacing.md,
    color: colors.primary,
    ...typography.label,
  },
});
