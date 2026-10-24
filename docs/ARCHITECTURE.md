# CoachYourWard: technical documentation

CoachYourWard is a CBSE Class 10 board-exam preparation app (2026–27 syllabus) for Maths, Science, English, Sanskrit (code 119, Manika) and Social Science (087). One code base runs in three places:

| Where | URL / package | Built from | Progress sync |
| --- | --- | --- | --- |
| Website (installable PWA) | https://study.rekhank.app | `index.html` in this repo, served by GitHub Pages | Google sign-in, Firebase Firestore |
| Android app | `app.rekhank.study` (APK on GitHub Releases; Play Store pending) | `android/`: a Trusted Web Activity that opens the website | Same as the website |
| claude.ai artifact | Published from the project's shared folder | Same sources, without `fbsync.js` / `pwa.js` | claude.ai artifact storage (`db` + `user` capabilities) |

## 1. Repository layout

```
CNAME                    custom domain for GitHub Pages (study.rekhank.app)
index.html               the built single-file website (do not edit by hand)
privacy.html             privacy policy
manifest.webmanifest     PWA manifest
sw.js                    service worker (offline support)
icons/                   app icons (192, 512, maskable, apple-touch)
.well-known/assetlinks.json   Digital Asset Links for the Android app
src/                     all app source (see section 3)
scripts/build.sh         builds index.html from src/
android/                 Android Trusted Web Activity project (Gradle)
android/play-store/      Play Store icon, feature graphic, screenshots
.github/workflows/android.yml   builds the APK and .aab on every Android change
docs/                    this documentation
RELEASE.md               release steps (website, APK, Play Store)
```

## 2. Build

There is no bundler and no framework: plain JavaScript files concatenated into one HTML page.

`sh scripts/build.sh` writes `index.html` as: the `<head>` (title, manifest, icons), `src/shell.html` (CSS and page skeleton), then these `<script>` blocks in order:

1. Data: `data.js`, `sanskrit.js`, `bank*.js` (alphabetical), `papers.js`, `papers-*.js`
2. `app.js`: core app
3. `prep.js`: smart practice
4. `jee.js`: JEE Foundation
5. `print.js`: PDF downloads
6. `sync.js`: progress sync core
7. `firebase-config.js`, `fbsync.js`: Google sign-in and Firestore (website only)
8. `pwa.js`: service worker registration and Android download card (website only)

Order matters: later scripts extend earlier ones by wrapping global functions (section 4). The built page is about 1.6 MB, nearly all of it question data.

