# React Native Task 1 — Login and Signup with Firebase

A small Expo app with three screens: **Login**, **Signup** and **Home**. It uses
Firebase Authentication to check email and password, and Cloud Firestore to store
a small, non-sensitive profile for each user.

```
Login  ──"Create an account"──►  Signup
  ▲                                  │
  │                                  │ (successful signup)
  │                                  ▼
  └────────── "Log in" link ──────  Home  ──"Logout"──►  Login
```

---

## 1. The one design decision worth explaining

The handout says:

> *Signup screen — check if number/email already exists in Firestore.*
> *Login Screen — Check Firestore for the user credentials.*

This app does **not** store passwords in Firestore, and it does not query a list
of users. Here is the reasoning in plain words.

**Firestore is a document database, not a safe.** It has no concept of a secret.
Anything written to it is, by default, readable by anyone who has the Firebase
config — and the Firebase config is *supposed* to be public, because it ships
inside every app that uses Firebase. If the password were in Firestore, then the
password would effectively be public, and so would every other user's.

**Firebase Authentication is the component built for this job.** It hashes the
password on Google's own servers, stores only the hash, checks a login against
that hash, and hands the app a signed-in session. The plain password never
reaches Firestore and never comes back out of Firebase.

So the same intent is met by splitting the two jobs:

| The brief's wording | What this app actually does |
| --- | --- |
| "check if email already exists in Firestore" | `createUserWithEmailAndPassword` — Firebase checks for a duplicate email itself and rejects it with `auth/email-already-in-use` |
| "check Firestore for the user credentials" | `signInWithEmailAndPassword` — Firebase checks the password against its stored hash |
| "create new user" | Firebase creates the account; `users/{uid}` is then written with the email and signup date |

**Why not query Firestore first, before signing up?** Two reasons:

1. It does not work. A read-before-write is a *race* — two people could pass the
   check at the same moment and both get an account. Firebase Auth enforces
   uniqueness on its own servers, so there is no window to lose.
2. It leaks information. A screen that says "that email is already registered" is
   a way for anyone to find out whether a given person has an account here.
   Letting Firebase answer privately is better.

This is a **deliberate, researched departure from the literal wording of the
brief.** It is documented here rather than hidden, and it is safe to explain in
a viva: the brief's *goal* is "one account per email, and the right password gets
you in", and that goal is met — just by the component that is actually designed
for it, with the password handled properly.

---

## 2. What you need

- Node.js 20 or newer (this was built on Node 26.7.0)
- The Expo Go app on your phone, **or** a browser for the web preview
- A free Firebase project

---

## 3. Firebase console setup

These steps have to be done by hand in the browser. None of them can be done from
the project files.

### 3.1 Create the project

1. Go to <https://console.firebase.google.com> and sign in.
2. Click **Add project**, give it a name, and disable Google Analytics (not needed).
3. Wait for the project to finish creating.

### 3.2 Register a Web app and get the client config

1. On the project overview page, click the **`</>` (Web)** icon to register a web
   app. Give it a nickname and do **not** tick "also set up Firebase Hosting".
2. Firebase shows a `firebaseConfig` object. Copy the six values:
   `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`,
   `appId`.
3. Keep this tab open — you need it in the next step.

### 3.3 Turn on Email/Password sign-in

1. In the left sidebar click **Build → Authentication**.
2. Click **Get started** if prompted.
3. Open the **Sign-in method** tab.
4. Click **Email/Password** in the provider list.
5. Tick **Enable**, then click **Save**.

### 3.4 Create the Firestore database

1. In the left sidebar click **Build → Firestore Database**.
2. Click **Create database**.
3. Choose a **location** (pick the one nearest you; it cannot be changed later).
4. **Important:** choose **Production mode**, *not* test mode. See section 6.
5. Click **Create**.

### 3.5 Publish the security rules

1. Still on the Firestore Database page, open the **Rules** tab.
2. Make sure **Production mode** is selected.
3. Open `firestore.rules` from this project and paste the whole file into the
   editor.
4. Click **Publish**.

