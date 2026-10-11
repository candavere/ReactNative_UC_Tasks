const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UPPERCASE_PATTERN = /[A-Z]/;
const LOWERCASE_PATTERN = /[a-z]/;
const DIGIT_PATTERN = /[0-9]/;
const SPECIAL_PATTERN = /[^A-Za-z0-9]/;
const WHITESPACE_PATTERN = /\s/;

export const SIGNUP_PASSWORD_MIN = 8;
export const SIGNUP_PASSWORD_MAX = 64;

export function normalizeEmail(rawEmail) {
  return rawEmail.trim().toLowerCase();
}

export function isEmailValid(rawEmail) {
  return EMAIL_PATTERN.test(rawEmail.trim());
}

export function isLoginPasswordPresent(password) {
  return password.length > 0;
}

export function getEmailError(rawEmail) {
  if (rawEmail.length === 0) {
    return 'Email is required.';
  }
  if (!isEmailValid(rawEmail)) {
    return 'Enter a valid email address, for example example@domain.com';
  }
  return '';
}

export function getLoginPasswordError(password) {
  if (password.length === 0) {
    return 'Password is required.';
  }
  return '';
}

export const PASSWORD_RULES = [
  {
    id: 'length',
    label: 'At least 8 characters',
    isMet: (password) => password.length >= SIGNUP_PASSWORD_MIN,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    isMet: (password) => UPPERCASE_PATTERN.test(password),
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    isMet: (password) => LOWERCASE_PATTERN.test(password),
  },
  {
    id: 'digit',
    label: 'One number',
    isMet: (password) => DIGIT_PATTERN.test(password),
  },
  {
    id: 'special',
    label: 'One special character',
    isMet: (password) => SPECIAL_PATTERN.test(password),
  },
  {
    id: 'noSpaces',
    label: 'No spaces',
    isMet: (password) => !WHITESPACE_PATTERN.test(password),
  },
  {
    id: 'maxLength',
    label: 'No more than 64 characters',
    isMet: (password) => password.length <= SIGNUP_PASSWORD_MAX,
  },
];

export function getPasswordRuleResults(password) {
  return PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    isMet: rule.isMet(password),
  }));
}

export function isSignupPasswordValid(password) {
  return PASSWORD_RULES.every((rule) => rule.isMet(password));
}

export function getSignupPasswordError(password) {
  const unmet = PASSWORD_RULES.filter((rule) => !rule.isMet(password));
  if (unmet.length === 0) {
    return '';
  }
  return unmet[0].label;
}

export function passwordsMatch(password, confirmation) {
  return confirmation.length > 0 && password === confirmation;
}

export function getConfirmPasswordError(password, confirmation) {
  if (confirmation.length === 0) {
    return 'Confirm your password.';
  }
  if (password !== confirmation) {
    return 'Passwords do not match.';
  }
  return '';
}
