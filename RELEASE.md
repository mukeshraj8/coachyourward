# Releasing CoachYourWard

How each part of CoachYourWard is released: the website, the Android APK, and the Google Play Store app. Paths are relative to the repository folder (on the Windows laptop: `D:\repo\CoachYourWard`).

## What lives where

| What | Path |
| --- | --- |
| App source (code, notes, question banks, past papers) | `src\` |
| Built website served at https://study.rekhank.app | `index.html` (built from `src\`) |
| Website build script | `scripts\build.sh` |
| Privacy policy (https://study.rekhank.app/privacy.html) | `privacy.html` |
| Android app project (Trusted Web Activity) | `android\` |
| Android signing key (upload key) | `android\coachyourward.keystore` |
| Website ↔ app link file (Digital Asset Links) | `.well-known\assetlinks.json` |
| Play Store graphics: icon, feature graphic, 6 screenshots | `android\play-store\` |
| Android build workflow | `.github\workflows\android.yml` |
| Downloaded APK and bundle (not tracked by git) | `release\` |

## 1. Website

GitHub Pages serves `index.html` from the `main` branch.

1. Edit files in `src\`.
2. Run `sh scripts/build.sh` from the repository folder (Git Bash on Windows) to rebuild `index.html`.
3. Commit `src\` and `index.html` and push to `main`. The site updates within a minute or two.

The Android app opens the live website, so content changes (new questions, fixes, features) reach the app without a new app release.

## 2. Android APK (direct install)

Every push to `main` that changes `android\` or the workflow builds a signed APK and an `.aab` bundle on GitHub, and publishes both as the latest release. The run number becomes the version code.

- Latest APK: https://github.com/mukeshraj8/coachyourward/releases/latest/download/CoachYourWard.apk
- Latest bundle: https://github.com/mukeshraj8/coachyourward/releases/latest/download/CoachYourWard.aab
- A manual build: GitHub → Actions → **Android app** → **Run workflow**.

To get both files into `release\` (PowerShell, in the repository folder):

```powershell
New-Item -ItemType Directory -Force release | Out-Null
Invoke-WebRequest https://github.com/mukeshraj8/coachyourward/releases/latest/download/CoachYourWard.aab -OutFile release\CoachYourWard.aab
Invoke-WebRequest https://github.com/mukeshraj8/coachyourward/releases/latest/download/CoachYourWard.apk -OutFile release\CoachYourWard.apk
```

To install the APK on a phone, open the APK link on the phone and allow "Install unknown apps" for the browser when asked.

## 3. Google Play Store

Package name: `app.rekhank.study`.

### First release

1. Open https://play.google.com/console and choose **Create app**.
   - App name: `CoachYourWard: CBSE Class 10`
   - Default language: English (India). App. Free. Accept the declarations.
2. **Test and release → Testing → Internal testing → Create new release.**
   - Keep **Use Google-generated key** (Play App Signing).
   - Upload `release\CoachYourWard.aab`.
   - Release notes: `First release.` Then **Next → Save → Start rollout**.
   - Under **Testers**, add your Gmail address and open the opt-in link on the phone to install from Play.
3. **Grow users → Store presence → Main store listing.** Paste the text from [Store listing text](#store-listing-text) and upload:
   - App icon: `android\play-store\app-icon-512.png`
   - Feature graphic: `android\play-store\feature-graphic-1024x500.png`
   - Phone screenshots: `android\play-store\screenshot-1-dashboard.png` to `screenshot-6-progress.png`
4. **Policy and programs → App content.** Use the answers in [App content answers](#app-content-answers).
5. **Test and release → App integrity → App signing.** Copy the **SHA-256 certificate fingerprint** of the *App signing key certificate* and add it to `.well-known\assetlinks.json` (see [Linking the website](#linking-the-website-to-the-play-version)). Without it, the Play version shows an address bar.
6. **Testing rule:** a personal developer account created after November 2023 needs a **Closed testing** track with at least 12 testers opted in for 14 days before **Apply for production** is allowed. Older and organisation accounts skip this.
7. **Production → Create new release.** Add the same bundle, roll out, and wait for Google's review (usually a few days).

### Later releases

Needed only when the Android project itself changes (`android\`); website changes reach the app on their own.

1. Push the change to `main` and wait for the **Android app** workflow to finish.
2. Download the new bundle into `release\` (commands above).
3. In Play Console, create a new release on the track you use and upload `release\CoachYourWard.aab`. The version code is higher automatically.

### Linking the website to the Play version

`.well-known\assetlinks.json` lists the signing fingerprints the website trusts. It already has the fingerprint of `android\coachyourward.keystore` (used by the GitHub APK). Add Google's app signing fingerprint as a second entry in `sha256_cert_fingerprints`:

```json
"sha256_cert_fingerprints": [
  "19:40:80:87:61:4B:59:26:D1:83:AC:21:2D:3D:17:AC:42:55:B9:E0:2A:06:A4:E1:A7:AE:DA:15:BC:7E:4D:AD",
  "<SHA-256 from Play Console → App signing>"
]
```

Commit, push, and check https://study.rekhank.app/.well-known/assetlinks.json shows both.

The GitHub APK and the Play version share a package name but are signed differently, so a phone can hold only one. Uninstall the APK version before installing from Play (progress is safe when signed in with Google).

### Store listing text

App name (28 of 30 characters):

```
CoachYourWard: CBSE Class 10
```

Short description (79 of 80 characters):

```
CBSE Class 10 board prep: solved past papers, timed tests, notes and study plan
```

Full description:

```
CoachYourWard helps CBSE Class 10 students prepare for the 2026-27 board exams in Maths, Science, English, Sanskrit (119) and Social Science, with one clear plan from today to the exam.

