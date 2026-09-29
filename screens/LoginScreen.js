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
import { signInWithEmailAndPassword } from 'firebase/auth';

import FormBanner from '../components/FormBanner';
import FormField from '../components/FormField';
import PrimaryButton, { TextLink } from '../components/PrimaryButton';
import ShowPasswordToggle from '../components/ShowPasswordToggle';
import {
  getEmailError,
  getPasswordError,
  isEmailValid,
  isPasswordValid,
  normalizeEmail,
} from '../validation';
import { getLoginErrorMessage } from '../authErrors';
import { auth } from '../firebaseConfig';
import { colors, fontSizes, spacing } from '../theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Derived on every render from the state above, so an error message can never
  // disagree with what is actually in the box.
  //
  // Validity is worked out straight from the field values with isEmailValid and
  // isPasswordValid. It must NOT be derived from the error strings above: an
  // untouched form deliberately shows no error messages, which would look
  // identical to "everything is valid" and would leave the Login button
  // enabled on an empty form.
  const emailError =
    emailTouched || submitAttempted ? getEmailError(email) : '';
  const passwordError =
    passwordTouched || submitAttempted ? getPasswordError(password) : '';

  const formIsValid = isEmailValid(email) && isPasswordValid(password);

  async function handleLogin() {
    setSubmitAttempted(true);
    setFormError('');
    setLoading(true);

    try {
      // This is the "check the user's credentials" step from the brief.
      //
      // The password is sent over HTTPS to Firebase, which hashes it and
      // compares that hash with the one it stored when the account was created.
      // The plain password is never written to Firestore and never comes back
      // out of Firebase.
      //
      // If the email is not registered, or the password does not match, this
      // promise rejects and we stay on this screen with an error.
      await signInWithEmailAndPassword(auth, normalizeEmail(email), password);

      // Reached only when Firebase accepted the email and password. We do not
      // read a list of users or compare anything ourselves.
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      setFormError(getLoginErrorMessage(error));
    } finally {
      // Always clears the spinner, whether the login worked or not.
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* KeyboardAvoidingView lifts the form so the on-screen keyboard does not
          cover the fields or the button. iOS needs padding; Android resizes the
          window itself. */}
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
            // secureTextEntry draws dots instead of the typed characters, and
            // the Show/Hide control flips it.
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

          {/* Backend errors sit here, directly above the button and below the
              two fields, so the reason for the failure is never far away. */}
          <FormBanner message={formError} />

          <PrimaryButton
            title="Login"
            onPress={handleLogin}
            // Genuinely disabled, not just greyed out, so a stray double tap
            // cannot fire a request with an invalid form.
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
