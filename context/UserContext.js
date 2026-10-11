import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext(null);

const KEY_PREFIX = 'userProfileV2:';

const defaultUser = {
  name: 'Deep',
  bio: 'Slaying demons in the underworld.',
  profileImage: null,
  budgetPref: 1000000000000,
  timePref: 67,
  interests: ['Food', 'Your Mom'],
};

function keyFor(email) {
  return KEY_PREFIX + email.trim().toLowerCase();
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(defaultUser);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function loginAs(nextEmail) {
    const clean = nextEmail.trim().toLowerCase();
    setEmail(clean);
    setLoading(true);
    try {
      const saved = await AsyncStorage.getItem(keyFor(clean));
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser({ ...defaultUser, ...parsed });
      } else {
        setUser(defaultUser);
      }
    } catch (e) {
      setUser(defaultUser);
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(next) {
    const merged = { ...user, ...next };
    setUser(merged);
    if (!email) {
      return;
    }
    try {
      await AsyncStorage.setItem(keyFor(email), JSON.stringify(merged));
    } catch (e) {
      return;
    }
  }

  function resetToDefaults() {
    setUser(defaultUser);
    setEmail('');
  }

  return (
    <UserContext.Provider value={{ user, email, loading, loginAs, updateUser, resetToDefaults }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
