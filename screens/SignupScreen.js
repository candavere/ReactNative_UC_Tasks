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
import { createUserWithEmailAndPassword } from 'firebase/auth';

import FormBanner from '../components/FormBanner';
import FormField from '../components/FormField';
import PrimaryButton, { TextLink } from '../components/PrimaryButton';
import ShowPasswordToggle from '../components/ShowPasswordToggle';
import { getEmailError, getPasswordError, normalizeEmail } from '../validation';
import { getProfileSaveErrorMessage, getSignupErrorMessage } from '../authErrors';
import { auth } from '../firebaseConfig';
import { saveUserProfile } from '../userProfile';
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

  // Set when the Auth account was created but saving the Firestore profile
  // failed. In that situation the user is already signed in, so the button
  // changes meaning from "Signup" to "Retry saving profile" - see handleSubmit.
  const [profileSaveFailed, setProfileSaveFailed] = useState(false);

  const emailError =
    emailTouched || submitAttempted ? getEmailError(email) : '';
  const passwordError =
    passwordTouched || submitAttempted ? getPasswordError(password) : '';

  const formIsValid = emailError === '' && passwordError === '';

  async function handleSubmit() {
    setSubmitAttempted(true);

    if (profileSaveFailed) {
      // The Auth account already exists. Do NOT call
      // createUserWithEmailAndPassword again - that would just fail with
      // "email already in use", and the user could never get past this screen.
      // Only retry the Firestore write, using whoever is signed in right now.
      await retryProfileSave();
      return;
    }

    setFormError('');
    setLoading(true);

    try {
      // Trimming and lower-casing means " Test@Example.com " and
      // "test@example.com" are treated as the same account.
      const trimmedEmail = normalizeEmail(email);

      // This single call does the whole "check if email already exists"
      // job. Firebase hashes the password on its own servers, checks whether
      // the email is taken, stores the account, and signs the user in. It
      // rejects a duplicate email with auth/email-already-in-use.
      //
      // Note what is NOT happening: no query of a public list of users, and
      // no password being stored anywhere we control.
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        password,
      );

      // The account now exists and we are signed in. Now save the small
      // non-sensitive profile document.
      await saveUserProfile(userCredential.user.uid, trimmedEmail);

      // Only now do we go to Home. Nothing is shown as successful until both
      // halves of the signup have worked.
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      // Which half failed? If the Auth call threw, no account was created and
      // the user can safely press Signup again. If we got past it, the account
      // already exists.
      if (auth.currentUser && !isAuthError(error)) {
        setProfileSaveFailed(true);
        setFormError(
          `${getProfileSaveErrorMessage(error)}\n\nYour account was created and you are signed in, but your profile could not be saved. Press Retry below to try saving it again.`,
        );
      } else {
        setFormError(getSignupErrorMessage(error));
      }
    } finally {
      // Always clears the spinner, whether the signup worked or not.
      setLoading(false);
    }
  }

  async function retryProfileSave() {
    setFormError('');
    setLoading(true);

    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setProfileSaveFailed(false);
        setFormError('Your session expired. Please sign up again.');
        return;
      }

      await saveUserProfile(currentUser.uid, normalizeEmail(email));

      setProfileSaveFailed(false);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (error) {
      setFormError(
        `${getProfileSaveErrorMessage(error)}\n\nPress Retry to try saving your profile again.`,
      );
    } finally {
      setLoading(false);
    }
  }

  if (profileSaveFailed) {
    // The account exists but the profile is missing. The form is kept on screen
    // rather than replaced, so the user can see what they typed, and the main
    // button becomes a Retry button. The inputs are locked because the account
    // has already been created with this email - changing it now would not do
    // anything useful.
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.title}>Almost done</Text>
            <Text style={styles.subtitle}>
              Your account was created, but your profile could not be saved to
              Firestore.
            </Text>

            <FormBanner message={formError} />

            <PrimaryButton
              title="Retry saving profile"
              onPress={handleSubmit}
              loading={loading}
              testID="signup-retry"
            />

            <Text style={styles.retryNote}>
              Retrying only saves your profile. It does not create a second
              account.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
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
            onSubmitEditing={formIsValid ? handleSubmit : undefined}
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
            onPress={handleSubmit}
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

/**
 * True if the error came from the Firebase Auth call rather than from Firestore.
 *
 * Auth errors all have a code starting with "auth/", so that is what we test
 * for. This is how the catch block above tells "signup did not happen" apart
 * from "signup happened but the profile did not save".
 */
function isAuthError(error) {
  return typeof error?.code === 'string' && error.code.startsWith('auth/');
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
  retryNote: {
    marginTop: spacing.md,
    fontSize: fontSizes.label,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
