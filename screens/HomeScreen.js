import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { signOut } from 'firebase/auth';

import PrimaryButton from '../components/PrimaryButton';
import Screen from '../components/Screen';
import { auth } from '../firebaseConfig';
import { formatFirestoreDate, getUserProfile } from '../userProfile';
import { colors, radii, shortHeight, spacing, typography } from '../theme';

export default function HomeScreen() {
  const { height } = useWindowDimensions();
  const isShort = height < shortHeight;

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

        <Text style={[styles.title, isShort && styles.titleCompact]}>Home</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{email}</Text>

        {memberSince ? (
          <>
            <Text style={styles.label}>Member since</Text>
            <Text style={styles.value}>{memberSince}</Text>
          </>
        ) : null}

        {profileError ? (
          <Text style={styles.note}>{profileError}</Text>
        ) : null}
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
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  titleCompact: {
    ...typography.titleCompact,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  note: {
    marginTop: spacing.sm,
    ...typography.caption,
    color: colors.textMuted,
  },
});
