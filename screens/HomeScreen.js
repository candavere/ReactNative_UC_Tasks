import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';

import PrimaryButton from '../components/PrimaryButton';
import { auth } from '../firebaseConfig';
import { formatFirestoreDate, getUserProfile } from '../userProfile';
import { colors, fontSizes, spacing } from '../theme';

export default function HomeScreen() {
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  const email = auth.currentUser?.email ?? 'your account';
  const memberSince = formatFirestoreDate(profile?.createdAt);

  useEffect(() => {
    // Read this user's own profile document so the Home screen can show when the
    // account was created.
    //
    // Note the document ID: it is auth.currentUser.uid, the ID of the person
    // who is signed in. We never list the users collection and never look at
    // anybody else's document, and the Firestore rules would refuse it anyway.
    let cancelled = false;

    async function loadProfile() {
      try {
        const data = await getUserProfile(auth.currentUser.uid);
        if (!cancelled) setProfile(data);
      } catch (error) {
        // A missing profile is not a reason to fail the whole screen. If the
        // document write failed earlier, or the rules have not been published
        // yet, we still show a working Home screen with the email.
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
      // No navigation is needed here. Clearing the Firebase session makes the
      // onAuthStateChanged listener in App.js reset the stack back to Login,
      // which also empties the back history.
      await signOut(auth);
    } catch (error) {
      setProfileError('Could not log out. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>SIGNED IN</Text>
          </View>

          <Text style={styles.title}>Home</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
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
