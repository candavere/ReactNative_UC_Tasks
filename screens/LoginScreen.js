import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSizes, spacing } from '../theme';

export default function LoginScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to your account</Text>

        {/* The real form is added in Stage 3. For now this screen just proves
            that navigation into and out of it works. */}
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
