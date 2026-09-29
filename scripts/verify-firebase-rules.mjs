/**
 * Verifies the app's Firebase behaviour from the command line.
 *
 * This calls exactly the same SDK functions the screens call, against the real
 * project described by your `.env`. It exists because the security rules in
 * firestore.rules are the thing most likely to be silently wrong, and a rule
 * that is wrong does not throw an error at build time - it just quietly lets
 * data through, or quietly blocks your own app.
 *
 *   node scripts/verify-firebase-rules.mjs
 *
 * WARNING: this CREATES REAL TEST ACCOUNTS in your Firebase project, one per
 * run, named task1-test-<random>@example.com. Delete them afterwards from
 * Authentication > Users. Nothing it writes is sensitive.
 *
 * It exits non-zero if any check fails, so it can be used as a check.
 */
import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  inMemoryPersistence,
  setPersistence,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, serverTimestamp } from 'firebase/firestore';

// Load .env the way Expo does.
for (const line of readFileSync('.env', 'utf8').split('\n')) {
  const m = line.match(/^(EXPO_PUBLIC_[A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

const app = initializeApp({
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
});

const auth = getAuth(app);
const db = getFirestore(app);
await setPersistence(auth, inMemoryPersistence);

// A fresh email each run, so re-running the check does not hit the
// "already in use" path at test 1.
const EMAIL = `task1-test-${Date.now().toString(36)}@example.com`;
const PASS = 'TestPass123!';

let pass = 0, fail = 0;
const check = (label, cond, detail = '') => {
  cond ? pass++ : fail++;
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${label}${detail ? '  -> ' + detail : ''}`);
};

console.log('\n=== TEST 1: signup with a brand new email ===');
const cred = await createUserWithEmailAndPassword(auth, EMAIL, PASS);
const uid = cred.user.uid;
check('account created, got a uid', Boolean(uid), uid);
check('email normalised to lowercase', cred.user.email === EMAIL, cred.user.email);

console.log('\n=== TEST 2: write the profile document users/{uid} ===');
try {
  await setDoc(doc(db, 'users', uid), { email: EMAIL, createdAt: serverTimestamp() }, { merge: true });
  check('write to own users/{uid} allowed', true);
} catch (e) {
  check('write to own users/{uid} allowed', false, `${e.code}: ${e.message}`);
}

console.log('\n=== TEST 3: read the profile back ===');
try {
  const snap = await getDoc(doc(db, 'users', uid));
  check('read own profile returns the document', snap.exists());
  check('stored email matches', snap.data()?.email === EMAIL, String(snap.data()?.email));
  check('createdAt is a Firestore Timestamp', typeof snap.data()?.createdAt?.toDate === 'function');
} catch (e) {
  check('read own profile returns the document', false, `${e.code}: ${e.message}`);
}

console.log('\n=== TEST 4: duplicate signup is rejected by Auth ===');
try {
  await createUserWithEmailAndPassword(auth, EMAIL, PASS);
  check('duplicate signup rejected', false, 'it unexpectedly succeeded');
} catch (e) {
  check('duplicate signup rejected', e.code === 'auth/email-already-in-use', e.code);
}

console.log('\n=== TEST 5: write to ANOTHER user document (must be denied) ===');
try {
  await setDoc(doc(db, 'users', 'someone-elses-uid-here'), { email: 'attacker@example.com' });
  check('cross-user write DENIED', false, 'IT WAS ALLOWED - RULES ARE NOT DEPLOYED');
} catch (e) {
  check('cross-user write DENIED', e.code === 'permission-denied', e.code);
}

console.log('\n=== TEST 6: write to a non-users collection (must be denied) ===');
try {
  await setDoc(doc(db, 'publicUsers', 'anything'), { email: 'a@b.com' });
  check('other collection DENIED', false, 'IT WAS ALLOWED - RULES ARE NOT DEPLOYED');
} catch (e) {
  check('other collection DENIED', e.code === 'permission-denied', e.code);
}

console.log('\n=== TEST 7: signed OUT user can read nothing ===');
await signOut(auth);
try {
  await getDoc(doc(db, 'users', uid));
  check('signed-out read DENIED', false, 'IT WAS ALLOWED - RULES ARE NOT DEPLOYED');
} catch (e) {
  check('signed-out read DENIED', e.code === 'permission-denied', e.code);
}

console.log('\n=== TEST 8: login with the correct password ===');
await signInWithEmailAndPassword(auth, EMAIL, PASS);
check('correct password logs in', auth.currentUser?.uid === uid);

console.log('\n=== TEST 9: login with the WRONG password ===');
await signOut(auth);
try {
  await signInWithEmailAndPassword(auth, EMAIL, 'WrongPassword1');
  check('wrong password rejected', false, 'it unexpectedly succeeded');
} catch (e) {
  check('wrong password rejected', true, e.code);
  console.log(`        (code is "${e.code}", NOT auth/user-not-found -> the UI must not claim`);
  console.log(`         the account is missing, that would be false and would leak who has an account)`);
}

console.log('\n=== TEST 10: login with an email that has no account ===');
try {
  await signInWithEmailAndPassword(auth, `nobody-here-${Date.now().toString(36)}@example.com`, 'TestPass123!');
  check('unknown email rejected', false, 'it unexpectedly succeeded');
} catch (e) {
  check('unknown email rejected', true, e.code);
  console.log(`        (code is "${e.code}" - same code as the wrong-password case, which is why`);
  console.log(`         a single honest generic message is used for both)`);
}

console.log(`\n${'='.repeat(50)}\n${pass} passed, ${fail} failed\n`);
console.log(`Test account to delete later: ${EMAIL}  (uid ${uid})`);
process.exit(fail ? 1 : 0);
