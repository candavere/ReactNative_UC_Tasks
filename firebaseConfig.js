import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * The six values from the Firebase console (Project settings > Your apps > Web).
 *
 * They are read from the environment instead of being typed in here so that
 * `firebaseConfig.js` never needs editing if you point the app at a different
 * Firebase project. Any variable starting with `EXPO_PUBLIC_` is automatically
 * made available to the app by Expo.
 *
 * These are CLIENT values, not secrets. They are visible inside the app
 * bundle, which is normal and expected. Never put a service account key,
 * private key, or any admin credential in this project.
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// If the .env file is missing or still full of placeholders, the app should say
// so clearly instead of pretending there is a working backend behind it.
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.appId &&
    !firebaseConfig.apiKey.includes('your-api-key-here'),
);

// `getApps().length` is the documented way to avoid the "Firebase App named
// '[DEFAULT]' already exists" error that happens when this module is evaluated
// more than once (for example after a Fast Refresh during development).
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/** Firebase Authentication - this is what stores and checks passwords. */
export const auth = getAuth(app);

/** Cloud Firestore - this is where the non-sensitive user profile lives. */
export const db = getFirestore(app);

export default firebaseConfig;
