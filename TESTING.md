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

### Validation rules — 94/94 passed

```
$ npm test          # node scripts/test-validation.mjs
```

Covers 5 valid email formats, 8 invalid email formats, email normalisation, the
login presence-only rule, all seven signup password rules with their pass and
fail cases, the 7/8 and 64/65 length boundaries, 14 different special characters,
spaces / tabs / newlines, and confirm-password matching (including case and
whitespace sensitivity).

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
| 29–39 | Orientation and resizing — 11 checks | PASS | see the "Orientation and resizing" section below |
| 40–49 | Signup password rules and visual polish — 10 checks | PASS | see the "Signup password rules and visual polish" section below |

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
| 25 | **Button height does not change** between idle and loading | PASS | Originally measured at exactly 52px. **Re-measured at 54px after the type-scale change** (the body line height went from 20 to 22, so 16 + 16 + 22 = 54), still identical in both states. Logout: 56px, 2px extra from its 1px border. |
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

### Orientation and resizing (re-tested 29 September 2026)

`app.json` was changed to `"orientation": "default"`, `ios.requireFullScreen` was
set to `false`, `android.softwareKeyboardLayoutMode` was set to `resize`, and all
three screens were moved into a shared responsive `components/Screen.js`.

The headless browser used here cannot be resized directly, so the app was loaded
in a same-origin iframe sized to exact CSS pixels. That gives a true viewport for
`useWindowDimensions()`, and it also allows the app's DOM to be inspected. That
harness was temporary and has been deleted; it is not part of the project.

Values were entered by dispatching real `input` events on the DOM inputs, which
is what React's `onChange` listens to. That exercises the app's state handling,
but it is not the same as physical keystrokes, so real typing remains a device
check.

| # | Check | Result | Evidence |
| --- | --- | --- | --- |
| 29 | No horizontal overflow at any size | PASS | `documentElement.scrollWidth` never exceeded the viewport width, and no element crossed the right edge, on Login, Signup and Home at all three sizes |
| 30 | Login 390×844 portrait | PASS | form centred, no clipping |
| 31 | Login 844×390 landscape | PASS | content column capped at 520px and centred; scrollable; Login button reachable after scrolling |
| 32 | Login 320×640 narrow | PASS | fits without scrolling, no clipping |
| 33 | Signup at all three sizes | PASS | same results as Login |
| 34 | Home at 390×844 and 844×390 | PASS | card centred, Logout reachable after scrolling |
| 35 | Typed email and password survive resizing | PASS | values identical before and after 844×390 → 320×640 → 390×844 → 844×390 |
| 36 | Show/hide password toggle survives resizing | PASS | input stayed `type="text"` and the label stayed "Hide" across three resizes |
| 37 | Touched / error state survives resizing | PASS | an invalid email kept its error message through resizes |
| 38 | Signed-in session survives resizing | PASS | Home still showed the email and "Member since" after six resizes |
| 39 | No console errors or warnings during rotation | PASS | `console.error` and `console.warn` were hooked on the app's window; **0 messages** across 15 resizes on all three screens |

#### A real bug this testing found

The first version of the responsive layout did not scroll at all in landscape.
The React Navigation stack card is sized to its content (`flex: 0 0 auto`), so the
whole `flex: 1` chain below it grew to fit the form: in a 390px-tall landscape
window the `ScrollView` measured 412px of content inside a 412px viewport, which
meant `scrollHeight === clientHeight`, nothing could scroll, and the bottom of
the Login button sat permanently out of reach below the fold.

Fixed by giving the card `flex: 1, minHeight: 0` in the navigator's `cardStyle`,
which bounds it to the viewport. After the fix the same landscape measurement is
326px of viewport against 412px of content — 86px of scroll, and the button is
reachable.

#### Measured while fixing that

To be sure the spinner work had not regressed, the button height was sampled
continuously across the loading transition. After the type-scale change it
measured exactly 54px in both states, so it still does not move.

### Signup password rules and visual polish (re-tested 29 September 2026)

Signup gained a seven-rule password policy, a Confirm password field with its
own Show / Hide toggle, and a live checklist. Login deliberately did **not** gain
the new rules.

| # | Check | Result | Evidence |
| --- | --- | --- | --- |
| 40 | Signup password rules, automated | PASS | 94/94 assertions, including the 7/8/64/65 length boundaries, every special character, spaces, tabs, newlines, and confirm matching |
| 41 | Checklist is empty-safe | PASS | with an empty password, "No spaces" and "No more than 64 characters" show Met, the other five show Not met |
| 42 | Checklist flips live as the password is typed | PASS | `Abcdef1` → 4 met / 3 not met; `Abcdef1!` → 7 met / 0 not met |
| 43 | Rule state is not colour-only | PASS | each row shows a `✓` or `•` mark **and** the words "Met" / "Not met" **and** a colour |
| 44 | Signup button disabled until every rule passes | PASS | `aria-disabled="true"` at partial validity and on a confirm mismatch; absent and the button turns the accent blue when valid |
| 45 | Confirm mismatch is reported | PASS | "Passwords do not match." under the confirm field, button still disabled |
| 46 | Login does **not** apply the new rules | PASS | a 3-character password `abc` enables the Login button; no checklist, no confirm field, only 2 inputs |
| 47 | Login still shows the generic Firebase error | PASS | wrong password produced "Check your email and password, or sign up if you do not have an account yet." |
| 48 | Signup still works end to end | PASS | a new account was created and `users/{uid}` was written — Home showed the email and "Member since" |
| 49 | No horizontal overflow after the redesign | PASS | `scrollWidth` never exceeded the viewport on any screen at 390×844 or 844×390 |

The button height was re-measured after the type scale changed: it is now 54px
(16 + 16 + 22) in both the idle and loading states, still not moving.

### Not tested

- **On-screen keyboard behaviour.** The web preview has no software keyboard, so
  `KeyboardAvoidingView` could not be exercised. This is the main thing to check
  on a real phone.
- **Physical device rotation.** Resizing an iframe exercises the same React and
  layout code, but a real rotation on iOS and Android also goes through the
  platform's own configuration-change handling.
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

### Bug 3 — the documentation showed the buggy validity derivation

The README contained a code sample reading
`const formIsValid = emailError === '' && passwordError === ''`, which is the
version from Bug 2 — the one that left the button enabled on an empty form. The
code was already fixed; the documentation was not, and would have described
behaviour the app no longer had. Corrected to show the derivation that is
actually used.

### Bug 4 — the form could not scroll in landscape

The React Navigation stack card is sized to its content, so the responsive layout
grew past the viewport and the ScrollView never became scrollable. The bottom of
the Login button was permanently out of reach on a landscape phone. Fixed by
bounding the card with `flex: 1, minHeight: 0`. Full detail and measurements are
in the "Orientation and resizing" section above.

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
