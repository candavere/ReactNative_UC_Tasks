import React, { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';

import FormBanner from '../components/FormBanner';
import FormField from '../components/FormField';
import PrimaryButton, { TextLink } from '../components/PrimaryButton';
import Screen from '../components/Screen';
import ShowPasswordToggle from '../components/ShowPasswordToggle';
import {
  getEmailError,
  getPasswordError,
  isEmailValid,
  isPasswordValid,
  normalizeEmail,
} from '../validation';
import {
  getProfileSaveErrorMessage,
  getSignupErrorMessage,
} from '../authErrors';
import { auth } from '../firebaseConfig';
import { saveUserProfile } from '../userProfile';
import { colors, fontSizes, spacing } from '../theme';

const SHORT_HEIGHT = 520;

export default function SignupScreen({ navigation }) {
  const { height } = useWindowDimensions();
  const isShort = height < SHORT_HEIGHT;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [profileSaveFailed, setProfileSaveFailed] = useState(false);

  const emailError =
    emailTouched || submitAttempted ? getEmailError(email) : '';
  const passwordError =
    passwordTouched || submitAttempted ? getPasswordError(password) : '';
  const formIsValid = isEmailValid(email) && isPasswordValid(password);

  async function handleSubmit() {
    setSubmitAttempted(true);

    if (profileSaveFailed) {
      await retryProfileSave();
      return;
    }

    setFormError('');
    setLoading(true);

    try {
      const trimmedEmail = normalizeEmail(email);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        password,
      );

      await saveUserProfile(userCredential.user.uid, trimmedEmail);

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      if (auth.currentUser && !isAuthError(error)) {
        setProfileSaveFailed(true);
        setFormError(
          `${getProfileSaveErrorMessage(error)}\n\nYour account was created and you are signed in, but your profile could not be saved. Press Retry below to try saving it again.`,
        );
      } else {
        setFormError(getSignupErrorMessage(error));
      }
    } finally {
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
    return (
      <Screen testID="signup-retry-screen">
        <Text style={[styles.title, isShort && styles.titleShort]}>
          Almost done
        </Text>
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
          Retrying only saves your profile. It does not create a second account.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen testID="signup-screen">
      <Text style={[styles.title, isShort && styles.titleShort]}>
        Create an account
      </Text>
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
    </Screen>
  );
}

function isAuthError(error) {
  return typeof error?.code === 'string' && error.code.startsWith('auth/');
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSizes.title,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  titleShort: {
    fontSize: fontSizes.titleCompact,
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
    flexWrap: 'wrap',
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
