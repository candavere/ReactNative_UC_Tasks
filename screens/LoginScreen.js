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

export default function LoginScreen({ navigation }) {
  // --- What the user has typed -------------------------------------------
  // This is the only place the raw input is stored.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- Whether the user has interacted with each field -------------------
  // `touched` becomes true on blur, or on the first keystroke. It stops the
  // form from shouting "email is required" at somebody who has not typed yet.
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // True once the user has tried to submit at least once.
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // --- UI state -----------------------------------------------------------
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // --- Derived values -----------------------------------------------------
  // These are calculated from the state above on every render rather than
  // stored in their own state. That way the error message can never disagree
  // with what is actually in the box.
  const emailError =
    emailTouched || submitAttempted ? getEmailError(email) : '';
  const passwordError =
    passwordTouched || submitAttempted ? getPasswordError(password) : '';

  const formIsValid = emailError === '' && passwordError === '';

  async function handleLogin() {
    // Stage 4 replaces the body of this function with the real Firebase call.
    setSubmitAttempted(true);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* KeyboardAvoidingView lifts the form so the on-screen keyboard does not
          cover the fields or the button. Behaviour differs by platform: iOS
          needs padding, Android can resize the window itself. */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to your account</Text>

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
            // An email keyboard gives the user an @ key. Turning off
            // auto-capitalise stops "Example@..." being typed for them.
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
            // secureTextEntry is what draws the dots instead of the letters.
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={formIsValid ? handleLogin : undefined}
            rightAdornment={
              <ShowPasswordToggle
                visible={showPassword}
                onPress={() => setShowPassword((current) => !current)}
              />
            }
          />

          <FormBanner message={formError} />

          <PrimaryButton
            title="Login"
            onPress={handleLogin}
            // The button is genuinely disabled, not just greyed out, so it
            // cannot be triggered by an accidental double tap.
            disabled={!formIsValid}
            loading={loading}
            testID="login-submit"
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>New here? </Text>
            <TextLink
              title="Create an account"
              onPress={() => navigation.navigate('Signup')}
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
