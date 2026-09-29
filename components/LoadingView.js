import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes, spacing } from '../theme';

export default function LoadingView({ message = 'Loading…' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  message: {
    marginTop: spacing.md,
    fontSize: fontSizes.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
