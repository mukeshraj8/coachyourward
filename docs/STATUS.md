# Project status

As of 24 October 2026. The board exams start around mid-February 2027, about 16 weeks away. The study plan runs from 26 October 2026.

## Summary

The app is complete and in daily use as a website (study.rekhank.app), an installable app (PWA) and an Android APK. The Play Store listing is prepared and waits on the upload in Play Console. The main remaining work is the Play Store release, then features that turn a self-study app into a coaching platform (see [ROADMAP.md](ROADMAP.md)).

## Done

### Content

| Subject | Chapters with notes | MCQs | Written (board-style) | Hot questions | Solved past papers |
| --- | --- | --- | --- | --- | --- |
| Maths (Standard and Basic) | 14 | 155 | 53 | 20 | 16 papers: Standard 2019, 2022–2026 (two 2026 sets) and the 2026–27 sample paper; Basic 2020, 2022–2026 (two 2026 sets) and the 2026–27 sample paper |
| Science | 13 | 159 | 49 | 16 | 9 papers: 2019, 2020, 2022–2026 (two 2026 sets) and the 2026–27 sample paper |
| English Language & Literature | 27 | 197 | 33 | 9 | 7 papers: 2022–2026 (two 2026 sets) and the 2026–27 sample paper |
| Sanskrit 119 (Manika) | 19 | 155 | 29 | 8 | 4 papers: 2025, 2026 (two sets) and the 2026–27 sample paper. Code 119 started in 2025; older papers and the sample paper are code 122 |
| Social Science | 23 | 202 | 58 | 14 | 6 papers: 2022–2026 and the 2026–27 sample paper |
| **Total** | **96** | **868** | **222** | **67** | **42 solved papers**, including the six official 2026–27 sample papers, plus links to older official papers |

- **Past papers:** every solved paper has model answers and the marking scheme's value points. Each one downloads as a question-paper PDF and as an answers PDF. All 72 PDFs were checked, and every question has its answer. The six 2026–27 sample papers are marked `sqp`, and the weekly mock on the Dashboard offers them before the older papers.
- **JEE Foundation:** 37 stretch and Class 11 bridge problems with solutions.
- **Accuracy:** new content was independently fact-checked. Nine errors were found and fixed before release.

### Features

- Dashboard: today's plan (the day's share of plan tasks, due revisions, mistakes to fix, a weekend full mock), countdown to the exam, plan progress, tests taken, weakest chapters, daily streak.
- Revision page:
  - spaced revision: a short quiz 1, 3, 7 and 21 days after each chapter is learnt or tested
  - quick-revision sheets per subject (formulas or key terms, points, common mistakes), printable
  - board date sheet; exam mode in the last 14 days plans each day for the next paper
- Weekly report for parents on the Progress page, shared by WhatsApp, email or the share sheet.
- Figures drawn for 75 past-paper questions (geometry, graphs, circuits, ray diagrams).
- Android: a daily 6 pm study reminder.
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
| Upload to Play internal testing | Done | Package `app.rekhank.study`, build 4 (minimum Android 7.0) |
| Play app signing fingerprint in `.well-known/assetlinks.json` | Done | Lets the Play version open full screen |
| Play store listing, store settings, App content forms, content rating | Done | Saved in Play Console (account Rekhank); contact rekhank.admin@gmail.com |
| Closed test, then apply for production | Mukesh | Sent for review 26 Oct 2026 (India, RekhankClosedTesters, 29 testers). After approval, testers keep it 14 days, then apply for production |
| Phone test: GitHub APK and Play internal-test build | Done | Both open full screen on a Realme (Android 10); sign-in, sync and a timed test work |
| Update the exam date when CBSE publishes the date sheet | Student / parent | Revision → Date sheet (the first paper's date also sets the Dashboard countdown) |
| Add the official CBSE 2026–27 sample papers and marking schemes | Done | All six added 26 Oct 2026 from cbseacademic.nic.in (Maths Standard and Basic, Science, English, Social Science, Sanskrit 122). The weekly mock now prefers them |
| AI checking of written answers and ask-a-doubt | Mukesh, then Claude | Needs a decision on Claude API cost and the Firebase Blaze plan |
| New Play build with the daily reminder | Claude | Build 5 is on GitHub Releases; upload its `.aab` to Play testing |
| Optional: a private Play upload key | Claude | The current key is in the public repo; Google holds the real signing key |

## Known limitations

- **Diagrams:** 75 past-paper questions have drawn figures. Questions that ask the student to draw (ray diagrams, labelled biology diagrams) don't show a model drawing yet.
- **Written answers:** marked by the student against the marking points, not checked automatically.
- **Scope:** one student per Google account. There is no parent or teacher view.
- **Reminders:** a fixed daily 6 pm notification on Android only; the time can't be changed in the app, and there are no website notifications.
- **Single build:** the question data ships in one 1.6 MB page. This is fine today but will need splitting as content grows.
- **Automated checks:** the validation and browser tests run outside the repository and aren't yet part of CI.
- **Syllabus scope:** a few Social Science chapters were flagged as possibly periodic-test only in recent years. Questions on them were kept because the 2026 board paper used them. This should be rechecked against the official 2026–27 syllabus when CBSE publishes the sample paper.

## AI checking and Ask a doubt (26 Oct 2026)
Built: "Ask a doubt" page (text or photo) and "Check with AI" on every written answer after a test (typed answer or photo; the AI marks against the marking points and pre-ticks them).
Server: `functions/index.js` with Claude, ChatGPT and Grok in a preference order with automatic fallback, an email allow-list and a daily cap.
Not live until the steps in `docs/AI-SETUP.md` are done (Blaze plan, keys, deploy).

## Play policy: Misleading Claims (29 Oct 2026)
Google Play rejected the closed test for "Missing source link for government information".
The app now shows on every page a disclaimer (not affiliated with CBSE, NCERT or any government body) with links to cbse.gov.in, cbseacademic.nic.in and ncert.nic.in, plus an "About and sources" page.
Each solved paper already linked its official question paper and marking scheme; the Past Papers page now also names the sources. The store description must carry the same disclaimer and links.