Without this step the app will create accounts but will not be able to save any
profiles, and you will see a `permission-denied` error.

---

## 4. Environment variables

The Firebase config is not typed into the source. It is read from a `.env` file.

```bash
cp .env.example .env
```

Then open `.env` and fill in the six values from step 3.2:

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

`.env` is listed in `.gitignore` and is never committed. `.env.example` is
committed and contains placeholders only.

### Are these values secret? No — and that is fine

Any variable whose name starts with `EXPO_PUBLIC_` is inlined into the
JavaScript bundle by Expo. That means anybody who has the app can read these
values. **This is expected and it is not a security problem**, because Firebase
web config values are designed to be public — Firebase identifies your project
by them, it does not authenticate you with them.

What actually protects the data is:

1. **Firebase Authentication**, which holds the password hashes, and
2. **the Firestore security rules** in `firestore.rules`, which decide who may
   read and write which document.

A real secret would be a service account key, an admin SDK credential, or an API
server key with admin privileges. **None of those belong in this project**, and
none are present in it. If you ever find yourself pasting a `private_key` field
into a mobile app, stop — that is a serious mistake.

### If `.env` is missing

The app does not crash and does not pretend to work. `firebaseConfig.js` exports
`isFirebaseConfigured`, and `App.js` shows a "Firebase is not set up yet" screen
explaining exactly which file to create. Without this, the only symptom would be
a confusing network error the first time you pressed a button.

---

## 5. Running it

```bash
npm install          # first time only
npx expo start       # then press "i" for iOS, "a" for Android, or scan the QR code
```

Other options:

```bash
npx expo start --web     # browser preview
npx expo start -c        # clear the bundler cache (do this after editing .env)
```

To use a physical phone, install **Expo Go**, make sure the phone and the
computer are on the same Wi-Fi, and scan the QR code shown by `npx expo start`.

> Changing anything in `.env` requires restarting with `npx expo start -c`.
> Expo reads the file when the bundle is built, and the cache will otherwise
> keep the old values.

---

## 6. Firestore security rules

The rules live in `firestore.rules` and are deployed by hand (section 3.5).

**Test mode must not be left on.** When you create a Firestore database, Firebase
offers test mode, which allows anyone to read and write the whole database for 30
days, and then locks it. If a deadline is missed, the database silently becomes
read-only, or — if it was never secured — remains wide open. The rules in this
project close every path except a user's own profile document.

What the rules allow:

| Action | Allowed? |
| --- | --- |
| Signed-in user reads `users/{their own uid}` | yes |
| Signed-in user creates `users/{their own uid}` with only `email` + `createdAt` | yes |
| Signed-in user writes to `users/{someone else's uid}` | **no** |
| Signed-in user writes to any other collection | **no** |
| Signed-out user reads or writes anything | **no** |
| Any user deletes a document | **no** |

The `hasOnly([...])` check is worth calling out: without it, a user could add
extra fields to their own document. Firestore rules are not a schema, so what is
*not* explicitly allowed has to be explicitly forbidden.

---

## 7. File map

Every file in the project, and what it is for.

