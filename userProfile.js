import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * Reading and writing the small, non-sensitive profile that lives in Firestore.
 *
 * A profile is stored at users/{uid}, where {uid} is the ID Firebase Auth
 * generates. Using the Auth UID as the document ID is deliberate: it means the
 * document ID is a random value the user cannot choose, and it lets the security
 * rules in firestore.rules check "is this document mine?" with a single
 * comparison against request.auth.uid.
 *
 * Nothing here ever touches a password. Firebase Auth owns the password and
 * Firestore never sees it.
 */

/**
 * Creates (or overwrites) the signed-in user's own profile document.
 *
 * `merge: true` means "write these fields, leave anything else alone". It also
 * makes this safe to call a second time, which is what the retry button in
 * SignupScreen relies on after a first attempt failed.
 */
export async function saveUserProfile(uid, email) {
  const userRef = doc(db, 'users', uid);

  await setDoc(
    userRef,
    {
      email,
      // serverTimestamp() asks Firestore's servers for the time, rather than
      // trusting the clock on the user's device.
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );

  return userRef;
}

/**
 * Reads the signed-in user's own profile.
 *
 * Only ever called with the UID of the user who is currently signed in, so the
 * rules allow it and no other user's data is touched. Returns null if the
 * document does not exist (for example if a profile write failed earlier).
 */
export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid));

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() };
}

/**
 * Turns a Firestore Timestamp into something readable.
 * Firestore returns dates as Timestamp objects, not JavaScript Dates, so this
 * conversion has to happen before the value can be shown with toLocaleDateString.
 */
export function formatFirestoreDate(timestamp) {
  if (!timestamp || typeof timestamp.toDate !== 'function') {
    return null;
  }

  return timestamp.toDate().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
