import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes, spacing } from '../theme';

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
    minHeight: 52,
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
  buttonContent: {
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.textOnPrimary,
    fontSize: fontSizes.body,
    lineHeight: 20,
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
