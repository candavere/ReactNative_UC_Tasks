import React, { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import FormBanner from '../components/FormBanner';
import FormField from '../components/FormField';
import PrimaryButton, { TextLink } from '../components/PrimaryButton';
import Screen from '../components/Screen';
import ShowPasswordToggle from '../components/ShowPasswordToggle';
import {
  getEmailError,
  getLoginPasswordError,
  isEmailValid,
  isLoginPasswordPresent,
  normalizeEmail,
} from '../validation';
import { getLoginErrorMessage } from '../authErrors';
import { findUserByEmail } from '../userProfile';
import { useUser } from '../context/UserContext';
import { colors, shortHeight, spacing, typography } from '../theme';

export default function LoginScreen({ navigation }) {
  const { height } = useWindowDimensions();
  const isShort = height < shortHeight;
  const { loginAs } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [debugCode, setDebugCode] = useState('');
  const emailError =
    emailTouched || submitAttempted ? getEmailError(email) : '';
  const passwordError =
    passwordTouched || submitAttempted ? getLoginPasswordError(password) : '';
  const formIsValid = isEmailValid(email) && isLoginPasswordPresent(password);

  async function handleLogin() {
    setSubmitAttempted(true);
    setFormError('');
    setDebugCode('');
    setLoading(true);
    try {
      const clean = normalizeEmail(email);
      const existing = await findUserByEmail(clean);
      if (!existing) {
        setFormError(
          'No account was found with that email address. Please sign up first.',
        );
        if (__DEV__) {
          setDebugCode('auth/user-not-found');
        }
        return;
      }
      const savedPassword = existing.password || '';
      if (savedPassword !== password) {
        setFormError(
          'Check your email and password, or sign up if you do not have an account yet.',
        );
        if (__DEV__) {
          setDebugCode('auth/wrong-password');
        }
        return;
      }
      await loginAs(clean);
      navigation.replace('Tabs');
    } catch (error) {
      console.log(error?.code, error?.message, error);
      setFormError(getLoginErrorMessage(error));
      if (typeof error?.code === 'string') {
        setDebugCode(error.code);
      } else {
        setDebugCode('unknown');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen testID="login-screen">
      <Text style={[styles.title, isShort && styles.titleCompact]}>
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
        placeholder="Your password"
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
      {__DEV__ && debugCode !== '' ? (
        <Text style={styles.debugCode}>({debugCode})</Text>
      ) : null}
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
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
  },
  titleCompact: {
    ...typography.titleCompact,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  debugCode: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  footerText: {
    ...typography.body,
    color: colors.textMuted,
  },
});
