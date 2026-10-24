# Project status

As of 24 October 2026. The board exams start around mid-February 2027, about 16 weeks away. The study plan runs from 26 October 2026.

## Summary

The app is complete and in daily use as a website (study.rekhank.app), an installable app (PWA) and an Android APK. The Play Store listing is prepared and waits on the upload in Play Console. The main remaining work is the Play Store release, then features that turn a self-study app into a coaching platform (see [ROADMAP.md](ROADMAP.md)).

## Done

### Content

| Subject | Chapters with notes | MCQs | Written (board-style) | Hot questions | Solved past papers |
| --- | --- | --- | --- | --- | --- |
| Maths (Standard and Basic) | 14 | 155 | 53 | 20 | 14 papers: Standard 2019, 2022–2026 (two 2026 sets); Basic 2020, 2022–2026 (two 2026 sets) |
| Science | 13 | 159 | 49 | 16 | 8 papers: 2019, 2020, 2022–2026 (two 2026 sets) |
| English Language & Literature | 27 | 197 | 33 | 9 | 6 papers: 2022–2026 (two 2026 sets) |
| Sanskrit 119 (Manika) | 19 | 155 | 29 | 8 | 3 papers: 2025, 2026 (two sets). Code 119 started in 2025; older papers are code 122 |
| Social Science | 23 | 202 | 58 | 14 | 5 papers: 2022–2026 |
| **Total** | **96** | **868** | **222** | **67** | **36 solved papers**, plus links to older official papers |

- **Past papers:** every solved paper has model answers and the marking scheme's value points. Each one downloads as a question-paper PDF and as an answers PDF. All 72 PDFs were checked, and every question has its answer.
- **JEE Foundation:** 37 stretch and Class 11 bridge problems with solutions.
- **Accuracy:** new content was independently fact-checked. Nine errors were found and fixed before release.

### Features

- Dashboard: countdown to the exam, plan progress, tests taken, this week's tasks, weakest chapters, daily streak.
- 16-week study plan with tasks per subject and progress tracking.
- Topic notes for every chapter: gist, key points, formulas, solved example, common mistake, exam tip.
- Timed tests in the CBSE pattern:
  - chapter test
  - 20-question Section A sprint
  - mini paper
  - full 80-mark paper
  - Instant MCQ marking; written answers are self-marked against the board's marking points.
- Smart practice:
  - a mistake book: wrong answers return until they are answered correctly twice
  - a weak-chapter drill
  - unseen questions first
- Progress: accuracy by chapter, test history, reset.
- Printable PDFs of past papers, answers and fresh practice sets.
- Google sign-in, with progress synced across phone, laptop and the Android app.
- Works offline once the site has been opened.
- Installable on Android, Windows and iPhone home screens.
- Android app (Trusted Web Activity), built and signed automatically on GitHub.

### Infrastructure

- GitHub Pages hosting on the custom domain study.rekhank.app (DNS at Porkbun), HTTPS.
- Firebase project `coachyourward`: Google Auth and Firestore with per-user security rules.
- GitHub Actions workflow that builds the APK and Play Store bundle.
- Privacy policy at https://study.rekhank.app/privacy.html.
- A copy of the app on claude.ai with its own progress sync.

## Remaining

| Item | Owner | Notes |
| --- | --- | --- |
| Create the Play Store app and upload `release\CoachYourWard.aab` | Mukesh | Steps in [RELEASE.md](../RELEASE.md) |
| Add Play's app signing SHA-256 fingerprint to `.well-known/assetlinks.json` | Claude, after the upload | Without it, the Play version shows an address bar |
| Closed test with 12 testers for 14 days | Mukesh | Only if the developer account is personal and newer than November 2023 |
| Confirm the GitHub APK opens full screen | Mukesh | Not yet confirmed on a phone |
| Update the exam date when CBSE publishes the date sheet | Student / parent | Dashboard → First paper |
| Optional: a private Play upload key | Claude | The current key is in the public repo; Google holds the real signing key |

## Known limitations

- **Diagrams:** questions that need a figure describe it in words, for example "[Figure: …]". There are no drawn diagrams yet.
- **Written answers:** marked by the student against the marking points, not checked automatically.
- **Scope:** one student per Google account. There is no parent or teacher view.
- **Reminders:** no notifications.
- **Single build:** the question data ships in one 1.6 MB page. This is fine today but will need splitting as content grows.
- **Automated checks:** the validation and browser tests run outside the repository and aren't yet part of CI.
- **Syllabus scope:** a few Social Science chapters were flagged as possibly periodic-test only in recent years. Questions on them were kept because the 2026 board paper used them. This should be rechecked against the official 2026–27 syllabus when CBSE publishes the sample paper.
