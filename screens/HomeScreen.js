import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { signOut } from 'firebase/auth';

import PrimaryButton from '../components/PrimaryButton';
import Screen from '../components/Screen';
import { auth } from '../firebaseConfig';
import { formatFirestoreDate, getUserProfile } from '../userProfile';
import { colors, fontSizes, spacing } from '../theme';

const SHORT_HEIGHT = 520;

export default function HomeScreen() {
  const { height } = useWindowDimensions();
  const isShort = height < SHORT_HEIGHT;

  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  const email = auth.currentUser?.email ?? 'your account';
  const memberSince = formatFirestoreDate(profile?.createdAt);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const data = await getUserProfile(auth.currentUser.uid);
        if (!cancelled) setProfile(data);
      } catch (error) {
        if (!cancelled) {
          setProfileError(
            'Your profile could not be read from Firestore, so the signup date is not shown.',
          );
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await signOut(auth);
    } catch (error) {
      setProfileError('Could not log out. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <Screen testID="home-screen">
      <View style={styles.card}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>SIGNED IN</Text>
        </View>

        <Text style={[styles.title, isShort && styles.titleShort]}>Home</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{email}</Text>

        {memberSince ? (
          <>
            <Text style={styles.label}>Member since</Text>
            <Text style={styles.value}>{memberSince}</Text>
          </>
        ) : null}

        {profileError ? <Text style={styles.note}>{profileError}</Text> : null}
      </View>

      <PrimaryButton
        title="Logout"
        onPress={handleLogout}
        loading={loggingOut}
        variant="secondary"
        testID="logout-button"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E7EDFB',
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  titleShort: {
    fontSize: fontSizes.titleCompact,
  },
  label: {
    fontSize: fontSizes.label,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: fontSizes.body,
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  note: {
    marginTop: spacing.sm,
    fontSize: fontSizes.label,
    color: colors.textMuted,
    lineHeight: 20,
  },
});
