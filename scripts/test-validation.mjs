import {
  isEmailValid,
  normalizeEmail,
  getEmailError,
  getLoginPasswordError,
  isLoginPasswordPresent,
  PASSWORD_RULES,
  getPasswordRuleResults,
  isSignupPasswordValid,
  getSignupPasswordError,
  passwordsMatch,
  getConfirmPasswordError,
  SIGNUP_PASSWORD_MIN,
  SIGNUP_PASSWORD_MAX,
} from '../validation.js';

let passed = 0;
let failed = 0;

function check(label, actual, expected) {
  const ok = actual === expected;
  ok ? passed++ : failed++;
  if (!ok) {
    console.log(`  FAIL  ${label}`);
    console.log(`        expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function ruleMet(id, password) {
  const row = getPasswordRuleResults(password).find((r) => r.id === id);
  return row ? row.isMet : undefined;
}

console.log('\n=== emails that should be accepted ===');
check('example@domain.com', isEmailValid('example@domain.com'), true);
check('subdomains and dots', isEmailValid('a.b@mail.example.co.uk'), true);
check('plus addressing', isEmailValid('user+tag@gmail.com'), true);
check('digits', isEmailValid('123@456.com'), true);
check('surrounded by spaces', isEmailValid('  test@example.com  '), true);

console.log('\n=== emails that should be rejected ===');
check('empty', isEmailValid(''), false);
check('no @', isEmailValid('example.com'), false);
check('no dot in the domain', isEmailValid('a@b'), false);
check('no local part', isEmailValid('@domain.com'), false);
check('no domain', isEmailValid('a@'), false);
check('space inside', isEmailValid('a b@example.com'), false);
check('two @ signs', isEmailValid('a@b@example.com'), false);
check('just an @', isEmailValid('@'), false);

console.log('\n=== email normalisation ===');
check('trims and lower-cases', normalizeEmail('  Test@Example.COM '), 'test@example.com');

console.log('\n=== email error messages ===');
check('empty email', getEmailError(''), 'Email is required.');
check('valid email gives no error', getEmailError('a@b.com'), '');
check('bad email explains itself', getEmailError('nope').includes('valid email'), true);

console.log('\n=== login password: only presence is required ===');
check('empty is not present', isLoginPasswordPresent(''), false);
check('one character is enough to enable the button', isLoginPasswordPresent('a'), true);
check('short weak password still counts as present', isLoginPasswordPresent('123'), true);
check('password with spaces counts as present', isLoginPasswordPresent('   '), true);
check('empty login password error', getLoginPasswordError(''), 'Password is required.');
check('weak but present gives no login error', getLoginPasswordError('123'), '');
check('a 6 character password gives no login error', getLoginPasswordError('123456'), '');
check('a 70 character password gives no login error', getLoginPasswordError('a'.repeat(70)), '');

console.log('\n=== rule boundaries: 7, 8, 64, 65 characters ===');
const seven = 'Abcde1!';
const eight = 'Abcde1!x';
const sixtyFour = 'A1!' + 'b'.repeat(61);
const sixtyFive = 'A1!' + 'b'.repeat(62);
check('7 characters fails the length rule', ruleMet('length', seven), false);
check('7 characters is not a valid signup password', isSignupPasswordValid(seven), false);
check('8 characters passes the length rule', ruleMet('length', eight), true);
check('the 8 character fixture really is 8', eight.length, 8);
check('8 characters with all classes is valid', isSignupPasswordValid(eight), true);
check('9 characters is valid too', isSignupPasswordValid('Abcdef12!'), true);
check('64 characters is the last accepted length', ruleMet('maxLength', sixtyFour), true);
check('64 characters is a valid signup password', isSignupPasswordValid(sixtyFour), true);
check('65 characters fails the max length rule', ruleMet('maxLength', sixtyFive), false);
check('65 characters is not a valid signup password', isSignupPasswordValid(sixtyFive), false);
check('exposed minimum is 8', SIGNUP_PASSWORD_MIN, 8);
check('exposed maximum is 64', SIGNUP_PASSWORD_MAX, 64);

console.log('\n=== uppercase rule ===');
check('has an uppercase letter', ruleMet('uppercase', 'Abcdef1!'), true);
check('no uppercase letter fails', ruleMet('uppercase', 'abcdef1!'), false);
check('uppercase only still passes', ruleMet('uppercase', 'ABCDEFG1!'), true);

console.log('\n=== lowercase rule ===');
check('has a lowercase letter', ruleMet('lowercase', 'Abcdef1!'), true);
check('no lowercase letter fails', ruleMet('lowercase', 'ABCDEF1!'), false);
check('lowercase only still passes', ruleMet('lowercase', 'abcdefg1!'), true);

console.log('\n=== digit rule ===');
check('has a digit', ruleMet('digit', 'Abcdef1!'), true);
check('no digit fails', ruleMet('digit', 'Abcdefg!'), false);
check('0 counts as a digit', ruleMet('digit', 'Abcdef0!'), true);

console.log('\n=== special character rule ===');
for (const ch of ['!', '@', '#', '$', '%', '^', '&', '*', '-', '_', '+', '=', '?', '~']) {
  check(`"${ch}" counts as special`, ruleMet('special', `Abcdef1${ch}`), true);
}
check('no special character fails', ruleMet('special', 'Abcdefg1'), false);
check('a letter is not a special character', ruleMet('special', 'Abcdefg1z'), false);
check('a digit is not a special character', ruleMet('special', 'Abcdefg12'), false);

console.log('\n=== spaces rule ===');
check('no spaces passes', ruleMet('noSpaces', 'Abcdef1!'), true);
check('a leading space fails', ruleMet('noSpaces', ' Abcdef1!'), false);
check('a trailing space fails', ruleMet('noSpaces', 'Abcdef1! '), false);
check('an inner space fails', ruleMet('noSpaces', 'Abc def1!'), false);
check('a tab fails', ruleMet('noSpaces', 'Abc\tdef1!'), false);
check('a newline fails', ruleMet('noSpaces', 'Abc\ndef1!'), false);
check('a password with spaces is not valid', isSignupPasswordValid('Abc def1!'), false);

console.log('\n=== empty and trivial passwords ===');
check('empty fails everything', isSignupPasswordValid(''), false);
check('empty fails length', ruleMet('length', ''), false);
check('empty passes noSpaces', ruleMet('noSpaces', ''), true);
check('empty passes maxLength', ruleMet('maxLength', ''), true);
check('a single character is not valid', isSignupPasswordValid('a'), false);
check('letters and digits only is not valid', isSignupPasswordValid('Password12'), false);

console.log('\n=== the checklist ===');
check('there are 7 rules', PASSWORD_RULES.length, 7);
check('one result per rule', getPasswordRuleResults('Abcdef1!').length, 7);
check('every rule is met for a good password', getPasswordRuleResults('Abcdef1!').every((r) => r.isMet), true);
check('every rule carries a label', getPasswordRuleResults('').every((r) => typeof r.label === 'string' && r.label.length > 0), true);
check('rule ids are unique', new Set(PASSWORD_RULES.map((r) => r.id)).size, 7);

console.log('\n=== signup password error messages ===');
check('valid password gives no error', getSignupPasswordError('Abcdef1!'), '');
check('empty reports the first unmet rule', getSignupPasswordError(''), 'At least 8 characters');
check('a 70 character password reports the length cap', getSignupPasswordError('A1!' + 'b'.repeat(67)), 'No more than 64 characters');
check('a password with a space reports the space rule', getSignupPasswordError('Abc def1!'), 'No spaces');

console.log('\n=== confirm password ===');
check('matching values match', passwordsMatch('Abcdef1!', 'Abcdef1!'), true);
check('different values do not match', passwordsMatch('Abcdef1!', 'Abcdef2!'), false);
check('empty confirmation does not match', passwordsMatch('Abcdef1!', ''), false);
check('empty against empty does not match', passwordsMatch('', ''), false);
check('matching is case sensitive', passwordsMatch('Abcdef1!', 'abcdef1!'), false);
check('matching is whitespace sensitive', passwordsMatch('Abcdef1!', 'Abcdef1! '), false);
check('empty confirmation error', getConfirmPasswordError('Abcdef1!', ''), 'Confirm your password.');
check('mismatch error', getConfirmPasswordError('Abcdef1!', 'Abcdef2!'), 'Passwords do not match.');
check('match gives no error', getConfirmPasswordError('Abcdef1!', 'Abcdef1!'), '');

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