| Path | Purpose |
| --- | --- |
| `index.js` | Entry point named in `package.json`. Registers `App` as the root component. |
| `App.js` | The navigator. Holds the auth-state listener that decides whether to start on Login or Home, and resets the stack to Login on sign-out. |
| `app.json` | Expo app configuration. `orientation` is `default` so both portrait and landscape are allowed, `ios.requireFullScreen` is `false` so iPad Split View does not lock rotation, and `android.softwareKeyboardLayoutMode` is `resize`. |
| `firebaseConfig.js` | Reads the six `EXPO_PUBLIC_FIREBASE_*` values from the environment and exports `auth`, `db` and `isFirebaseConfigured`. |
| `theme.js` | The single source of typography (family, sizes, weights, line heights), colours, spacing, radii and touch-target sizes. |
| `validation.js` | Pure functions: the email rules, the seven signup password rules, login's presence-only check, confirm-password matching, and the messages for each. |
| `authErrors.js` | Turns Firebase error codes (`auth/email-already-in-use`, …) into readable sentences. |
| `userProfile.js` | The only file that talks to Firestore. Saves and reads `users/{uid}`. |
| `firestore.rules` | Firestore security rules. Deployed by hand through the console. |
| `.env.example` | The template for `.env`, with placeholders. Committed. |
| `.env` | Your real Firebase config. Git-ignored. |
| `.gitignore` | Keeps `.env`, `node_modules` and other local files out of git. |
| `TESTING.md` | The full record of what was tested, what failed, and what was not verified. |
| `scripts/test-validation.mjs` | Automated tests for `validation.js`. Run with `npm test`. |
| `scripts/verify-firebase-rules.mjs` | Live checks of Auth behaviour and the Firestore rules. Run with `npm run verify:firebase`. Creates real test accounts. |
| `scripts/check-theme-imports.mjs` | Static check for theme values used without being imported. |
| `screens/LoginScreen.js` | The login form. |
| `screens/SignupScreen.js` | The signup form, including the retry path for a failed profile write. |
| `screens/HomeScreen.js` | Shows the signed-in email and signup date, plus Logout. |
| `components/FormField.js` | A labelled input with an error message underneath. |
| `components/FormBanner.js` | The red banner for whole-form errors from the backend. |
| `components/PrimaryButton.js` | The main button, plus the `TextLink` used for "Sign up" / "Log in". Swaps its label for a spinner while `loading` is true. |
| `components/ShowPasswordToggle.js` | The Show / Hide control for the password field. |
| `components/LoadingView.js` | Centred plain-text message shown while Firebase reports whether a session already exists. It deliberately contains no spinner — the spinners live in `PrimaryButton`, where a request is actually in flight. |
| `components/Screen.js` | The responsive shell every screen uses: safe area, keyboard avoidance, and a scrolling, width-capped content column. |
| `components/PasswordChecklist.js` | The live rule-by-rule checklist under the Signup password field. |

### Why so many small files?

- `validation.js` and `authErrors.js` exist so Login and Signup cannot disagree
  about what counts as a valid email or how an error is worded. The rule is
  written once.
- `components/FormField.js` exists because both screens need an input with a
  label and an error underneath. Writing it twice would guarantee the two drift
  apart.
- `userProfile.js` exists so that the Firestore document path `users/{uid}` is
  written in exactly one place. If the path or the field names ever change,
  there is a single place to change — and a single place that could accidentally
  start storing something sensitive.
- `scripts/` holds three check scripts, each runnable on its own. They were added
  because two real bugs got through bundling and were only caught by running the
  app and by testing against Firebase directly.

There is no global state library, no UI framework, and no validation library. The
state in this app is four `useState` hooks per screen, which is easy to follow.

---

## 8. Screen flow

### Login

1. Email and password fields with live validation.
2. Errors appear **only after** you have interacted with a field or pressed
   Login — an untouched empty form stays quiet.
3. The **Login** button is genuinely `disabled` while the form is invalid, so a
   stray double tap cannot fire a request.
4. **Show / Hide** toggles `secureTextEntry`.
5. While the request is in flight the button swaps its label for a spinner
   (`ActivityIndicator`), stays disabled so it cannot be double-submitted, and
   keeps exactly the same height so nothing jumps.
6. On success: `navigation.reset` to Home. On failure: a banner above the button
   explaining what went wrong.

### Signup

The same form, plus one extra case. Signup is two operations:

1. `createUserWithEmailAndPassword` — creates the account and signs you in.
2. `saveUserProfile` — writes `users/{uid}` to Firestore.

If step 1 succeeds but step 2 fails, the account **does** exist and you **are**
signed in. Presenting that as a failed signup would be a lie, and pressing
"Signup" again would just fail with "email already in use" and lock the user out.

So the screen detects this case and swaps to a different view: *"Your account was
created, but your profile could not be saved."* with a **Retry saving profile**
button that retries **only** the Firestore write, using whoever is signed in. It
never calls the signup function a second time, so a second account cannot be
created.

### Home

Shows the signed-in email, the signup date read from `users/{uid}`, and a
**Logout** button.

