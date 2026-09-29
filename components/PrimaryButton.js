import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes, spacing } from '../theme';

/**
 * A styled button.
 *
 * `disabled` greys the button out *and* stops it responding to taps, so the
 * user can see at a glance that they cannot press it yet.
 *
 * `loading` swaps the title for a spinner while a request is in flight, which
 * is the "loading indicator" the brief asks for. The button stays disabled for
 * the whole time, so it cannot be pressed a second time while the first request
 * is still running.
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

  // The primary button is filled blue, so the spinner has to be white to be
  // visible on it. The secondary button (Logout) is transparent with a blue
  // outline, so there the spinner has to be blue instead - a white spinner
  // would disappear completely.
  const spinnerColor = isSecondary ? colors.primary : colors.textOnPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      // The title text is replaced by the spinner while loading, so the name is
      // set explicitly here. Without it the button would have no accessible
      // name at all while loading.
      accessibilityLabel={title}
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
      {/* Both the text and the spinner sit in this same fixed-height row, so
          the button is exactly the same size whether it is idle or loading and
          nothing jumps. */}
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
  buttonContent: {
    // Matches buttonText.lineHeight below, so the text and the spinner occupy
    // the same height and the button does not resize between the two states.
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.textOnPrimary,
    fontSize: fontSizes.body,
    // Pinned so the rendered height is predictable and matches buttonContent.
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
