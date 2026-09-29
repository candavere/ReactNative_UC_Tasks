/**
 * Tests for validation.js.
 *
 * These are pure functions with no network access, so they run instantly and
 * need no Firebase project:
 *
 *   node scripts/test-validation.mjs
 *
 * Exits non-zero if any assertion fails.
 */
import {
  isEmailValid,
  isPasswordValid,
  normalizeEmail,
  getEmailError,
  getPasswordError,
} from '../validation.js';

let passed = 0;
let failed = 0;

function check(label, actual, expected) {
  const ok = actual === expected;
  ok ? passed++ : failed++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) {
    console.log(`        expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
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

console.log('\n=== passwords ===');
check('5 characters is too short', isPasswordValid('12345'), false);
check('6 characters is allowed', isPasswordValid('123456'), true);
check('7 characters is allowed', isPasswordValid('1234567'), true);
check('a space counts as a character', isPasswordValid('     1'), true);
check('empty is too short', isPasswordValid(''), false);

console.log('\n=== email normalisation ===');
check('trims and lower-cases', normalizeEmail('  Test@Example.COM '), 'test@example.com');

console.log('\n=== error messages ===');
check('empty email', getEmailError(''), 'Email is required.');
check('valid email gives no error', getEmailError('a@b.com'), '');
check('bad email explains itself', getEmailError('nope').includes('valid email'), true);
check('empty password', getPasswordError(''), 'Password is required.');
check('short password', getPasswordError('12345'), 'Password must be at least 6 characters.');
check('valid password gives no error', getPasswordError('123456'), '');

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