### Not being able to get back into Home

Three things stop a signed-out user from reaching Home with the Back button:

1. `navigation.reset` after a successful login clears the whole stack, so there
   is nothing behind Home to go back to.
2. The Home screen sets `gestureEnabled: false`, so the swipe-back gesture does
   nothing.
3. An `onAuthStateChanged` listener in `App.js` resets the stack to Login
   whenever the Firebase session ends — whether that was the Logout button or
   Firebase revoking the session itself.

---

## 9. Orientation and resizing

The app works in portrait, in landscape, and at narrow widths, and nothing is
lost when the window changes size.

### Allowing rotation

`app.json` sets `"orientation": "default"`, which is what lets the app use both
portrait and landscape. Two related settings matter as well:

- `ios.requireFullScreen: false`. If this were `true`, iOS would run the app
  full screen and lock the orientation on iPad, so Split View and Slide Over
  rotation would be blocked.
- `android.softwareKeyboardLayoutMode: "resize"`. On Android the keyboard
  shrinks the window itself. The `KeyboardAvoidingView` therefore only adds
  padding on iOS (`behavior={Platform.OS === 'ios' ? 'padding' : undefined}`).
  Giving Android a `behavior` as well would apply the offset twice and push the
  form too far up.

### How the layout responds

All three screens render inside `components/Screen.js`, which does four things:

1. **`useWindowDimensions()`** for the current size, rather than
   `Dimensions.get('window')` at module load. A module-level read is taken once
   when the file is first evaluated and is never updated, so a rotation would
   leave the app sizing itself against stale numbers.
2. **A scrolling column capped at 520px wide** (`contentMaxWidth` in `theme.js`),
   centred by
   `alignItems: 'center'`. On a phone in portrait the form uses the full width;
   in landscape, or on a tablet, the extra width becomes margin instead of
   absurdly long input boxes.
3. **A `ScrollView` with `keyboardShouldPersistTaps="handled"`**, so the form
   can be scrolled even while the keyboard is open, and the first tap on a
   button still registers instead of only dismissing the keyboard.
4. **`flexGrow` on the content rather than `justifyContent: 'center'` on the
   scroll container.** Centring the scroll container is a well-known trap: when
   the content is taller than the viewport, the overflow is cut off the *top* and
   cannot be scrolled to. `flexGrow` lets short content centre itself while tall
   content simply grows and scrolls normally.

When the window is shorter than 520px — which is what landscape on a phone
usually is — the vertical padding shrinks and the screen title steps down from
`title` to `titleCompact` so that less vertical space is wasted.

### Why state survives a rotation

Rotation is only a layout change. Nothing in the tree is keyed by orientation
and no branch of any render depends on it, so React does not unmount and
remount the screen components — which is what would throw the form away. The
typed email and password, the touched flags, the error messages, the show/hide
toggle, the loading spinner and the Firebase session are all ordinary component
state or module state, so they all persist.

This was verified by filling in the forms, toggling the password, and then
resizing repeatedly: the values and the toggle state were still there
afterwards. See `TESTING.md`.

One honest caveat: on **Android**, if the operating system kills and recreates
the app to reclaim memory, the React tree is rebuilt and in-memory state is
gone. That is platform behaviour, not something this code can prevent, and it is
the same reason the Firebase session does not survive closing Expo Go.

---

## 10. The two brownie-task features

The brief lists two extra features. Here is exactly where each one lives.

**Show / Hide password toggle** — `components/ShowPasswordToggle.js`. It is
rendered as the right-hand adornment of the password field
(`rightAdornment` on `components/FormField.js`) and flips a single piece of
state, `showPassword`. The input's `secureTextEntry={!showPassword}` does the
actual masking. The control carries `accessibilityLabel` and
`accessibilityState.selected`, so a screen reader announces "Hide password" when
the password is visible.

**Loading indicator** — `components/PrimaryButton.js`. When `loading` is true the
button renders an `ActivityIndicator` in place of the title. Two details worth
knowing:

