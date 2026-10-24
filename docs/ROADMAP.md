# Roadmap: from a study app to a full coaching platform

**Goal:** CoachYourWard coaches each student the way a good tutor would. It knows what the student is weak at, decides what to do today, checks written work, answers doubts, and keeps parents and teachers informed. All of it through the app and the website.

The plan has three stages. Stage 1 serves the current student before the February 2027 boards. Stages 2 and 3 open the app to many students and coaches.

## Stage 1: a personal coach before the boards (now to February 2027)

Each item builds on what exists: tests, chapter accuracy, the mistake book and the 16-week plan.

| # | Feature | What it does | Effort |
| --- | --- | --- | --- |
| 1 | **Today's coach plan** | Each morning the Dashboard picks 3–4 tasks from the plan, weak chapters, due mistakes and an unseen-question set, sized to the time available | Small |
| 2 | **Spaced revision** | Every chapter studied comes back for a quick quiz after 1, 3, 7 and 21 days; mistakes follow the same schedule | Small |
| 3 | **AI checking of written answers** | The student photographs a handwritten answer; Claude reads it, marks it against the CBSE marking points, and explains the lost marks | Medium (needs a small server, item 9) |
| 4 | **Ask a doubt** | A chat on every question and chapter note: "why is option C wrong?", "explain this step"; answers stay within the NCERT syllabus | Medium (item 9) |
| 5 | **Parent weekly report** | Every Sunday, an email or WhatsApp-ready summary: hours, tests, scores by subject, weak chapters, plan completion | Small–medium |
| 6 | **Reminders** | Study-time and streak reminders as notifications on Android and the website (web push through Firebase Cloud Messaging) | Small–medium |
| 7 | **CBSE 2026–27 sample paper and more full mocks** | Add the official sample paper and marking scheme when released; one fresh full mock per subject per week in the final 6 weeks | Content |
| 8 | **Diagrams** | Draw the figures for geometry, optics, circuits and maps instead of describing them in words | Content |
| 9 | **Backend for AI features** | Firebase Cloud Functions calling the Claude API (the latest Claude Sonnet model for checking and doubts); per-student daily limits; no keys in the app | Medium |
| 10 | **Exam-week mode** | From the date sheet: a day-by-day revision timetable, formula and key-term sheets, last-minute Hot questions | Small |

**Order of work:** 1, 2, 10 and 7 first (no server needed), then 9 with 3 and 4, then 5 and 6.

**Approximate running cost** for one student using AI checking and doubts daily: a few hundred rupees a month in Claude API usage. Firebase stays on the free tier.

## Stage 2: a coaching platform for many students (2027)

| Area | What to build |
| --- | --- |
| **Roles** | Student, parent and coach/teacher accounts. A parent links to a child; a coach creates batches and invites students with a code |
| **Coach dashboard** | Batch-wide accuracy by chapter, students at risk, who missed the plan, question-level analysis (which questions most students get wrong) |
| **Assignments** | Coach assigns chapter tests, papers or written questions with a due date; auto-marked MCQs, AI-assisted marking of written work with coach review |
| **Live and recorded classes** | Schedule a class (Google Meet or YouTube Live link) and attach it to a chapter; recordings appear in the chapter's notes |
| **Doubt forum** | Students post doubts per chapter; the AI answers first, the coach confirms or corrects |
| **Leaderboards and badges** | Weekly batch leaderboards by effort (streaks, questions practised) as well as scores |
| **Content management** | Move question banks from JS files into Firestore with an admin editor. Tag every question by chapter, difficulty, competency type and past-paper frequency, with review before publishing |
| **Adaptive testing** | Choose each next question by the student's estimated ability per chapter, so tests are never too easy or too hard |

### Technical changes for Stage 2

- **Data:** split the 1.6 MB page into an app shell plus subject data loaded on demand, cached offline by the service worker.
- **Firestore:**
  - **Collections:** `users`, `batches`, `assignments`, `submissions`, `questions`, `doubts`.
  - **Rules:** security rules per role. A coach reads only their own batches; a parent reads only their child.
- **Analytics:** privacy-preserving event counts, such as questions answered and time on task, aggregated per batch.
- **Automated checks in CI:**
  - Move the existing content validation and browser tests into the repo.
  - Run them on every push with GitHub Actions.
  - Block deploys that fail.
- **Front end:** consider moving to a component framework (for example Preact) once there are several roles. The current plain-JS structure is fine for one student.

## Stage 3: scale

- **More classes and exams:** Class 9, 11 and 12, JEE Main, NEET, and Hindi-medium content.
- **Payments:** subscriptions per student or per batch (for example Razorpay), with a free tier.
- **Play Store:** the Android app is already a Trusted Web Activity, so new features ship through the website. Native work is needed only for features such as offline video.
- **Windows app:** the PWA already installs from Edge or Chrome. If a Microsoft Store listing is wanted, it can be packaged with PWABuilder.

## Compliance to plan for before opening to other students

- **India's Digital Personal Data Protection Act, 2023:** students under 18 are children under the Act. Their data needs verifiable parental consent, and tracking or targeted advertising aimed at them is not allowed.
  - Build parent-consent sign-up before Stage 2 goes public.
  - Check the current DPDP Rules timeline with a lawyer.
- **Google Play:**
  - If the target audience ever includes under-13s, the Families policy applies.
  - The Data safety form must be updated whenever new data is collected (photos of answers, chat).
- **AI features:** tell students and parents that answers are AI-assisted, keep a "report a wrong answer" button, and keep the coach in the loop for marks that count.

## Suggested next three steps

1. Finish the Play Store release (see [STATUS.md](STATUS.md)).
2. Build Today's coach plan, spaced revision and exam-week mode. They need no server and help right away.
3. Set up the Cloud Functions backend, then add AI checking of written answers. Written answers carry 60 of 80 marks, so this has the biggest effect on scores.
