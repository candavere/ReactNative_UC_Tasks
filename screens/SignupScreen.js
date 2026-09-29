import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FormBanner from '../components/FormBanner';
import FormField from '../components/FormField';
import PrimaryButton, { TextLink } from '../components/PrimaryButton';
import ShowPasswordToggle from '../components/ShowPasswordToggle';
import { getEmailError, getPasswordError } from '../validation';
import { colors, fontSizes, spacing } from '../theme';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Derived on every render from the state above, so the messages can never
  // drift out of sync with what is in the boxes.
  const emailError =
    emailTouched || submitAttempted ? getEmailError(email) : '';
  const passwordError =
    passwordTouched || submitAttempted ? getPasswordError(password) : '';

  const formIsValid = emailError === '' && passwordError === '';

  async function handleSignup() {
    // Stage 4 replaces the body of this function with the real Firebase call.
    setSubmitAttempted(true);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Text style={styles.title}>Create an account</Text>
          <Text style={styles.subtitle}>
            Sign up with your email and password
          </Text>

          <FormField
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailTouched(true);
            }}
            onBlur={() => setEmailTouched(true)}
            error={emailError}
            placeholder="example@domain.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
          />

          <FormField
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordTouched(true);
            }}
            onBlur={() => setPasswordTouched(true)}
            error={passwordError}
            placeholder="At least 6 characters"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="go"
            onSubmitEditing={formIsValid ? handleSignup : undefined}
            rightAdornment={
              <ShowPasswordToggle
                visible={showPassword}
                onPress={() => setShowPassword((current) => !current)}
              />
            }
          />

          <FormBanner message={formError} />

          <PrimaryButton
            title="Signup"
            onPress={handleSignup}
            disabled={!formIsValid}
            loading={loading}
            testID="signup-submit"
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TextLink
              title="Log in"
              onPress={() => navigation.navigate('Login')}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
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
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  footerText: {
    fontSize: fontSizes.body,
    color: colors.textMuted,
  },
});
