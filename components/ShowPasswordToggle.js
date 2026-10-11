import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '../theme';

export default function ShowPasswordToggle({ visible, onPress, label = 'password' }) {
  const accessibleLabel = visible ? `Hide ${label}` : `Show ${label}`;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityState={{ selected: visible }}
      accessibilityLabel={accessibleLabel}
      style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
    >
      <Text style={styles.text}>{visible ? 'Hide' : 'Show'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  pressed: {
    opacity: 0.6,
  },
  text: {
    ...typography.label,
    color: colors.primary,
    textAlign: 'center',
    minWidth: 48,
  },
});
