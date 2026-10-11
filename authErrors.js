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
    case 'auth/operation-not-allowed':
      return 'Email and password sign-up is switched off. Enable it in the Firebase console under Authentication > Sign-in method.';
    case 'auth/network-request-failed':
      return 'Could not reach the network. Check your connection and try again.';
    case 'permission-denied':
      return 'The database refused the request. Check the Firestore security rules in the Firebase console.';
    case 'unavailable':
    case 'deadline-exceeded':
      return 'Could not reach the database. Check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts from this device. Please wait a moment and try again.';
    default:
      return 'Could not create the account. Please try again.';
  }
}

export function getLoginErrorMessage(error) {
  switch (error?.code) {
    case 'auth/user-not-found':
      return 'No account was found with that email address. Please sign up first.';
    case 'auth/invalid-email':
      return 'That email address is not valid.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/user-disabled':
      return 'Check your email and password, or sign up if you do not have an account yet.';
    case 'auth/too-many-requests':
      return 'Too many attempts from this device. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Could not reach the network. Check your connection and try again.';
    case 'permission-denied':
      return 'The database refused the request. Check the Firestore security rules in the Firebase console.';
    case 'unavailable':
    case 'deadline-exceeded':
      return 'Could not reach the database. Check your internet connection and try again.';
    case 'auth/operation-not-allowed':
      return 'Email and password sign-in is switched off. Enable it in the Firebase console under Authentication > Sign-in method.';
    default:
      return 'Could not log you in. Please try again.';
  }
}

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
