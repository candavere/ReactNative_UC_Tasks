import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSizes, spacing } from '../theme';

/**
 * A styled button.
 *
 * `disabled` greys the button out *and* stops it responding to taps, so the
 * user can see at a glance that they cannot press it yet.
 */
export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  accessibilityHint,
  testID,
}) {
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      accessibilityHint={accessibilityHint}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        isSecondary && styles.buttonSecondary,
        disabled && styles.buttonDisabled,
        pressed && !disabled && (isSecondary ? styles.pressedSecondary : styles.pressedPrimary),
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          isSecondary && styles.buttonTextSecondary,
          disabled && styles.buttonTextDisabled,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

/** A small text link, used for "New here? Sign up" and similar. */
export function TextLink({ title, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      style={({ pressed }) => [styles.linkWrapper, pressed && styles.linkPressed]}
    >
      <Text style={styles.link}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52, // a comfortable tap target
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonDisabled: {
    backgroundColor: colors.primaryDisabled,
    borderColor: colors.primaryDisabled,
  },
  pressedPrimary: {
    backgroundColor: colors.primaryPressed,
  },
  pressedSecondary: {
    backgroundColor: '#E7EDFB',
  },
  buttonText: {
    color: colors.textOnPrimary,
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: colors.primary,
  },
  buttonTextDisabled: {
    color: '#F3F4F6',
  },
  linkWrapper: {
    paddingVertical: spacing.sm,
  },
  linkPressed: {
    opacity: 0.6,
  },
  link: {
    color: colors.link,
    fontSize: fontSizes.body,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
