import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

const USERS_COLLECTION = 'users';

export async function findUserByEmail(email) {
  if (!db) {
    throw { code: 'unavailable' };
  }
  const clean = (email || '').trim().toLowerCase();
  const q = query(
    collection(db, USERS_COLLECTION),
    where('email', '==', clean),
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

export async function createUserDocument(email, password) {
  if (!db) {
    throw { code: 'unavailable' };
  }
  const cleanEmail = (email || '').trim().toLowerCase();
  const safePassword = password || '';
  const existing = await findUserByEmail(cleanEmail);
  if (existing) {
    throw { code: 'auth/email-already-in-use' };
  }
  const ref = await addDoc(collection(db, USERS_COLLECTION), {
    email: cleanEmail,
    password: safePassword,
    createdAt: serverTimestamp(),
  });
  return ref;
}

export async function getUserProfileByEmail(email) {
  return findUserByEmail(email);
}

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
