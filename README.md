# CoachYourWard

CBSE Class 10 board exam preparation (2026–27 syllabus): study plan, chapter notes, question bank, Hot questions, timed tests, solved past papers and printable PDFs for Maths, Science, English, Sanskrit (119) and Social Science.

Served at https://study.rekhank.app from GitHub Pages. `index.html` is a single-file build; sign-in and progress sync use Firebase (Google accounts, Firestore).

Releases (website, Android APK, Google Play): see [RELEASE.md](RELEASE.md).

## Updating the site

All source lives in `src/`. Edit there, then run `sh scripts/build.sh` and commit both `src/` and the rebuilt `index.html`; GitHub Pages serves `index.html` from `main`.

- `data.js`, `sanskrit.js`, `bank*.js`: subjects, chapter notes and question banks (`bank0-sst.js` defines Social Science).
- `papers.js`, `papers-*.js`: solved past board papers.
- `app.js`: the app; `print.js`: PDF downloads; `sync.js` + `fbsync.js` + `firebase-config.js`: Google sign-in and progress sync (Firestore `users/{uid}`, readable and writable only by that user).