- *The button does not change size.* The text and the spinner both sit inside a
  `styles.buttonContent` row with `minHeight: 22`, and `styles.buttonText` pins
  `lineHeight: 22` to match `typography.body`. Measured across the transition,
  the button was exactly 54px in every one of the samples taken.
- *The spinner colour depends on the variant.* The primary button is filled
  blue so the spinner is white; the secondary button (Logout) is transparent
  with a blue outline, so there the spinner is blue — a white spinner would have
  been invisible. See `spinnerColor` in `PrimaryButton.js`.

`loading` is owned by the screens, not the button: `LoginScreen` sets it around
`await signInWithEmailAndPassword`, and `SignupScreen` sets it around **both**
`createUserWithEmailAndPassword` and `saveUserProfile`, so the spinner covers
the whole two-step signup. Both clear it in a `finally` block, so it cannot get
stuck on if the request throws.

---

## 11. Validation rules

**Email** — trimmed, then checked against
`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. This is a practical check, not a full RFC 5322
email parser; writing a correct one is genuinely hard and Firebase validates the
address server-side anyway.

The email is also **lower-cased** before being sent, so ` Test@Example.com ` and
`test@example.com` are the same account and a user is not told their own address
is taken because of a stray capital letter.

**Password on Signup** — seven rules, checked live as you type and listed in a
checklist under the password field:

| Rule | Test |
| --- | --- |
| At least 8 characters | `password.length >= 8` |
| One uppercase letter | `/[A-Z]/` |
| One lowercase letter | `/[a-z]/` |
| One number | `/[0-9]/` |
| One special character | `/[^A-Za-z0-9]/` |
| No spaces | `!/\s/` |
| No more than 64 characters | `password.length <= 64` |

Each rule is a separate entry in the `PASSWORD_RULES` array in `validation.js`,
each holding its own label and its own `isMet` function, so the checklist and
the validation can never disagree with each other. The checklist states each
rule three ways — a `✓` or `•` mark, the words "Met" or "Not met", and a colour —
so the state is never carried by colour alone.

The 64-character cap matters because Firebase silently truncates longer passwords
on some platforms, which would log the user out unexpectedly.

**Password on Login** — only required to be non-empty. The signup rules are *not*
applied at login. This is deliberate: these are the rules for *choosing* a new
password, and they say nothing about whether an existing password is correct. The
authoritative check is Firebase's, and a wrong password still produces the same
generic message as an unknown email (see section 1).

The password is **never trimmed and never changed**. Every character the user
typed is part of the password, including a leading space or a capital letter.
The character count is measured on the raw value, and the raw value is what gets
sent to Firebase.

**Validity is derived, not stored.** The error strings are recalculated from the
field values on every render, and validity is worked out from the values
themselves:

```js
const emailError = emailTouched || submitAttempted ? getEmailError(email) : '';

const formIsValid = isEmailValid(email) && isSignupPasswordValid(password);
```

Validity is deliberately **not** derived from the error strings. An untouched
form shows no error messages, so "no error" would look identical to "valid" and
would leave the button enabled on an empty form — that was a real bug, caught
during testing. There is no `isValid` state that could fall out of sync with the
inputs.

**Confirm password** on Signup must match exactly, comparing case and
whitespace. Its own Show / Hide toggle is independent of the password field's.

---

## 12. Typography and visual design

### One type scale

Every piece of text in the app takes its size, weight, line height and family
from `typography` in `theme.js`. There are no `fontSize` values written in a
screen or a component, which is why the app reads as one piece rather than three
screens that each invented their own sizes.

| Role | Size | Line height | Weight |
| --- | --- | --- | --- |
| `title` | 28 | 34 | 700 |
| `titleCompact` | 22 | 28 | 700 |
| `body` | 16 | 22 | 400 |
| `label` | 14 | 20 | 600 |
| `caption` | 13 | 18 | 400 |

`titleCompact` exists only for short landscape windows, where the full title
wastes vertical space the form needs.

### The font family and the Android fallback

The family is chosen per platform with `Platform.select`:

```js
export const fontFamily = Platform.select({
  ios: 'Helvetica Neue',
  web: 'Helvetica Neue, Helvetica, Arial, sans-serif',
  android: 'sans-serif',
  default: 'System',
});
```

The Android value is `'sans-serif'` on purpose. React Native on Android resolves
`fontFamily` through the Android typeface system, and `'sans-serif'` is that
system's default UI font (Roboto). Naming a specific family such as
`Helvetica Neue` on Android would either fall back silently to a default anyway
or render with a substituted font, because Helvetica is not shipped with Android
and licensing prevents bundling it. So each platform gets the closest thing to
its own native system font, and the text looks native rather than borrowed.

The web value is a *font stack*, not a single family, because a browser needs a
fallback in case Helvetica Neue is not installed. On iOS, `'Helvetica Neue'` is
present on every device.

### Spacing, touch targets and colour

- **Spacing** is a 4/8/16/24/32 scale in `theme.js`. Nothing uses an arbitrary
  number.
- **Touch targets** are at least 48px (`touchTarget` in `theme.js`). Inputs and
  buttons are 52px; the Show / Hide control and the text link are 48px.
- **One accent colour** — `#1F4FD8`. It is used for the primary button, links,
  the toggle, the focus of the hierarchy and the "Signed in" badge. The error
  red and success green are functional signals, not decoration.
