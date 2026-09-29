import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radii, spacing, touchTarget, typography } from '../theme';

export default function FormField({
  label,
  value,
  onChangeText,
  error,
  onBlur,
  editable = true,
  rightAdornment,
  ...textInputProps
}) {
  const hasError = Boolean(error);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[styles.inputRow, hasError && styles.inputRowError]}
      >
        <TextInput
          style={[styles.input, hasError && styles.inputError]}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          editable={editable}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={label}
          accessibilityHint={hasError ? error : undefined}
          {...textInputProps}
        />
        {rightAdornment}
      </View>

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
    width: '100%',
  },
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.card,
  },
  inputRowError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.text,
    minHeight: touchTarget + 4,
  },
  inputError: {
    backgroundColor: colors.errorBackground,
  },
  errorSlot: {
    minHeight: 18,
    justifyContent: 'center',
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
