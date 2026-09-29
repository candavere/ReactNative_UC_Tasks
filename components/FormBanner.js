import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes, spacing } from '../theme';

/**
 * A red banner used for messages that belong to the form as a whole, rather
 * than to one particular field - for example "that email is already taken".
 *
 * It sits directly above the button, close to the fields, so the user does not
 * have to hunt for the reason their tap did nothing.
 */
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
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bannerText: {
    color: colors.error,
    fontSize: fontSizes.body,
    lineHeight: 21,
  },
});