The claude.ai artifact is built from the same files (the project's `build.sh` in the shared folder), leaving out steps 7 and 8.

## 3. Source files

| File | Purpose |
| --- | --- |
| `shell.html` | All CSS (light and dark themes), sidebar navigation, the `#view` container |
| `data.js` | `SUBJECTS` (Maths, Science, English: chapters, notes, MCQ, written, Hot questions) and `JEE_FOUNDATION` |
| `sanskrit.js` | Sanskrit 119 subject: grammar topics and Manika lessons |
| `bank0-sst.js` | Social Science subject definition and chapters |
| `bank1.js` … `bank14-sst.js` | Question banks; each calls `addTo(subject, "mcq" / "written" / "hot", [...])`. `bank1.js` defines `addTo` and the assertion–reason options `AR` |
| `papers.js` | Past-paper engine: archive page, paper view, links to official CBSE zips |
| `papers-<code><yy>.js` | One solved board paper each (`m` Maths Standard, `mb` Maths Basic, `s` Science, `e` English, `k` Sanskrit, `x` Social Science; `b` suffix = second set) |
| `app.js` | State, study plan, pages (Dashboard, Plan, Topics, Hot, Tests, Progress, JEE), timed tests and self-marking, rendering and events |
| `prep.js` | Mistake book, weak-chapter drill, fresh-question selection, streak |
| `jee.js` | Extra JEE problems, subject filter, solved tracker |
| `print.js` | A4 PDFs of past papers (questions or answers) and practice sets, using html2canvas 1.4.1 and jsPDF 2.5.1 from cdnjs |
| `sync.js` | Sync engine with pluggable back ends; the claude.ai back end |
| `firebase-config.js` | Public Firebase web config (identifiers, not secrets) |
| `fbsync.js` | Google sign-in (Firebase Auth compat SDK 10.12.2) and the Firestore back end |
| `pwa.js` | Registers `/sw.js`; shows "Download the app" on Android browsers |

## 4. Runtime design

- **State:** one global object `S` (page, subject, open topic, running test, result, plan ticks, history, exam date, mistake book).
- **Rendering:** each page is a function returning an HTML string (`pageHome`, `pageTests`, …). `render()` puts the current page's HTML into `#view`. Clicks are handled by one delegated listener on `data-act` attributes.
- **Extension by wrapping:** later scripts replace a global page function with one that calls the original and adds to it. For example, `print.js` wraps `pageTests` to add the PDF card, `prep.js` wraps `startTest`, `submitTest`, `pageTests` and `pageHome`, and `fbsync.js` wraps `pageHome` to add the account card. A new feature should follow the same pattern in its own file.
- **Tests:** `startTest(kind, chapter)` builds `S.test` (`chapter`, `sprint`, `mock`, `full`, `mistakes`, `weak`). `submitTest()` marks MCQs, `saveResult()` adds self-marked written scores and stores a history entry with per-chapter accuracy (`chStats`).
- **Study plan:** `buildPlan()` generates 16 weeks from `PLAN_START` (26 Oct 2026) with tasks per subject. Ticks are stored by task id.

### Data shapes

```js
// chapter (notes)
{ id, name, group?, gist, points: [..], formulas: [..], example: { q, a }, mistake, tip }
// MCQ: a = index of the right option
{ ch, q, o: [..4 options], a, e }
// written: points must add up to marks
{ ch, marks, q, a, points: [[text, marks], ..] }
// Hot question
{ ch, why, q, hint, a }
// past paper
{ id, subj, year, exam, set, course?, marks, mins, qp, ms, note, advice,
  sections: [{ name, info?, qs: [ {text, title} | {n, ch, q, o, a, e} | {n, ch, marks, q, ans, pts, tip?} ] }] }
// JEE problem
{ area, topic, q, a }
```

### Storage (browser localStorage, prefix `cyw.`)

| Key | Content | Synced |
| --- | --- | --- |
| `plan` | `{ taskId: true }` ticks | Yes |
| `history` | test results `{ id, date, subj, kind, title, score, max, secs, chStats }` | Yes |
| `examDate` | first board paper date (default 2027-02-17) | Yes |
| `mistakes` | `{ subj: { questionKey: { n, ok, t } } }` | Yes |
| `seenQs` | `{ questionKey: lastSeenTime }` (capped at 4000) | No |
| `jeeDone` | solved JEE problems | No |
| `subj`, `updatedAt`, `syncedAt` | UI choice and sync bookkeeping | No |

A question's key is a hash of its text (`qKey` in `prep.js`), so editing a question's wording resets its mistake/seen record.

### Sync

`sync.js` keeps one document per person: `{ plan, history, examDate, mistakes, updatedAt }`.

- Any change to a synced key stamps `updatedAt` and pushes after 1.5 s.
- The newer copy wins. Tests taken on this device since the last sync are merged in rather than lost.
- Back ends implement `{ set(data), subscribe(onDoc, onError) }` and only pass server-confirmed snapshots.
  - **Website and Android:** Firestore document `users/{uid}`.
  - **claude.ai artifact:** `data/users/<uid>/progress`.

## 5. Firebase

- Project: `coachyourward`. Console: https://console.firebase.google.com/project/coachyourward
- Authentication: Google provider. Authorized domains must include `study.rekhank.app` (they do).
- Firestore rules (only the signed-in user can read or write their own document):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

- Sign-in uses a popup, falling back to a redirect when popups are blocked.

## 6. Hosting and domain

- GitHub Pages serves the `main` branch root. `CNAME` = `study.rekhank.app`, and `.nojekyll` makes Pages serve `.well-known/`.
- DNS (Porkbun, domain `rekhank.app`): CNAME record `study` → `mukeshraj8.github.io`. HTTPS is enforced by GitHub Pages. The astrology site on `rekhank.app` is not affected.

## 7. Offline (PWA)

`sw.js` (cache `cyw-v1`):

- The page is fetched from the network first and falls back to the cached copy when offline.
- Fonts, the PDF libraries and the Firebase SDK are cached as they are used, and served from cache while refreshing in the background.
- Sign-in and Firestore calls are never cached.
- Bump `CACHE` in `sw.js` only if cached libraries must be dropped. Page updates arrive on their own.

## 8. Android app

`android/` is a Gradle project (Android Gradle Plugin 8.11.1, Gradle 8.13, compile and target SDK 36, minimum SDK 21) using Google's `androidbrowserhelper` 2.5.0.

- **How it opens:** `LauncherActivity` opens `https://study.rekhank.app/` in Chrome as a Trusted Web Activity, so sign-in, offline mode and sync behave exactly like the website.
- **Full screen:** works only when `.well-known/assetlinks.json` lists the app's signing certificate. If it doesn't match, the app shows an address bar.
- **Build:** the workflow runs `gradle assembleRelease bundleRelease`, signs with `android/coachyourward.keystore`, and publishes `CoachYourWard.apk` and `CoachYourWard.aab` as the latest GitHub release.
- **Version:** the code is the workflow run number.
- **Updates:** the app shows the live website, so content updates need no new app build.

## 9. Content rules

- Follow the 2026–27 CBSE syllabus. Do not add content from the rationalised (deleted) topics. Some examples:
  - **Maths:** area of a triangle by coordinates, the theorem on areas of similar triangles, ogives. Segment questions use 60° or 90° only.
  - **Science:** periodic classification, sources of energy, management of natural resources, evolution, electric motor and generator.
  - **Social Science:**
    - Age of Industrialisation and Consumer Rights are not in the board paper.
    - Making of a Global World covers subsections 1 to 1.3 only.
    - Lifelines of National Economy is for map work only.
    - Globalisation covers its first two topics.
  - **Sanskrit 119:** समास is limited to तत्पुरुष, द्वन्द्व and अव्ययीभाव.
- Written-answer marking points must add up to the question's marks.
- From 2026 the SST paper has four subject sections; answers in the wrong section are not evaluated. Practice sets reflect this.

### Adding content

1. Add questions in a new `src/bankNN-<subject>.js` using `addTo(...)`, or a new chapter in the subject's `chapters` array.
2. Run the validation check, done before every release so far. Every MCQ's chapter id must exist, `a` must be less than the number of options, written `points` must add up to `marks`, and every chapter should have MCQs.
3. Rebuild with `sh scripts/build.sh`, open `index.html` locally, take a test in the new chapter, then commit and push.

A new past paper is one `src/papers-<code><yy>.js` file calling `PAPERS.push({...})`, following an existing paper of the same subject.

## 10. Quality checks used so far

These checks run with Node and Playwright (headless Chromium) outside the repo:

- **Question banks:** data validation of every bank.
- **Flows:** page-level browser tests of every page, every subject, tests, smart practice and JEE.
- **Sync:** a two-device sync test with a fake back end, and a Firebase sign-in test with a fake SDK.
- **PDFs:** generation of all 72 past-paper PDFs, checking that no question block is taller than a page.
- **Paper marks:** a full-paper marks simulation.
- **Accuracy:** new content was fact-checked by an independent reviewer before release.

Moving these checks into the repo (with a GitHub Actions run on every push) is in the roadmap.
