import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';

export default function SecondScreen({ navigation }) {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  const [visitCount, setVisitCount] = useState(0);

  useEffect(() => {
    if (fontsLoaded) {
      setVisitCount(prev => prev + 1);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.confirmationText}>Successfully navigated!</Text>
      <Text style={styles.visitText}>Visit count: {visitCount}</Text>
      <Button title="Go Back" onPress={handleGoBack} />
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
  confirmationText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  visitText: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },
});