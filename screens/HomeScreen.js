import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';

export default function HomeScreen({ navigation }) {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  const [buttonPresses, setButtonPresses] = useState(0);

  useEffect(() => {
    if (fontsLoaded) {
      console.log('Fonts loaded successfully');
    }
    if (fontError) {
      console.error('Font loading error:', fontError);
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleStartPress = () => {
    setButtonPresses(prev => prev + 1);
    navigation.navigate('Second');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>React Native - Task 0</Text>
      <Button title="Let's Start" onPress={handleStartPress} />
      <Text style={styles.counterText}>Button pressed {buttonPresses} time(s)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 28,
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  counterText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});