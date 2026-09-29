# Test record — Task 1

This is an honest record of what was actually run and what was actually
observed. Anything that was not tested is listed as not tested, rather than
assumed to work.

- **Date:** 29 September 2026
- **Firebase project:** `lowkeyreact` (Auth + Firestore in production mode,
  `firestore.rules` published)
- **Platform used for the interactive tests:** Expo web preview
  (`npx expo start --web`), driven in an isolated headless browser
- **Backend tests:** the Firebase JS SDK run directly under Node

> Note: Chrome is not installed on this machine, and Brave/Safari were not
> touched. The interactive tests were run in a separate headless browser started
> for this purpose, which was closed afterwards.

---

## 1. Automated tests

### Validation rules — 25/25 passed

```
$ npm test          # node scripts/test-validation.mjs
```

Covers 5 valid email formats, 8 invalid email formats, the 5/6/7-character
password boundary, whitespace-only passwords, email normalisation, and all six
error messages.

### Theme import check — passed

```
$ node scripts/check-theme-imports.mjs
Checking 15 files for missing theme imports...
  all theme values are properly imported
```

This check was added after a real bug was found (see section 4). It was
verified to actually fail by temporarily introducing a broken file.

### Expo Doctor — 21/21 checks passed

```
$ npx expo-doctor
Running 21 checks on your project...
21/21 checks passed. No issues detected!
```

### Firebase backend and security rules — 13/13 passed

```
$ npm run verify:firebase      # node scripts/verify-firebase-rules.mjs
```

Run against the live project, using the same SDK functions the screens use.

| # | Check | Result | Observed |
| --- | --- | --- | --- |
| 1 | Signup with a brand new email | PASS | account created, uid returned, email lower-cased |
| 2 | Write `users/{own uid}` | PASS | allowed |
| 3 | Read `users/{own uid}` back | PASS | `email` correct, `createdAt` is a real Firestore Timestamp |
| 4 | Duplicate signup rejected | PASS | `auth/email-already-in-use` |
| 5 | Write to **another user's** document | PASS (denied) | `permission-denied` |
| 6 | Write to a **non-users** collection | PASS (denied) | `permission-denied` |
| 7 | Signed-out user reads a profile | PASS (denied) | `permission-denied` |
| 8 | Login with correct password | PASS | signed in, same uid |
| 9 | Login with wrong password | PASS (rejected) | `auth/invalid-credential` |
| 10 | Login with an email that has no account | PASS (rejected) | `auth/invalid-credential` |

**Important finding from test 9 and 10:** Firebase returns the *same* error code,
`auth/invalid-credential`, for "wrong password" and "no such account". It does
**not** return a distinct "user not found" code. This is deliberate — it stops
the login form being used to discover which email addresses are registered. The
UI therefore shows one honest generic message for both cases, and the code path
for `auth/user-not-found` in `authErrors.js` exists only in case Firebase is
configured to return it.

This test script **creates a real test account per run**
(`task1-test-<random>@example.com`). Delete them afterwards — see section 5.

---

## 2. Interactive tests (Expo web preview)

All of the following were performed in the running app and the result was read
back from the rendered page.

| # | Test | Result | How it was confirmed |
| --- | --- | --- | --- |
| 1 | App boots to Login | PASS | Login screen rendered with email, password, Show, Login, "Create an account" |
| 2 | Untouched form shows **no** errors | PASS | no error text present in the page |
| 3 | Untouched form has Login **disabled** | PASS | `aria-disabled="true"`, background `#A9B4CC`, `pointer-events: none` |
| 4 | Invalid email shows an error under **email only** | PASS | "Enter a valid email address, for example example@domain.com" |
| 5 | Button stays disabled while email is invalid | PASS | still `#A9B4CC` |
| 6 | Correcting the email clears its error | PASS | error text gone |
| 7 | Password of **5** characters shows an error under **password only** | PASS | "Password must be at least 6 characters." |
| 8 | Button still disabled at 5 characters | PASS | still `#A9B4CC` |
| 9 | Password of **6** characters clears the error | PASS | error text gone |
| 10 | Button **enables** at 6 characters | PASS | background `#1F4FD8`, `aria-disabled` absent |
| 11 | **Show** reveals the password | PASS | input `type` changed `password` → `text`, value readable |
| 12 | **Hide** masks it again | PASS | input `type` changed back to `password` |
| 13 | Toggle label changes | PASS | "Show password" ↔ "Hide password" |
| 14 | Wrong password for a **real, existing** account | PASS | "Check your email and password, or sign up if you do not have an account yet." Stayed on Login, no navigation |
| 15 | Correct password logs in | PASS | Home screen with the account email |
| 16 | Home reads the Firestore profile | PASS | "Member since — September 29, 2026" shown, which only exists in `users/{uid}` |
| 17 | **Signup** with a brand new email | PASS | account created, navigated to Home, email correct, "Member since" present |
| 18 | **Duplicate signup** rejected | PASS | "An account already exists with that email address. Try logging in instead." Stayed on Signup |
| 19 | **Logout** returns to Login | PASS | "SIGNED IN" gone, "Welcome back" shown |
| 20 | Session survives a page reload | PASS | reloaded, still signed in, went straight to Home |
| 21 | Back cannot reach Home | **PARTIAL** | see note below |
| 22–28 | Loading indicator (spinner) — 7 checks | PASS | see the "Loading indicator" section below |

### Note on test 21 (back button)

