import React, { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';

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
import { getLoginErrorMessage } from '../authErrors';
import { auth } from '../firebaseConfig';
import { colors, fontSizes, spacing } from '../theme';

const SHORT_HEIGHT = 520;

export default function LoginScreen({ navigation }) {
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
      await signInWithEmailAndPassword(
        auth,
        normalizeEmail(email),
        password,
      );

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      setFormError(getLoginErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen testID="login-screen">
      <Text style={[styles.title, isShort && styles.titleShort]}>
        Welcome back
      </Text>
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
    </Screen>
  );
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
});
