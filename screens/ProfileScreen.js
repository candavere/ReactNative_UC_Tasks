import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import PreferenceCard from '../components/PreferenceCard';
import Chip from '../components/Chip';

const colors = {
  background: '#F1F0FA',
  card: '#FFFFFF',
  primary: '#5B4FE9',
  primaryDark: '#4438D1',
  text: '#1E1B2E',
  muted: '#6E6A8A',
  border: '#EDEBFA',
  avatarRing: '#FF6B4A',
  buttonText: '#FFFFFF',
  section: '#3D3A5C',
};

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, email, loading, resetToDefaults } = useUser();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  if (loading) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const morbillion = 1000000000000;
  const budgetLabel =
    user.budgetPref === morbillion
      ? '1 Morbillion Dollars/outing'
      : '\u20B9' + user.budgetPref + ' / outing';
  const timeLabel =
    user.timePref === 6 ? 'Half Day' : user.timePref + ' Hours Max';

  function handleEdit() {
    navigation.navigate('EditProfile');
  }

  async function handleLogout() {
    setLogoutError('');
    setLoggingOut(true);
    try {
      resetToDefaults();
      const parent = navigation.getParent();
      if (parent) {
        parent.replace('Login');
      } else {
        navigation.replace('Login');
      }
    } catch (e) {
      setLogoutError('Could not log out. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <View style={[styles.safe, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          {user.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Ionicons name="person" size={52} color={colors.muted} />
            </View>
          )}
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.bio}>{user.bio}</Text>
          {email !== '' ? <Text style={styles.email}>{email}</Text> : null}
        </View>
        <View style={styles.row}>
          <PreferenceCard
            icon="wallet"
            label="Max Budget"
            value={budgetLabel}
          />
          <View style={styles.gap} />
          <PreferenceCard
            icon="time"
            label="Available Time"
            value={timeLabel}
          />
        </View>
        <Text style={styles.section}>Interests</Text>
        <View style={styles.chips}>
          {user.interests.map((item) => (
            <Chip key={item} label={item} selected={false} onPress={() => {}} />
          ))}
        </View>
        <Pressable
          onPress={handleEdit}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </Pressable>
        <Pressable
          onPress={handleLogout}
          disabled={loggingOut}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutPressed,
          ]}
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.logoutText}>Log Out</Text>
          )}
        </Pressable>
        {logoutError !== '' ? <Text style={styles.logoutError}>{logoutError}</Text> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 20,
    paddingTop: 16,
  },
  header: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#2A2550',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: colors.avatarRing,
    marginBottom: 12,
  },
  avatarFallback: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#ECEAFF',
    borderWidth: 3,
    borderColor: colors.avatarRing,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  bio: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  email: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  gap: {
    width: 12,
  },
  section: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.section,
    marginBottom: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.primaryDark,
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 15,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    marginTop: 12,
  },
  logoutPressed: {
    opacity: 0.7,
  },
  logoutText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  logoutError: {
    marginTop: 10,
    color: '#D92D20',
    fontSize: 13,
    textAlign: 'center',
  },
});
