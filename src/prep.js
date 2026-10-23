/* Smart practice: a mistake book, weak-chapter drills, fresh questions first, and a daily streak.
   Wrong MCQs go into the mistake book and leave it after two correct answers in a row. Tests prefer questions
   not seen before, so the whole bank gets covered. Loads after app.js. */
const SEEN_MAX = 4000;
S.mistakes = store.get("mistakes", {});
let seenQs = store.get("seenQs", {});

(function () {
  const css = `
.streak { display: flex; align-items: baseline; gap: 8px; }
.streak b { font-family: var(--mono); font-size: 2rem; }
.smart .btn { width: 100%; }
.cover { font-size: .85rem; }`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
})();

// A short stable key for a question, from its text.
function qKey(q) {
  let h = 0; const s = q.q;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36) + s.length.toString(36);
}
const mistakeBook = subj => S.mistakes[subj] || {};
const mistakeQs = subj => { const book = mistakeBook(subj); return SUBJECTS[subj].mcq.filter(q => book[qKey(q)]); };

// Prefer questions never seen, then the ones seen longest ago.
function pickFresh(pool, n) {
  return shuffle(pool).map(q => ({ q, t: seenQs[qKey(q)] || 0 })).sort((a, b) => a.t - b.t).slice(0, n).map(x => x.q);
}

function weakDrillChapters(subj) {
  const acc = chapterAccuracy(subj), sub = SUBJECTS[subj];
  const withMcq = sub.chapters.filter(c => sub.mcq.some(q => q.ch === c.id));
  const tested = withMcq.filter(c => acc[c.id] && acc[c.id][1] >= 2).map(c => ({ c, p: pct(acc[c.id][0], acc[c.id][1]) })).sort((a, b) => a.p - b.p);
  const weak = tested.filter(x => x.p < 75).map(x => x.c);
  const untested = withMcq.filter(c => !acc[c.id]);
  return [...weak, ...untested].slice(0, 3);
}

function studyStreak() {
  const days = new Set(S.history.map(h => h.date.slice(0, 10)));
  const d = today0(); let n = 0;
  const iso = x => new Date(x - x.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  if (!days.has(iso(d))) d.setDate(d.getDate() - 1);
  while (days.has(iso(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

function coverage(subj) {
  const all = SUBJECTS[subj].mcq;
  return { seen: all.filter(q => seenQs[qKey(q)]).length, total: all.length };
}

/* ---------- new test kinds ---------- */
const baseStartTest = startTest;
startTest = function (kind, ch) {
  const sub = SUBJECTS[S.subj];
  if (kind === "mistakes" || kind === "weak") {
    let mcq, title;
    if (kind === "mistakes") { mcq = shuffle(mistakeQs(S.subj)).slice(0, 20); title = "Mistake book revision"; }
    else {
      const chs = weakDrillChapters(S.subj).map(c => c.id);
      mcq = pickFresh(sub.mcq.filter(q => chs.includes(q.ch)), 15); title = "Weak-chapter drill";
    }
    if (!mcq.length) return;
    S.test = { kind, subj: S.subj, title, mcq, written: [], ans: {}, txt: {}, start: Date.now(), dur: Math.max(5, Math.ceil(mcq.length * 1.2)) * 60 };
    S.result = null; S.confirm = null; S.page = "tests";
    render(); window.scrollTo(0, 0);
    return;
  }
  baseStartTest(kind, ch);
  // Swap the random MCQs for fresh ones (chapter tests already use every question of the chapter).
  if (S.test && kind !== "chapter" && S.test.mcq.length) { S.test.mcq = pickFresh(sub.mcq, S.test.mcq.length); render(); }
};

const baseSubmitTest = submitTest;
submitTest = function () {
  const t = S.test;
  if (t) {
    const now = Date.now(), book = { ...mistakeBook(t.subj) };
    t.mcq.forEach((q, i) => {
      const k = qKey(q); seenQs[k] = now;
      if (t.ans[i] === q.a) { if (book[k]) { book[k] = { ...book[k], ok: book[k].ok + 1 }; if (book[k].ok >= 2) delete book[k]; } }
      else book[k] = { n: (book[k] ? book[k].n : 0) + 1, ok: 0, t: now };
    });
    const keys = Object.keys(seenQs);
    if (keys.length > SEEN_MAX) { keys.sort((a, b) => seenQs[a] - seenQs[b]).slice(0, keys.length - SEEN_MAX).forEach(k => delete seenQs[k]); }
    store.set("seenQs", seenQs);
    S.mistakes = { ...S.mistakes, [t.subj]: book };
    store.set("mistakes", S.mistakes);
  }
  baseSubmitTest();
};

/* ---------- screens ---------- */
function smartPracticeCards() {
  const subj = S.subj, nMist = mistakeQs(subj).length, weak = weakDrillChapters(subj), cov = coverage(subj);
  return `
  <h2>Smart practice · ${esc(SUBJECTS[subj].short)}</h2>
  <div class="grid g3 smart">
    <div class="card stack"><span class="label">${nMist} question${nMist === 1 ? "" : "s"} to fix</span><h3>Mistake book</h3>
      <p class="muted">Every MCQ answered wrongly is kept here until it is answered correctly twice in a row.</p>
      ${nMist ? `<button class="btn primary" data-act="start" data-kind="mistakes">Revise mistakes</button>` : `<p class="muted" style="font-size:.88rem">Empty. Wrong answers from any test will appear here.</p>`}</div>
    <div class="card stack"><span class="label">15 MCQs</span><h3>Weak-chapter drill</h3>
      <p class="muted">${weak.length ? "From " + weak.map(c => esc(c.name)).join(", ") + "." : "Take a few tests first."}</p>
      ${weak.length ? `<button class="btn primary" data-act="start" data-kind="weak">Start drill</button>` : ""}</div>
    <div class="card stack"><span class="label">Question bank covered</span><h3>${cov.seen} of ${cov.total}</h3>
      ${bar(pct(cov.seen, cov.total))}
      <p class="muted cover">Sprints and papers pick questions not seen before, so every test is new until the bank is covered.</p></div>
  </div>`;
}

const prepBasePageTests = pageTests;
pageTests = function () {
  const html = prepBasePageTests();
  if (S.test || S.result) return html;
  const i = html.indexOf(`<div class="grid g3">`);
  return i < 0 ? html + smartPracticeCards() : html.slice(0, i) + smartPracticeCards() + `<h2>Timed tests</h2>` + html.slice(i);
};

const prepBasePageHome = pageHome;
pageHome = function () {
  const html = prepBasePageHome();
  const streak = studyStreak(), nMist = SUBJ_KEYS.reduce((a, k) => a + mistakeQs(k).length, 0);
  const card = `<div class="card row spread">
    <div class="streak"><b>${streak}</b><span class="muted">day${streak === 1 ? "" : "s"} in a row with a test${streak ? "" : ". Take one today to start a streak"}</span></div>
    <div class="row">${nMist ? `<button class="btn" data-act="go" data-page="tests">Fix ${nMist} mistake${nMist === 1 ? "" : "s"}</button>` : ""}<button class="btn primary" data-act="go" data-page="tests">Practise now</button></div></div>`;
  const i = html.indexOf(`<div class="card stack today">`);
  return i < 0 ? html + card : html.slice(0, i) + card + html.slice(i);
};

view.addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (el && el.dataset.act === "reset") { S.mistakes = {}; seenQs = {}; store.set("mistakes", {}); store.set("seenQs", {}); render(); }
});
