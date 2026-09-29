import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSizes, spacing } from '../theme';

export default function SignupScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>Create an account</Text>
        <Text style={styles.subtitle}>Sign up with your email and password</Text>

        {/* The real form is added in Stage 3. */}
        <Text style={styles.placeholder}>
          Email and password fields are added in Stage 3.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  placeholder: {
    marginTop: spacing.xl,
    fontSize: fontSizes.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
