/**
 * Turning Firebase error codes into messages a person can act on.
 *
 * Firebase errors have a short machine-readable `code` such as
 * "auth/email-already-in-use". Showing that raw code to a user would be
 * useless, so it is mapped to a sentence here.
 *
 * Every function returns `fallback` for any code it does not recognise, so a
 * new Firebase error can never leave the user staring at a blank screen.
 */

/** Used by the Signup screen. */
export function getSignupErrorMessage(error) {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'An account already exists with that email address. Try logging in instead.';

    case 'auth/invalid-email':
      return 'That email address is not valid.';

    case 'auth/weak-password':
      return 'That password is too weak. Please use at least 6 characters.';

    case 'auth/missing-password':
      return 'Please enter your password.';

    // This one is worth naming explicitly, because it is almost always a
    // Firebase console setting rather than something the user did wrong.
    case 'auth/operation-not-allowed':
      return 'Email and password sign-up is switched off. Enable it in the Firebase console under Authentication > Sign-in method.';

    case 'auth/network-request-failed':
      return 'Could not reach the network. Check your connection and try again.';

    case 'auth/too-many-requests':
      return 'Too many attempts from this device. Please wait a moment and try again.';

    default:
      return 'Could not create the account. Please try again.';
  }
}

/** Used by the Login screen. */
export function getLoginErrorMessage(error) {
  switch (error?.code) {
    // Firebase only returns this code when it is able to distinguish "no such
    // account" as a separate outcome. Telling the user to sign up in that case
    // is genuinely helpful.
    case 'auth/user-not-found':
      return 'No account was found with that email address. Please sign up first.';

    case 'auth/invalid-email':
      return 'That email address is not valid.';

    // Deliberately NOT saying the account does not exist here. If somebody
    // typed the right email but the wrong password, telling them "no such
    // account" would be a lie and would also let anyone use this form to find
    // out which email addresses are registered.
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/user-disabled':
      return 'Check your email and password, or sign up if you do not have an account yet.';

    case 'auth/too-many-requests':
      return 'Too many attempts from this device. Please wait a moment and try again.';

    case 'auth/network-request-failed':
      return 'Could not reach the network. Check your connection and try again.';

    case 'auth/operation-not-allowed':
      return 'Email and password sign-in is switched off. Enable it in the Firebase console under Authentication > Sign-in method.';

    default:
      return 'Could not log you in. Please try again.';
  }
}

/** Used when writing the Firestore profile fails. */
export function getProfileSaveErrorMessage(error) {
  switch (error?.code) {
    case 'permission-denied':
      return 'Firestore security rules blocked the save. Check that firestore.rules has been published in the Firebase console.';

    case 'unavailable':
    case 'deadline-exceeded':
      return 'Could not reach Firestore. Check your connection and try again.';

    default:
      return 'Could not save your profile to Firestore.';
  }
}
