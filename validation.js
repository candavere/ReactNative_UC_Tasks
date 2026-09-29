/**
 * Email and password validation rules.
 *
 * These live in their own file because both Login and Signup use exactly the
 * same two rules. Keeping them here means the rule is written once, so Login
 * and Signup can never accidentally disagree with each other.
 */

// A deliberately simple, practical email check: something, then @, then
// something, then a dot, then something. None of the parts may contain spaces.
//
// This is not a full RFC 5322 email parser, and it does not need to be. Writing
// a correct email parser is famously hard, and the only real test of an address
// is whether mail can be delivered to it. Firebase performs its own server-side
// check, so anything this lets through is still validated by Firebase.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Firebase Authentication requires at least 6 characters.
const MIN_PASSWORD_LENGTH = 6;

/**
 * Turns what the user typed into the form Firebase wants.
 *
 * People often type a trailing space or capitalise the first letter by accident.
 * Trimming and lower-casing means "  Test@Example.com " and "test@example.com"
 * are treated as the same account, which stops a user being told their email is
 * already taken when it is actually their own typing.
 */
export function normalizeEmail(rawEmail) {
  return rawEmail.trim().toLowerCase();
}

/** True if the email looks like a usable email address. */
export function isEmailValid(rawEmail) {
  return EMAIL_PATTERN.test(rawEmail.trim());
}

/**
 * True if the password is long enough.
 *
 * The password is measured exactly as typed. We deliberately do NOT trim it or
 * change its case, because every character is part of the password - a leading
 * space or a capital letter is a real part of what the user chose.
 */
export function isPasswordValid(password) {
  return password.length >= MIN_PASSWORD_LENGTH;
}

/** The message shown under the email field. */
export function getEmailError(rawEmail) {
  if (rawEmail.length === 0) {
    return 'Email is required.';
  }
  if (!isEmailValid(rawEmail)) {
    return 'Enter a valid email address, for example example@domain.com';
  }
  return '';
}

/** The message shown under the password field. */
export function getPasswordError(password) {
  if (password.length === 0) {
    return 'Password is required.';
  }
  if (!isPasswordValid(password)) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return '';
}

export { MIN_PASSWORD_LENGTH };
