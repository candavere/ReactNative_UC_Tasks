import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../theme';

export default function FormBanner({ message }) {
  if (!message) {
    return null;
  }

  return (
    <View
      style={styles.banner}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Text style={styles.bannerText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.errorBackground,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    borderRadius: radii.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bannerText: {
    ...typography.body,
    color: colors.error,
  },
});
