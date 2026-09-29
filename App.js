import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import LoadingView from './components/LoadingView';
import { auth, isFirebaseConfigured } from './firebaseConfig';
import { colors, fontSizes, spacing } from './theme';

const Stack = createStackNavigator();
const navigationRef = createNavigationContainerRef();

function RootNavigator() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser && navigationRef.isReady()) {
        navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    });
  }, []);

  if (user === undefined) {
    return <LoadingView message="Checking your session…" />;
  }

  return (
    <Stack.Navigator
      initialRouteName={user ? 'Home' : 'Login'}
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { color: colors.text, fontWeight: '600' },
        headerTintColor: colors.primary,
        cardStyle: { backgroundColor: colors.background, flex: 1, minHeight: 0 },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Log In' }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{ title: 'Sign Up' }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home', gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}

function FirebaseSetupNotice() {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Firebase is not set up yet</Text>
        <Text style={styles.noticeText}>
          This app needs a .env file with your Firebase web config.
        </Text>
        <Text style={styles.noticeStep}>
          1. Copy .env.example to .env
        </Text>
        <Text style={styles.noticeStep}>
          2. Paste in the six values from Firebase console, Project settings,
          Your apps, Web app
        </Text>
        <Text style={styles.noticeStep}>
          3. Restart the bundler with npx expo start -c
        </Text>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  if (!isFirebaseConfigured) {
    return (
      <View style={styles.root}>
        <FirebaseSetupNotice />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notice: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  noticeTitle: {
    fontSize: fontSizes.heading,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  noticeText: {
    fontSize: fontSizes.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  noticeStep: {
    fontSize: fontSizes.label,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
});