On the web preview the browser Back button left the app entirely
(`about:blank`), because `navigation.reset` collapsed the app to a single browser
history entry — which is the desired outcome, but it does **not** prove the
native hardware Back button behaves. `gestureEnabled: false` on the Home screen
disables the swipe-back gesture, and `onAuthStateChanged` resets the stack to
Login whenever the session ends, but the **native hardware back button was not
tested**. This is listed in the README as a device check to perform.

### Loading indicator (re-tested 29 September 2026, after the spinner fix)

The brief's brownie task asks for a visible loading indicator when Login or
Signup is pressed. The first version only disabled the button and drew nothing.
`components/PrimaryButton.js` now renders an `ActivityIndicator` in place of the
title whenever `loading` is true.

The spinner is brief, so it was measured with a `MutationObserver` / 20 ms poller
rather than by eyeballing a screenshot, and the button height was sampled
continuously across the transition.

| # | Check | Result | Evidence |
| --- | --- | --- | --- |
| 22 | Login shows a spinner while the Firebase call is in flight | PASS | `data-testid="login-submit-spinner"`, `role="progressbar"` observed |
| 23 | Signup shows a spinner while the Firebase call is in flight | PASS | `data-testid="signup-submit-spinner"` observed, 101 samples |
| 24 | Logout (secondary variant) shows a spinner | PASS | `data-testid="logout-button-spinner"` observed |
| 25 | **Button height does not change** between idle and loading | PASS | Login/Signup: **all 465 + 101 samples measured exactly 52px**. Logout: 54px in both states (2px extra from its 1px border) |
| 26 | Button is genuinely disabled while loading | PASS | `aria-disabled="true"` and the `disabled` attribute present during the request |
| 27 | Button keeps its accessible name while loading | PASS | `aria-label="Login"` / `aria-label="Signup"` present, since the title text is replaced by the spinner |
| 28 | Spinner is visible against the button background | PASS | Login: white on the blue fill. Logout: `stroke: rgb(31, 79, 216)` (`#1F4FD8`) on transparent — a white spinner would have been invisible there |

A screenshot of the Login spinner in flight was also captured.

Two notes recorded honestly:

- React Native Web does **not** render an `aria-busy` attribute from
  `accessibilityState.busy`. It was checked in the live DOM during loading and
  the attribute was absent. The `busy` flag is still passed because it is the
  correct React Native API, but no web accessibility claim is made for it. The
  loading state is actually conveyed by the `disabled` attribute and by the
  `role="progressbar"` spinner itself.
- The `loading` state on both screens was already wired correctly before this
  change and did not need altering: `LoginScreen` sets it immediately before
  `await signInWithEmailAndPassword` and clears it in `finally`; `SignupScreen`
  does the same around both `createUserWithEmailAndPassword` **and**
  `saveUserProfile`, so the spinner covers the whole two-step signup. The gap
  was only that `PrimaryButton` never drew anything.

### Not tested

- **Narrow / phone-width layout.** The headless browser used here could not be
  resized to a phone viewport, so the layouts were only inspected at desktop
  width (1280×720). The layouts use no fixed widths and the forms are in a
  `ScrollView`, but this needs a real check on a phone.
- **On-screen keyboard behaviour** (`KeyboardAvoidingView`) — web has no
  software keyboard.
- **The partial-signup retry path** (Auth succeeds, Firestore write fails) was
  not triggered, because forcing a Firestore write to fail would mean breaking
  the security rules. The code path exists and is described in the README, but it
  has not been exercised.

---

## 3. Bugs found and fixed during testing

Both of these were found only by actually running the app — neither was caught
by bundling.

### Bug 1 — crash on startup

`components/ShowPasswordToggle.js` used `spacing.md` in its styles but never
imported `spacing`, throwing `ReferenceError: spacing is not defined` when the
module loaded.

**Fix:** import `colors, fontSizes, spacing` from `theme.js`, and use the theme
values instead of the hard-coded `#1F4FD8` and `14` that were there.

**Added:** `scripts/check-theme-imports.mjs`, which catches this class of mistake
statically. It was verified to fail correctly by temporarily reintroducing the
bug.

### Bug 2 — Login/Signup enabled on an empty form

`formIsValid` was computed as:

```js
const formIsValid = emailError === '' && passwordError === '';
```

But an untouched form deliberately shows *no* error messages, so both strings
were `''` and `formIsValid` was `true` — the button was **enabled on an empty
form**, directly contradicting requirement 3 of the brief.

**Fix:** derive validity from the field values, not from whether a message is
currently being displayed:

```js
const formIsValid = isEmailValid(email) && isPasswordValid(password);
```

Confirmed fixed by test 3 and test 8 above.

---

## 4. Console work that was still outstanding

1. **Authentication → Sign-in method → Email/Password** must be enabled.
   Confirmed working, but it has to be done in the console by hand.
2. **Firestore Database → Rules** must have `firestore.rules` published in
   Production mode. This was genuinely blocking: before it was published every
   Firestore read and write returned `permission-denied`, including legitimate
   writes to the user's own profile.
3. **Firestore must not be left in test mode.** Test mode allows anyone to read
   and write the whole database for 30 days.

---

## 5. Test accounts to delete

These were created during testing and should be removed from
**Authentication → Users** in the Firebase console:

- `task1-test-9f3a@example.com`
- `task1-test-mumpdnge@example.com`
- `task1-test-mumpy100@example.com`
- `task1-ui-e75yxd@example.com`

Any others matching `task1-test-*@example.com` or `task1-ui-*@example.com`, from
re-runs of the verification script.

The corresponding `users/{uid}` documents can be deleted from the Firestore
Data tab. Deleting the Auth user first is enough to make the profile orphaned;
delete the documents too if you want a clean database.
