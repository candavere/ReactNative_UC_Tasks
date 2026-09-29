import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fontSizes, spacing } from '../theme';

/**
 * A labelled text input that can also show an error message underneath itself.
 *
 * Login and Signup both need exactly this, so it is written once here instead of
 * being copy-pasted into both screens. The screen decides *whether* there is an
 * error and passes the message in - this component only draws it.
 */
export default function FormField({
  label,
  value,
  onChangeText,
  error,
  onBlur,
  editable = true,
  // Extra props are forwarded straight to the TextInput. This is how the
  // password field passes secureTextEntry / keyboardType etc.
  ...textInputProps
}) {
  const hasError = Boolean(error);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label} nativeID={`${label}-label`}>
        {label}
      </Text>

      <TextInput
        style={[styles.input, hasError && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        editable={editable}
        placeholderTextColor={colors.textMuted}
        // Ties the error text to the input for screen readers.
        accessibilityLabel={label}
        accessibilityHint={hasError ? error : undefined}
        {...textInputProps}
      />

      {/* Reserve the space even when there is no error, so the layout does not
          jump up and down as errors appear and disappear. */}
      <View style={styles.errorSlot}>
        {hasError ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSizes.label,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSizes.body,
    color: colors.text,
    backgroundColor: colors.card,
    minHeight: 52,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorBackground,
  },
  errorSlot: {
    minHeight: 20, // one line of error text
    justifyContent: 'center',
  },
  error: {
    color: colors.error,
    fontSize: fontSizes.error,
    marginTop: spacing.xs,
  },
});
