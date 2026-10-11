import React, { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import FormBanner from '../components/FormBanner';
import FormField from '../components/FormField';
import PasswordChecklist from '../components/PasswordChecklist';
import PrimaryButton, { TextLink } from '../components/PrimaryButton';
import Screen from '../components/Screen';
import ShowPasswordToggle from '../components/ShowPasswordToggle';
import {
  getConfirmPasswordError,
  getEmailError,
  getPasswordRuleResults,
  getSignupPasswordError,
  isEmailValid,
  isSignupPasswordValid,
  normalizeEmail,
  passwordsMatch,
} from '../validation';
import { getSignupErrorMessage } from '../authErrors';
import { createUserDocument, findUserByEmail } from '../userProfile';
import { useUser } from '../context/UserContext';
import { colors, shortHeight, spacing, typography } from '../theme';

export default function SignupScreen({ navigation }) {
  const { height } = useWindowDimensions();
  const isShort = height < shortHeight;
  const { loginAs } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [debugCode, setDebugCode] = useState('');
  const emailError =
    emailTouched || submitAttempted ? getEmailError(email) : '';
  const passwordError =
    passwordTouched || submitAttempted ? getSignupPasswordError(password) : '';
  const confirmError =
    confirmTouched || submitAttempted
      ? getConfirmPasswordError(password, confirmPassword)
      : '';
  const ruleResults = getPasswordRuleResults(password);
  const formIsValid =
    isEmailValid(email) &&
    isSignupPasswordValid(password) &&
    passwordsMatch(password, confirmPassword);

  async function handleSubmit() {
    setSubmitAttempted(true);
    setFormError('');
    setDebugCode('');
    setLoading(true);
    try {
      const trimmedEmail = normalizeEmail(email);
      const existing = await findUserByEmail(trimmedEmail);
      if (existing) {
        setFormError(
          'An account already exists with that email address. Try logging in instead.',
        );
        if (__DEV__) {
          setDebugCode('auth/email-already-in-use');
        }
        return;
      }
      await createUserDocument(trimmedEmail, password);
      await loginAs(trimmedEmail);
      navigation.replace('Tabs');
    } catch (error) {
      console.log(error?.code, error?.message, error);
      setFormError(getSignupErrorMessage(error));
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
    <Screen testID="signup-screen">
      <Text style={[styles.title, isShort && styles.titleCompact]}>
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
        placeholder="Create a strong password"
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        rightAdornment={
          <ShowPasswordToggle
            visible={showPassword}
            onPress={() => setShowPassword((current) => !current)}
          />
        }
      />
      <PasswordChecklist results={ruleResults} />
      <FormField
        label="Confirm password"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          setConfirmTouched(true);
        }}
        onBlur={() => setConfirmTouched(true)}
        error={confirmError}
        placeholder="Type it again"
        secureTextEntry={!showConfirmPassword}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={formIsValid ? handleSubmit : undefined}
        rightAdornment={
          <ShowPasswordToggle
            visible={showConfirmPassword}
            onPress={() => setShowConfirmPassword((current) => !current)}
            label="confirm password"
          />
        }
      />
      <FormBanner message={formError} />
      {__DEV__ && debugCode !== '' ? (
        <Text style={styles.debugCode}>({debugCode})</Text>
      ) : null}
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