- **No gradients, no emoji, no illustrations.** Hierarchy comes from weight,
  size and spacing instead.

---

## 13. What was tested, and what was not

Full record in **[`TESTING.md`](./TESTING.md)**, including the exact commands, the
results, the bugs that testing found, and an explicit list of what was *not*
verified.

Short version:

| Area | Result |
| --- | --- |
| Validation rules, including the 7 password rules | 94/94 automated assertions pass (`npm test`) |
| Expo project health | 21/21 `expo-doctor` checks pass |
| Firebase Auth + Firestore rules, live | 13/13 pass (`npm run verify:firebase`) |
| Login / Signup / Home, driven in the browser | 47 checks, 46 pass, 1 partial |
| Bugs found and fixed during testing | 4 (see `TESTING.md` section 3) |

**Not verified, and worth checking on a real phone:**

- The native **hardware back button** from Home.
- **On-screen keyboard** behaviour, which the web preview does not have — see
  the orientation notes in `TESTING.md` for exactly what to try.
- The **partial-signup retry path** (Auth succeeds, Firestore write fails),
  because triggering it would mean deliberately breaking the security rules.

---

## 14. Running the tests yourself

```bash
npm test              # validation rules, no network, instant
npm run verify:firebase   # live Firebase: Auth + security rules
node scripts/check-theme-imports.mjs   # static check
npx expo-doctor        # project health
```

> `npm run verify:firebase` **creates a real test account in your Firebase
> project** each time it runs. Delete them afterwards from
> Authentication → Users. The list of accounts created during this build is in
> `TESTING.md` section 5.

---

## 15. Known limitations

Stated plainly, so none of these come as a surprise in a viva.

- **The session does not survive closing the app.** Firebase Auth is used without
  a persistence layer, so it keeps the session in memory only. Closing Expo Go
  logs you out. Adding persistence needs `@react-native-async-storage/async-storage`,
  which was left out deliberately as it is not required by the brief.
- **No email verification.** An account can be created with any address that
  passes the format check, including one that does not exist. Real verification
  is beyond the brief.
- **No password reset.** Also beyond the brief.
- **No rate limiting or abuse protection beyond Firebase's own.** Firebase does
  throttle repeated failed attempts; there is nothing extra here.
- **This is coursework, not production account handling.** It is not a
  production-grade authentication system and should not be described as one.
- **The brief mentions a "number" field** ("check if number/email already
  exists"). No phone number field is specified anywhere else in the brief, and
  no screen is described as collecting one, so the app implements email and
  password only. A phone field would need Firebase Phone Auth, which is a
  different provider.
- **A user can rewrite their own `email` and `createdAt` values** in Firestore.
  The rules block every other field and every other document, but they do not
  make a user's own profile immutable. That is acceptable here because the
  document holds nothing sensitive.
