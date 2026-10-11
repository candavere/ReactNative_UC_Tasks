import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { findUserByEmail, formatFirestoreDate } from '../userProfile';
import { useUser } from '../context/UserContext';

const colors = {
  background: '#F1F0FA',
  card: '#FFFFFF',
  text: '#1E1B2E',
  muted: '#6E6A8A',
  iconBg: '#ECEAFF',
  icon: '#5B4FE9',
  border: '#EDEBFA',
};

export default function HomePlaceholder() {
  const { email } = useUser();
  const [memberSince, setMemberSince] = useState('');
  const displayEmail = email || '';

  useEffect(() => {
    let active = true;
    async function loadDate() {
      try {
        if (!displayEmail) {
          return;
        }
        const data = await findUserByEmail(displayEmail);
        const label = formatFirestoreDate(data?.createdAt);
        if (active && label) {
          setMemberSince(label);
        }
      } catch (e) {
        return;
      }
    }
    loadDate();
    return () => {
      active = false;
    };
  }, [displayEmail]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.wrap}>
        <View style={styles.card}>
          <View style={styles.iconRing}>
            <Ionicons name="home" size={34} color={colors.icon} />
          </View>
          <Text style={styles.title}>WASSSSSUP!</Text>
          <Text style={styles.message}>
            What's the sitch, bitch
          </Text>
        </View>
        {displayEmail !== '' || memberSince !== '' ? (
          <View style={styles.accountCard}>
            {displayEmail !== '' ? (
              <>
                <Text style={styles.accountLabel}>Signed in as</Text>
                <Text style={styles.accountValue}>{displayEmail}</Text>
              </>
            ) : null}
            {memberSince !== '' ? (
              <>
                <Text style={styles.accountLabel}>Member since</Text>
                <Text style={styles.accountValue}>{memberSince}</Text>
              </>
            ) : null}
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  wrap: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#2A2550',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  accountCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginTop: 16,
  },
  accountLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  accountValue: {
    fontSize: 15,
    color: colors.text,
    marginTop: 4,
    marginBottom: 12,
  },
});
