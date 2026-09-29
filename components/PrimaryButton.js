import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, touchTarget, typography } from '../theme';

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
  const spinnerColor = isSecondary ? colors.primary : colors.textOnPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      accessibilityHint={accessibilityHint}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        isSecondary && styles.buttonSecondary,
        disabled && styles.buttonDisabled,
        pressed &&
          !disabled &&
          (isSecondary ? styles.pressedSecondary : styles.pressedPrimary),
      ]}
    >
      <View style={styles.buttonContent}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={spinnerColor}
            testID={testID ? `${testID}-spinner` : undefined}
          />
        ) : (
          <Text
            style={[
              styles.buttonText,
              isSecondary && styles.buttonTextSecondary,
              disabled && styles.buttonTextDisabled,
            ]}
          >
            {title}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export function TextLink({ title, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.linkWrapper, pressed && styles.linkPressed]}
    >
      <Text style={styles.link}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touchTarget + 4,
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
    backgroundColor: colors.accentSoft,
  },
  buttonContent: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.body,
    fontWeight: '600',
    lineHeight: 22,
    color: colors.textOnPrimary,
  },
  buttonTextSecondary: {
    color: colors.primary,
  },
  buttonTextDisabled: {
    color: colors.textDisabled,
  },
  linkWrapper: {
    minHeight: touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  linkPressed: {
    opacity: 0.6,
  },
  link: {
    ...typography.body,
    color: colors.link,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
