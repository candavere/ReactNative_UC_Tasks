import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import { colors } from './theme';

const Stack = createStackNavigator();

/**
 * The navigator for the whole app.
 *
 * `initialRouteName` is decided in Stage 2 once Firebase Auth is connected
 * (if the user is already signed in we start on Home, otherwise Login).
 * For Stage 1 every launch starts on Login.
 */
function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
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
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    // The JavaScript stack navigator draws its swipe-back gesture with
    // react-native-gesture-handler. On Android those gestures only work if the
    // whole app sits inside a GestureHandlerRootView, so we wrap it here.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