SOLVED PAST PAPERS
Official CBSE board papers from recent years, solved the way the marking scheme awards marks, with value points and scoring tips. Download any paper or its answers as a PDF to print.

TIMED TESTS IN THE BOARD PATTERN
Chapter tests, Section A sprints, mini papers and full 80-mark papers on a clock. MCQs are marked instantly; written answers are self-marked against the board's marking points.

SMART PRACTICE
- Mistake book: every wrong answer comes back until it is right twice in a row
- Weak-chapter drills from your lowest-scoring chapters
- Fresh questions first, so practice keeps covering new ground
- A daily streak to keep the habit going

SIMPLE NOTES
Every chapter explained in plain words, with key points, formulas, a solved example, common mistakes and exam tips.

STUDY PLAN AND PROGRESS
A week-by-week plan to the exam, accuracy by chapter, and test history. Sign in with Google to keep progress in sync on phone and computer.

HOT SECTION AND JEE FOUNDATION
Harder board questions, plus stretch problems and a Class 11 bridge set for students aiming at JEE.

Works offline after the first visit. No ads.

CoachYourWard is an independent study app and is not affiliated with CBSE or NCERT.
```

Category: Education. Website: https://study.rekhank.app. Contact email: an address you are happy to show publicly.

### App content answers

| Form | Answer |
| --- | --- |
| Privacy policy | https://study.rekhank.app/privacy.html |
| App access | All functionality is available without special access (Google sign-in is optional) |
| Ads | No ads |
| Content rating | Category: Reference, News or Educational. Answer No to every question. Expected rating: Everyone / 3+ |
| Target audience | Ages 13–15 and 16–17. "Could the app unintentionally appeal to children?" No |
| Data safety: collects / shares | Collects: Yes. Shares: No |
| Data safety: data types | Personal info → Name, Email address, User IDs. App activity → Other user-generated content (plan ticks, test scores, mistake book) |
| Data safety: per type | Collected, not shared; optional (only when signed in); purpose: App functionality, Account management; processed ephemerally: No |
| Data safety: security | Encrypted in transit: Yes. Users can request deletion: Yes |
| Account deletion URL | https://study.rekhank.app/privacy.html |
| Government app, financial features, health, news | No / None |

## About the signing key

`android\coachyourward.keystore` (password `coachyourward`, alias `coachyourward`) is committed so GitHub can sign every build. For the Play Store it is only the upload key; Google Play App Signing holds the key users' phones see, and an upload key can be reset in Play Console if ever needed.
