import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { onAuthStateChanged } from 'firebase/auth';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import LoadingView from './components/LoadingView';
import { auth, isFirebaseConfigured } from './firebaseConfig';
import { colors, fontSizes, spacing } from './theme';

const Stack = createStackNavigator();

// Lets the auth listener in RootNavigator drive navigation from outside of any
// screen component (for example when Firebase signs the user out by itself).
const navigationRef = createNavigationContainerRef();

function RootNavigator() {
  // `undefined` means "we have not asked Firebase yet", `null` means "nobody is
  // signed in", and an object means somebody is signed in.
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    // onAuthStateChanged fires once straight away with the current session, and
    // again whenever the session changes. It returns an unsubscribe function,
    // which we return from useEffect so the listener is removed on unmount.
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      // If the user is signed out at any point - by pressing Logout, or by
      // Firebase revoking the session - make sure they are not left looking at
      // Home. Resetting the stack also empties the back history, so the
      // hardware Back button cannot walk them back into a signed-in screen.
      if (!firebaseUser && navigationRef.isReady()) {
        navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    });
  }, []);

  // Still talking to Firebase - show a spinner instead of flashing the wrong
  // screen.
  if (user === undefined) {
    return <LoadingView message="Checking your session…" />;
  }

  return (
    <Stack.Navigator
      // Only applied the first time the navigator mounts, which is exactly
      // what we want: a returning signed-in user starts on Home, everyone else
      // starts on Login.
      initialRouteName={user ? 'Home' : 'Login'}
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { color: colors.text, fontWeight: '600' },
        headerTintColor: colors.primary,
        cardStyle: { backgroundColor: colors.background },
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
        options={{
          title: 'Home',
          // Stop the swipe-right-back gesture, so there is no way to slide from
          // Home back to the login form.
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}

/**
 * Shown when `.env` is missing or incomplete.
 *
 * Without this, Firebase would only fail later with a confusing network error
 * the first time you pressed a button. Saying what is wrong up front is much
 * easier to debug.
 */
function FirebaseSetupNotice() {
  return (
    <View style={styles.centered}>
      <Text style={styles.noticeTitle}>Firebase is not set up yet</Text>
      <Text style={styles.centeredText}>
        This app needs a `.env` file with your Firebase web config.{'\n\n'}
        1. Copy <Text style={styles.mono}>.env.example</Text> to{' '}
        <Text style={styles.mono}>.env</Text>{'\n'}
        2. Paste in the six values from Firebase console → Project settings → Your
        apps → Web app{'\n'}
        3. Restart the bundler with{' '}
        <Text style={styles.mono}>npx expo start -c</Text>
      </Text>
    </View>
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
    // The JavaScript stack navigator draws its swipe-back gesture with
    // react-native-gesture-handler. On Android those gestures only work if the
    // whole app sits inside a GestureHandlerRootView, so we wrap it here.
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
  centeredText: {
    marginTop: spacing.md,
    fontSize: fontSizes.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  noticeTitle: {
    fontSize: fontSizes.heading,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  mono: {
    fontFamily: 'Courier',
    color: colors.text,
  },
});
