import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radii, spacing, typography } from '../theme';

export default function FormField({
  label,
  value,
  onChangeText,
  error,
  onBlur,
  onFocus,
  editable = true,
  rightAdornment,
  tall = false,
  ...textInputProps
}) {
  const hasError = Boolean(error);
  const [focused, setFocused] = useState(false);

  function handleFocus(e) {
    setFocused(true);
    if (onFocus) onFocus(e);
  }

  function handleBlur(e) {
    setFocused(false);
    if (onBlur) onBlur(e);
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          tall && styles.inputRowTall,
          focused && !hasError && styles.inputRowFocused,
          hasError && styles.inputRowError,
        ]}
      >
        <TextInput
          style={[styles.input, tall && styles.inputTall]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
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
    height: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
  },
  inputRowTall: {
    height: undefined,
    minHeight: 96,
    alignItems: 'flex-start',
  },
  inputRowFocused: {
    borderColor: colors.primary,
  },
  inputRowError: {
    borderColor: colors.error,
    backgroundColor: colors.errorBackground,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    textAlignVertical: 'center',
    outlineStyle: 'none',
    outlineWidth: 0,
    ...typography.body,
    color: colors.text,
  },
  inputTall: {
    height: undefined,
    minHeight: 78,
    paddingVertical: spacing.sm,
    textAlignVertical: 'top',
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
