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
  // An optional element rendered at the right-hand end of the input box. The
  // password field uses it for the Show / Hide button.
  rightAdornment,
  // Extra props are forwarded straight to the TextInput. This is how the
  // password field passes secureTextEntry / keyboardType etc.
  ...textInputProps
}) {
  const hasError = Boolean(error);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, hasError && styles.inputError, styles.inputFlex]}
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
        {rightAdornment}
      </View>

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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // The row owns the border, so the input and the Show/Hide button line up
    // inside a single box.
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.card,
  },
  inputFlex: {
    flex: 1,
  },
  input: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSizes.body,
    color: colors.text,
    minHeight: 52,
  },
  inputError: {
    backgroundColor: colors.errorBackground,
  },
  rowError: {
    borderColor: colors.error,
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
