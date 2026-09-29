import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../theme';

export default function PasswordChecklist({ results }) {
  return (
    <View style={styles.wrapper} testID="password-checklist">
      {results.map((rule) => (
        <View key={rule.id} style={styles.row}>
          <Text
            style={[styles.mark, rule.isMet ? styles.markMet : styles.markUnmet]}
          >
            {rule.isMet ? '✓' : '•'}
          </Text>
          <Text
            style={[
              styles.label,
              rule.isMet ? styles.labelMet : styles.labelUnmet,
            ]}
          >
            {rule.label}
          </Text>
          <Text
            style={[
              styles.state,
              rule.isMet ? styles.stateMet : styles.stateUnmet,
            ]}
          >
            {rule.isMet ? 'Met' : 'Not met'}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  mark: {
    width: 18,
    ...typography.caption,
    fontWeight: '700',
  },
  markMet: {
    color: colors.success,
  },
  markUnmet: {
    color: colors.textMuted,
  },
  label: {
    flex: 1,
    ...typography.caption,
  },
  labelMet: {
    color: colors.text,
  },
  labelUnmet: {
    color: colors.textMuted,
  },
  state: {
    ...typography.caption,
    fontWeight: '600',
  },
  stateMet: {
    color: colors.success,
  },
  stateUnmet: {
    color: colors.textMuted,
  },
});
