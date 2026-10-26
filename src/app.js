/* CoachYourWard app logic. Plain JS, no build step, so it can be wrapped by Capacitor (Android) or Tauri (Windows) later. */

const store = {
  get(k, d) { try { const v = localStorage.getItem("cyw." + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("cyw." + k, JSON.stringify(v)); } catch (e) {} }
};

const PAGES = ["home", "plan", "topics", "papers", "hot", "tests", "revise", "progress", "jee"];
const SUBJ_KEYS = ["maths", "science", "english", "sanskrit", "social"];
const PLAN_START = "2026-10-26";
const DAY = 864e5;

const S = {
  page: "home",
  subj: store.get("subj", "maths"),
  topic: null,
  test: null,
  result: null,
  confirm: null,
  plan: store.get("plan", {}),
  history: store.get("history", []),
  examDate: store.get("examDate", "2027-02-17")
};
if (!SUBJ_KEYS.includes(S.subj)) S.subj = "maths";

const view = document.getElementById("view");
let timerId = null;

/* ---------- helpers ---------- */
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const chapterOf = (subj, id) => SUBJECTS[subj].chapters.find(c => c.id === id);
const chName = (subj, id) => (chapterOf(subj, id) || { name: id }).name;
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
const mmss = s => { s = Math.max(0, Math.round(s)); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); };
const fmtDate = iso => new Date(iso + (iso.length === 10 ? "T00:00:00" : "")).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const addDays = (iso, n) => { const d = new Date(iso + "T00:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const barClass = p => p >= 75 ? "good" : p >= 50 ? "warn" : "bad";
const bar = (p, cls = "") => `<div class="bar ${cls}" role="img" aria-label="${p}%"><i style="width:${Math.min(100, p)}%"></i></div>`;

function subjPills() {
  return `<div class="subj-pills" role="group" aria-label="Subject">${SUBJ_KEYS.map(k =>
    `<button class="pill ${k}" data-act="subj" data-v="${k}" aria-pressed="${S.subj === k}">${SUBJECTS[k].short}</button>`).join("")}</div>`;
}
function chunk(arr, sizes) { const out = []; let i = 0; for (const n of sizes) { out.push(arr.slice(i, i + n)); i += n; } return out; }
function evenChunks(arr, k) { const sizes = []; let left = arr.length; for (let i = k; i > 0; i--) { const n = Math.ceil(left / i); sizes.push(n); left -= n; } return chunk(arr, sizes); }

/* ---------- study plan ---------- */
function buildPlan() {
  const weeks = [];
  const m = SUBJECTS.maths.chapters, s = SUBJECTS.science.chapters, e = SUBJECTS.english.chapters;
  // English: interleave grammar/writing, First Flight and Footprints so every week mixes them
  const eg = e.filter(c => c.group === "Grammar" || c.group === "Writing");
  const ef = e.filter(c => c.group && (c.group.startsWith("First Flight") || c.group === "Reading"));
  const ep = e.filter(c => c.group === "Footprints without Feet");
  const eMix = []; for (let i = 0; i < Math.max(eg.length, ef.length, ep.length); i++) [eg[i], ef[i], ep[i]].forEach(c => c && eMix.push(c));
  // Sanskrit: alternate grammar/writing with textbook lessons; skip the internal-assessment-only lesson
  const sa = SUBJECTS.sanskrit.chapters;
  const sg = sa.filter(c => !c.id.startsWith("m-")), sl = sa.filter(c => c.id.startsWith("m-"));
  const saMix = []; for (let i = 0; i < Math.max(sg.length, sl.length); i++) [sl[i], sg[i]].forEach(c => c && saMix.push(c));
  // Social Science: rotate History, Geography, Political Science and Economics; school-test-only chapters stay out of the plan
  const so = SUBJECTS.social.chapters.filter(c => !["h-industrial", "e-consumer", "map"].includes(c.id));
  const byG = ["History", "Geography", "Political Science", "Economics"].map(g => so.filter(c => c.group === g));
  const soMix = []; for (let i = 0; i < Math.max(...byG.map(g => g.length)); i++) byG.forEach(g => g[i] && soMix.push(g[i]));
  const learn = { maths: chunk(m, [3, 3, 2, 2, 2, 2]), science: chunk(s, [2, 2, 2, 2, 2, 3]), english: evenChunks(eMix, 6), sanskrit: evenChunks(saMix, 6), social: evenChunks(soMix, 6) };
  const groups = { maths: evenChunks(m, 4), science: evenChunks(s, 4), english: evenChunks(e, 4), sanskrit: evenChunks(sa, 4), social: evenChunks(so, 4) };
  const phases = ["Close the gaps", "Hot questions and board questions", "Full mock papers", "Revise and rest"];
  for (let w = 0; w < 16; w++) {
    const start = addDays(PLAN_START, w * 7);
    const phase = w < 6 ? 0 : w < 10 ? 1 : w < 14 ? 2 : 3;
    const tasks = Object.fromEntries(SUBJ_KEYS.map(k => [k, []]));
    SUBJ_KEYS.forEach(k => {
      const t = tasks[k], id = n => `w${w + 1}-${k}-${n}`;
      if (phase === 0) {
        learn[k][w].forEach(c => t.push({ id: id(c.id), text: `Learn "${c.name}" and take its chapter test`, link: { page: "topics", subj: k, ch: c.id } }));
        if (k === "social") t.push({ id: id("map"), text: "Map practice: 15 minutes on a blank India map", link: { page: "topics", subj: k, ch: "map" } });
      } else if (phase === 1) {
        const g = groups[k][w - 6];
        const names = g.length > 3 ? `${g[0].name} to ${g[g.length - 1].name}` : g.map(c => c.name).join(", ");
        t.push({ id: id("board"), text: `Board questions: ${names}. Write full answers, then self-mark.`, link: { page: "papers", subj: k } });
        t.push({ id: id("hot"), text: `Hot Section: solve the ${SUBJECTS[k].short} questions from these chapters`, link: { page: "hot", subj: k } });
        t.push({ id: id("sprint"), text: "Section A sprint test (aim 16/20 or more)", link: { page: "tests", subj: k } });
      } else if (phase === 2) {
        t.push({ id: id("mock"), text: `Mini board paper (timed, 45 min)`, link: { page: "tests", subj: k } });
        t.push({ id: id("review"), text: "Rewrite every answer that lost marks in this week's paper" });
        t.push({ id: id("sprint"), text: "Section A sprint (aim 17/20 or more)", link: { page: "tests", subj: k } });
      } else if (w === 14) {
        t.push({ id: id("notes"), text: `Re-read key points and formulas for every ${SUBJECTS[k].short} chapter`, link: { page: "topics", subj: k } });
        t.push({ id: id("hot"), text: "Re-solve all Hot questions without looking", link: { page: "hot", subj: k } });
      } else {
        t.push({ id: id("mistakes"), text: "Last look: weakest chapters from the Progress page", link: { page: "progress", subj: k } });
        t.push({ id: id("rest"), text: "Sleep 8 hours; practise at the 10:30 am exam time" });
      }
    });
    weeks.push({ n: w + 1, start, end: addDays(start, 6), phase: phases[phase], tasks });
  }
  return weeks;
}
const PLAN = buildPlan();
const allTasks = () => PLAN.flatMap(w => SUBJ_KEYS.flatMap(k => w.tasks[k]));
function currentWeekIndex() {
  const i = Math.floor((today0() - new Date(PLAN_START + "T00:00:00")) / (7 * DAY));
  return Math.max(0, Math.min(15, i));
}
function planStats(subj) {
  const tasks = subj ? PLAN.flatMap(w => w.tasks[subj]) : allTasks();
  const done = tasks.filter(t => S.plan[t.id]).length;
  return { done, total: tasks.length, p: pct(done, tasks.length) };
}

/* ---------- history ---------- */
function chapterAccuracy(subj) {
  const acc = {};
  S.history.filter(h => h.subj === subj).forEach(h => Object.entries(h.chStats || {}).forEach(([ch, [r, t]]) => {
    acc[ch] = acc[ch] || [0, 0]; acc[ch][0] += r; acc[ch][1] += t;
  }));
  return acc;
}
function weakChapters(limit = 3) {
  const out = [];
  SUBJ_KEYS.forEach(k => Object.entries(chapterAccuracy(k)).forEach(([ch, [r, t]]) => { if (t >= 2) out.push({ subj: k, ch, p: pct(r, t), t }); }));
  return out.sort((a, b) => a.p - b.p).slice(0, limit);
}

/* ---------- pages ---------- */
function pageHome() {
  const days = Math.ceil((new Date(S.examDate + "T00:00:00") - today0()) / DAY);
  const wi = currentWeekIndex(), week = PLAN[wi];
  const started = today0() >= new Date(PLAN_START + "T00:00:00");
  const pending = SUBJ_KEYS.flatMap(k => week.tasks[k].map(t => ({ ...t, subj: k }))).filter(t => !S.plan[t.id]).slice(0, 4);
  const recent = S.history.slice(-4).reverse();
  const weak = weakChapters();
  const all = planStats();
  return `
  <div class="head"><div><h1>Dashboard</h1><p>Today's plan, the countdown and progress at a glance. The plan, tests and revision all feed this page.</p></div></div>
  ${todayCard(week, started, pending)}
  <div class="grid g3">
    <div class="card stack">
      <span class="label">Board exam</span>
      <div class="count"><b class="num">${Math.max(0, days)}</b><span class="muted">days left</span></div>
      <label class="row muted" style="font-size:.88rem">First paper <input type="date" id="examDate" value="${esc(S.examDate)}"></label>
      <span class="muted" style="font-size:.8rem">Assumed date. Change it when CBSE publishes the date sheet.</span>
    </div>
    <div class="card stack">
      <span class="label">Study plan</span>
      <div class="stat"><b>${all.p}%</b><span class="muted">${all.done} of ${all.total} tasks done</span></div>
      ${bar(all.p)}
      <div class="stack" style="gap:6px">${SUBJ_KEYS.map(k => { const st = planStats(k); return `<div class="row spread" style="font-size:.88rem"><span>${SUBJECTS[k].short}</span><span class="num">${st.p}%</span></div>`; }).join("")}</div>
    </div>
    <div class="card stack">
      <span class="label">Tests taken</span>
      <div class="stat"><b>${S.history.length}</b><span class="muted">${S.history.length ? "average " + pct(S.history.reduce((a, h) => a + h.score, 0), S.history.reduce((a, h) => a + h.max, 0)) + "%" : "Take the first one today"}</span></div>
      <button class="btn" data-act="go" data-page="tests">Start a test</button>
    </div>
  </div>
  <div class="grid g2">
    <div class="card stack">
      <h3>Recent tests</h3>
      ${recent.length ? `<div class="table-wrap"><table class="hist"><tbody>${recent.map(h => `<tr><td>${SUBJECTS[h.subj].short}</td><td>${esc(h.title)}</td><td class="num">${h.score}/${h.max}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">No tests yet. Scores appear here after the first one.</p>`}
    </div>
    <div class="card stack">
      <h3>Weakest chapters</h3>
      ${weak.length ? weak.map(w => `<div class="stack" style="gap:4px"><div class="row spread"><span>${SUBJECTS[w.subj].short}: ${esc(chName(w.subj, w.ch))}</span><span class="num">${w.p}%</span></div>${bar(w.p, barClass(w.p))}</div>`).join("") : `<p class="muted">After a few tests, the chapters with the lowest accuracy show up here so revision goes where marks are being lost.</p>`}
    </div>
  </div>`;
}

// The "what to do now" card; coach.js replaces it with the daily coach plan.
function todayCard(week, started, pending) {
  return `<div class="card stack today">
    <div class="row spread"><h2>${started ? "This week" : "Week 1 starts Monday, 26 Oct"}: ${esc(week.phase)}</h2><span class="tag">Week ${week.n} · ${fmtDate(week.start)} to ${fmtDate(week.end)}</span></div>
    ${pending.length ? `<div class="stack" style="gap:2px">${pending.map(t => taskRow(t, t.subj, true)).join("")}</div>` : `<p class="muted">Everything for this week is ticked off. Use the Hot Section for extra practice.</p>`}
    <div><button class="btn ghost" data-act="go" data-page="plan">Open the full plan</button></div>
  </div>`;
}

function taskRow(t, subj, showSubj) {
  const done = !!S.plan[t.id];
  const go = t.link ? `<button class="btn small ghost go" data-act="link" data-page="${t.link.page}" data-subj="${t.link.subj || ""}" data-ch="${t.link.ch || ""}">Open</button>` : "";
  return `<label class="task ${done ? "done" : ""}"><input type="checkbox" data-act="task" data-id="${t.id}" ${done ? "checked" : ""}><span>${showSubj ? `<b class="subj-h ${subj}" style="font-size:.75rem">${SUBJECTS[subj].short}</b> ` : ""}${esc(t.text)}</span>${go}</label>`;
}

function pagePlan() {
  const wi = currentWeekIndex();
  return `
  <div class="head"><div><h1>Study Plan</h1><p>16 weeks from 26 October to the board exam. Tick tasks as they are done; the Dashboard and Progress pages update from these ticks.</p></div></div>
  <div class="grid g4">${SUBJ_KEYS.map(k => { const st = planStats(k); return `<div class="card stack"><div class="row spread"><span class="subj-h ${k}">${SUBJECTS[k].short}</span><span class="num">${st.done}/${st.total}</span></div>${bar(st.p)}</div>`; }).join("")}</div>
  <div class="card stack" style="gap:6px">
    <span class="label">Four phases</span>
    <p>Weeks 1–6: close the gaps, chapter by chapter. Weeks 7–10: Hot Section and board questions. Weeks 11–14: full mock papers (school pre-boards usually fall here). Weeks 15–16: revise and rest.</p>
  </div>
  <div class="stack">${PLAN.map((w, i) => {
    const tasks = SUBJ_KEYS.flatMap(k => w.tasks[k]); const done = tasks.filter(t => S.plan[t.id]).length;
    return `<details class="week ${i === wi ? "current" : ""}" ${i === wi ? "open" : ""}>
      <summary><span class="wk">Week ${w.n}</span><b>${esc(w.phase)}</b><span class="muted" style="font-size:.88rem">${fmtDate(w.start)} – ${fmtDate(w.end)}</span>${i === wi ? `<span class="tag">This week</span>` : ""}<span class="num muted" style="margin-left:auto;font-size:.88rem">${done}/${tasks.length}</span></summary>
      <div class="body">${SUBJ_KEYS.map(k => `<div class="stack" style="gap:2px"><span class="subj-h ${k}">${SUBJECTS[k].short}</span>${w.tasks[k].map(t => taskRow(t, k, false)).join("")}</div>`).join("")}</div>
    </details>`; }).join("")}</div>`;
}

function pageTopics() {
  const sub = SUBJECTS[S.subj];
  if (S.topic) return topicDetail(sub, chapterOf(S.subj, S.topic));
  let lastGroup = null, n = 0;
  const items = sub.chapters.map(c => {
    n++;
    const head = c.group && c.group !== lastGroup ? `</div><h3 class="group-title">${esc(c.group)}</h3><div class="ch-list">` : "";
    lastGroup = c.group;
    const acc = chapterAccuracy(S.subj)[c.id];
    return `${head}<button class="ch-btn" data-act="topic" data-v="${c.id}"><span class="n">${c.group ? "" : "Ch " + n}</span><b>${esc(c.name)}</b>${acc ? `<span class="muted" style="font-size:.82rem">Test accuracy ${pct(acc[0], acc[1])}%</span>` : `<span class="muted" style="font-size:.82rem">Not tested yet</span>`}</button>`;
  }).join("");
  return `
  <div class="head"><div><h1>Topics</h1><p>Every chapter in plain language: the core idea, what to remember, a solved example, the mistake that costs marks, and how to write it in the exam.</p></div>${subjPills()}</div>
  ${sub.note ? `<div class="callout tip">${esc(sub.note)}</div>` : ""}
  <div class="ch-list">${items}</div>`;
}

function topicDetail(sub, c) {
  const list = sub.chapters, i = list.indexOf(c);
  const nMcq = sub.mcq.filter(q => q.ch === c.id).length, nW = sub.written.filter(q => q.ch === c.id).length, nH = sub.hot.filter(q => q.ch === c.id).length;
  return `
  <div><button class="btn ghost" data-act="topic" data-v="">← All ${esc(sub.short)} topics</button></div>
  <div class="head"><div><span class="label">${esc(c.group || sub.short + " · Chapter " + (i + 1))}</span><h1>${esc(c.name)}</h1></div></div>
  <div class="card notes stack"><span class="label">The idea in simple words</span><p style="font-size:1.08rem">${esc(c.gist)}</p></div>
  <div class="grid g2">
    <div class="card notes stack"><span class="label">Remember these</span><ul>${c.points.map(p => `<li>${esc(p)}</li>`).join("")}</ul></div>
    <div class="stack">
      ${c.formulas.length ? `<div class="card stack"><span class="label">${S.subj === "science" ? "Key equations" : S.subj === "social" ? "Key dates and terms" : "Formulas"}</span>${c.formulas.map(f => `<div class="formula">${esc(f)}</div>`).join("")}</div>` : ""}
      <div class="callout warn"><b>Common mistake.</b> ${esc(c.mistake)}</div>
      <div class="callout tip"><b>Exam tip.</b> ${esc(c.tip)}</div>
    </div>
  </div>
  <div class="card stack"><span class="label">Solved example</span><p class="q" style="font-weight:600">${esc(c.example.q)}</p><details><summary>Show the solution</summary><div class="solution">${esc(c.example.a)}</div></details></div>
  <div class="card row spread">
    <div class="row">
      ${nMcq ? `<button class="btn primary" data-act="start" data-kind="chapter" data-ch="${c.id}">Take chapter test (${nMcq} Qs)</button>` : ""}
      ${nW ? `<button class="btn" data-act="go" data-page="papers">Board questions (${nW})</button>` : ""}
      ${nH ? `<button class="btn hot" data-act="go" data-page="hot">Hot questions (${nH})</button>` : ""}
    </div>
    <div class="row">
      ${i > 0 ? `<button class="btn small" data-act="topic" data-v="${list[i - 1].id}">← Previous</button>` : ""}
      ${i < list.length - 1 ? `<button class="btn small" data-act="topic" data-v="${list[i + 1].id}">Next →</button>` : ""}
    </div>
  </div>`;
}

function writtenCard(q, subj, n) {
  return `<div class="card q-card">
    <div class="row spread"><span class="label">${esc(chName(subj, q.ch))}</span><span class="tag marks">${q.marks} marks</span></div>
    <p class="q">${n ? `<span class="qnum">Q${n}.</span> ` : ""}${esc(q.q)}</p>
    <details><summary>Model answer</summary><div class="stack"><div class="solution">${esc(q.a)}</div>
      <div class="table-wrap"><table class="points"><tbody><tr><td colspan="2"><span class="label">How the marks are given</span></td></tr>${q.points.map(([p, m]) => `<tr><td>${esc(p)}</td><td>${m}</td></tr>`).join("")}</tbody></table></div></div></details>
  </div>`;
}

function pagePapers() {
  if (S.paperId && typeof paperView === "function") return paperView();
  const sub = SUBJECTS[S.subj];
  return `
  <div class="head"><div><h1>Past Papers</h1><p>The paper pattern, each year's official CBSE paper, and the questions the board repeats most, solved the way the marking scheme awards marks.</p></div>${subjPills()}</div>
  <div class="card stack"><span class="label">${esc(sub.name)} · paper pattern 2026–27</span><p>${esc(sub.pattern)}</p></div>
  ${typeof paperArchive === "function" ? paperArchive() : ""}
  <div class="row spread"><h2>Most-repeated board questions</h2><button class="btn primary" data-act="start" data-kind="mock">Practise as a timed paper</button></div>
  <div class="stack">${sub.written.map((q, i) => writtenCard(q, S.subj, i + 1)).join("")}</div>
  <p class="muted" style="font-size:.9rem">How to write for full marks: write the formula or the key idea before using it, number your steps, underline or box the final answer, give units, and keep to the word limit in English.</p>`;
}

function pageHot() {
  const sub = SUBJECTS[S.subj];
  return `
  <div class="head"><div><h1>Hot Section</h1><p>Questions harder than the board average. These separate 85% from 95%. Try for 10 minutes before opening the hint, and only then the solution.</p></div>${subjPills()}</div>
  <div class="stack">${sub.hot.map((q, i) => `<div class="card q-card hot-card">
    <div class="row spread"><span class="label">${esc(chName(S.subj, q.ch))}</span><span class="tag hot">Harder than average</span></div>
    <p class="q"><span class="qnum">H${i + 1}.</span> ${esc(q.q)}</p>
    <p class="muted" style="font-size:.9rem">Why it's hard: ${esc(q.why)}</p>
    <details><summary>Hint</summary><div class="solution">${esc(q.hint)}</div></details>
    <details><summary>Full solution</summary><div class="solution">${esc(q.a)}</div></details>
  </div>`).join("")}</div>`;
}

/* ---------- tests ---------- */
function startTest(kind, ch) {
  const sub = SUBJECTS[S.subj];
  let mcq = [], written = [], mins, title;
  if (kind === "chapter") { mcq = shuffle(sub.mcq.filter(q => q.ch === ch)); if (!mcq.length) written = sub.written.filter(q => q.ch === ch); mins = Math.max(5, Math.ceil(mcq.length * 1.5) + written.reduce((m, q) => m + q.marks * 2, 0)); title = "Chapter test: " + chName(S.subj, ch); }
  else if (kind === "sprint") { mcq = shuffle(sub.mcq).slice(0, 20); mins = 24; title = "Section A sprint"; }
  else if (kind === "full") {
    // Full paper: 20 MCQs, then written questions (passages first) up to 60 more marks, as in the 80-mark board paper
    mcq = shuffle(sub.mcq).slice(0, 20); let m = 0;
    const pool = [...shuffle(sub.written.filter(q => q.marks >= 10)).slice(0, 1), ...shuffle(sub.written.filter(q => q.marks < 10))];
    pool.forEach(q => { if (m + q.marks <= 60) { written.push(q); m += q.marks; } });
    mins = 180; title = "Full board paper";
  }
  else { mcq = shuffle(sub.mcq).slice(0, 10); written = shuffle(sub.written).slice(0, 3); mins = 45; title = "Mini board paper"; }
  S.test = { kind, subj: S.subj, title, mcq, written, ans: {}, txt: {}, start: Date.now(), dur: mins * 60 };
  S.result = null; S.confirm = null; S.page = "tests";
  render();
  window.scrollTo(0, 0);
}

function pageTests() {
  if (S.test) return testView();
  if (S.result) return resultView();
  const sub = SUBJECTS[S.subj];
  const chs = sub.chapters.filter(c => sub.mcq.some(q => q.ch === c.id));
  return `
  <div class="head"><div><h1>Timed Tests</h1><p>Every test runs on a clock and is marked instantly. Written answers are self-marked against the board's marking points.</p></div>${subjPills()}</div>
  <div class="grid g3">
    <div class="card stack"><span class="label">15 minutes or less</span><h3>Chapter test</h3><p class="muted">All MCQs from one chapter. Use after reading the topic.</p>
      <select id="chSel" aria-label="Chapter">${chs.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}</select>
      <button class="btn primary" data-act="start" data-kind="chapter">Start</button></div>
    <div class="card stack"><span class="label">24 minutes · 20 marks</span><h3>Section A sprint</h3><p class="muted">20 MCQs from the whole syllabus, the way Section A looks in the board paper.</p><button class="btn primary" data-act="start" data-kind="sprint">Start</button></div>
    <div class="card stack"><span class="label">45 minutes · 10 MCQs + 3 written</span><h3>Mini board paper</h3><p class="muted">Mixed MCQs and board-style written questions, self-marked with the marking scheme.</p><button class="btn primary" data-act="start" data-kind="mock">Start</button></div>
  </div>
  <div class="card row spread"><div class="stack" style="gap:4px"><span class="label">3 hours · up to 80 marks</span><h3>Full board paper</h3><p class="muted">20 MCQs and written questions up to 60 marks, drawn fresh from the question bank each time. Sit it in one go, like the real exam.</p></div><button class="btn primary" data-act="start" data-kind="full">Start full paper</button></div>
  <div class="card stack"><span class="label">Full paper pattern</span><p>${esc(sub.pattern)}</p></div>`;
}

function testView() {
  const t = S.test, left = t.dur - (Date.now() - t.start) / 1000;
  const answered = Object.keys(t.ans).length;
  return `
  <div class="test-bar">
    <div><b>${esc(SUBJECTS[t.subj].short)} · ${esc(t.title)}</b><div class="muted" style="font-size:.85rem"><span id="answered">${answered}</span> of ${t.mcq.length} MCQs answered</div></div>
    <div class="row"><span class="timer ${left < 120 ? "low" : ""}" id="timer" aria-live="off">${mmss(left)}</span>
      ${S.confirm === "submit" ? `<span class="confirm row">Submit now? <button class="btn small primary" data-act="submit">Yes, submit</button><button class="btn small" data-act="cancel">Keep going</button></span>` : `<button class="btn primary" data-act="ask-submit">Submit</button>`}
      ${S.confirm === "quit" ? `<span class="confirm row">Quit without saving? <button class="btn small" data-act="quit">Quit</button><button class="btn small" data-act="cancel">Stay</button></span>` : `<button class="btn" data-act="ask-quit">Quit</button>`}
    </div>
  </div>
  ${t.mcq.length ? `<h2>Section A · Multiple choice</h2>` : ""}
  ${t.mcq.map((q, i) => `<div class="card q-card"><div class="row spread"><span class="qnum">Q${i + 1}</span><span class="tag marks">1 mark</span></div><p class="q">${esc(q.q)}</p>${typeof figHtml === "function" ? figHtml(q) : ""}
    <div class="opts">${q.o.map((o, j) => `<label class="opt"><input type="radio" name="q${i}" value="${j}" data-act="ans" data-i="${i}" ${t.ans[i] === j ? "checked" : ""}><span>(${"abcd"[j]}) ${esc(o)}</span></label>`).join("")}</div></div>`).join("")}
  ${t.written.length ? `<h2>Written answers</h2><p class="muted">Write the answer on paper (or below) as you would in the exam. After submitting, compare with the model answer and tick the marking points you earned.</p>` : ""}
  ${t.written.map((q, i) => `<div class="card q-card"><div class="row spread"><span class="qnum">W${i + 1} · ${esc(chName(t.subj, q.ch))}</span><span class="tag marks">${q.marks} marks</span></div><p class="q">${esc(q.q)}</p>${typeof figHtml === "function" ? figHtml(q) : ""}
    <textarea id="w${i}" data-act="txt" data-i="${i}" placeholder="Rough answer (optional)">${esc(t.txt[i] || "")}</textarea></div>`).join("")}
  <div><button class="btn primary" data-act="ask-submit">Submit test</button></div>`;
}

function submitTest() {
  const t = S.test; clearInterval(timerId);
  const secs = Math.min(t.dur, Math.round((Date.now() - t.start) / 1000));
  const chStats = {}; let right = 0;
  t.mcq.forEach((q, i) => { const ok = t.ans[i] === q.a; if (ok) right++; chStats[q.ch] = chStats[q.ch] || [0, 0]; chStats[q.ch][0] += ok ? 1 : 0; chStats[q.ch][1]++; });
  S.result = { ...t, secs, right, chStats, self: {}, saved: false };
  S.test = null; S.confirm = null;
  if (!t.written.length) saveResult();
  render(); window.scrollTo(0, 0);
}

function saveResult() {
  const r = S.result;
  const wScore = r.written.reduce((a, q, i) => a + q.points.reduce((b, [, m], j) => b + (r.self[i + "-" + j] ? m : 0), 0), 0);
  const wMax = r.written.reduce((a, q) => a + q.marks, 0);
  r.wScore = wScore;
  S.history.push({ id: Date.now(), date: new Date().toISOString(), subj: r.subj, kind: r.kind, title: r.title, score: r.right + wScore, max: r.mcq.length + wMax, secs: r.secs, chStats: r.chStats });
  store.set("history", S.history);
  r.saved = true;
}

function resultView() {
  const r = S.result, mcqP = pct(r.right, r.mcq.length);
  const total = r.saved ? r.right + r.wScore : r.right;
  const max = r.saved ? r.mcq.length + r.written.reduce((a, q) => a + q.marks, 0) : r.mcq.length;
  return `
  <div class="head"><div><span class="label">${esc(SUBJECTS[r.subj].short)} · result</span><h1>${esc(r.title)}</h1></div></div>
  <div class="grid g3">
    <div class="card stack"><span class="label">${r.saved ? "Score" : "MCQ score"}</span><span class="score-big num">${total}<span class="muted" style="font-size:1.4rem">/${max}</span></span>${bar(pct(total, max), barClass(pct(total, max)))}</div>
    <div class="card stack"><span class="label">Time used</span><span class="score-big num" style="font-size:2.2rem">${mmss(r.secs)}</span><span class="muted">of ${mmss(r.dur)} allowed</span></div>
    <div class="card stack"><span class="label">By chapter</span>${Object.entries(r.chStats).map(([ch, [a, b]]) => `<div class="row spread" style="font-size:.9rem"><span>${esc(chName(r.subj, ch))}</span><span class="num">${a}/${b}</span></div>`).join("")}</div>
  </div>
  ${r.written.length && !r.saved ? `<div class="card stack" style="border-color:var(--accent)"><h2>Step 2: mark your written answers</h2><p class="muted">Compare what you wrote with the model answer. Tick only the points you clearly wrote. Be strict; the board examiner will be.</p></div>
    ${r.written.map((q, i) => `<div class="card q-card"><div class="row spread"><span class="qnum">W${i + 1}</span><span class="tag marks">${q.marks} marks</span></div><p class="q">${esc(q.q)}</p>${typeof figHtml === "function" ? figHtml(q) : ""}
      ${r.txt[i] ? `<div><span class="label">Your answer</span><div class="solution">${esc(r.txt[i])}</div></div>` : ""}
      <div><span class="label">Model answer</span><div class="solution">${esc(q.a)}</div></div>
      <div class="stack" style="gap:4px">${q.points.map(([p, m], j) => `<label class="task"><input type="checkbox" data-act="self" data-k="${i}-${j}" ${r.self[i + "-" + j] ? "checked" : ""}><span>${esc(p)}</span><span class="num go">${m}</span></label>`).join("")}</div></div>`).join("")}
    <div><button class="btn primary" data-act="save-result">Save final score</button></div>` : ""}
  ${r.saved ? `<div class="row"><span class="tag good">Saved to Progress</span><button class="btn" data-act="retake">Take another ${esc(SUBJECTS[r.subj].short)} test</button><button class="btn ghost" data-act="go" data-page="progress">See progress</button></div>` : ""}
  ${r.mcq.length ? `<h2>Review: MCQs (${r.right}/${r.mcq.length}, ${mcqP}%)</h2>` : ""}
  ${r.mcq.map((q, i) => { const a = r.ans[i]; return `<div class="card q-card"><div class="row spread"><span class="qnum">Q${i + 1} · ${esc(chName(r.subj, q.ch))}</span>${a === q.a ? `<span class="tag good">Correct</span>` : a === undefined ? `<span class="tag bad">Not answered</span>` : `<span class="tag bad">Wrong</span>`}</div><p class="q">${esc(q.q)}</p>${typeof figHtml === "function" ? figHtml(q) : ""}
    <div class="opts">${q.o.map((o, j) => `<div class="opt ${j === q.a ? "right" : j === a ? "wrong" : ""}"><span>(${"abcd"[j]}) ${esc(o)}</span></div>`).join("")}</div>
    <p class="muted" style="font-size:.92rem"><b>Why:</b> ${esc(q.e)}</p></div>`; }).join("")}`;
}

function tick() {
  if (!S.test) return clearInterval(timerId);
  const left = S.test.dur - (Date.now() - S.test.start) / 1000;
  const el = document.getElementById("timer");
  if (el) { el.textContent = mmss(left); el.classList.toggle("low", left < 120); }
  if (left <= 0) submitTest();
}

/* ---------- progress & JEE ---------- */
function pageProgress() {
  const acc = chapterAccuracy(S.subj), sub = SUBJECTS[S.subj];
  const hist = S.history.slice().reverse();
  return `
  <div class="head"><div><h1>Progress</h1><p>Test scores and plan completion. Chapters below 60% need another round of Topics and a retest.</p></div>${subjPills()}</div>
  <div class="grid g4">${SUBJ_KEYS.map(k => { const h = S.history.filter(x => x.subj === k); const p = pct(h.reduce((a, x) => a + x.score, 0), h.reduce((a, x) => a + x.max, 0)); const st = planStats(k);
    return `<div class="card stack"><span class="subj-h ${k}">${SUBJECTS[k].short}</span><div class="row spread"><span class="muted">Tests</span><span class="num">${h.length}${h.length ? " · avg " + p + "%" : ""}</span></div>${h.length ? bar(p, barClass(p)) : ""}<div class="row spread"><span class="muted">Plan</span><span class="num">${st.done}/${st.total}</span></div>${bar(st.p)}</div>`; }).join("")}</div>
  <div class="card stack"><h2>${esc(sub.short)}: accuracy by chapter</h2>
    <div class="stack">${sub.chapters.map(c => { const a = acc[c.id]; const p = a ? pct(a[0], a[1]) : null;
      return `<div class="row" style="gap:12px"><span style="flex:1 1 200px;min-width:0">${esc(c.name)}</span><span style="flex:2 1 160px">${p === null ? `<span class="muted" style="font-size:.85rem">Not tested</span>` : bar(p, barClass(p))}</span><span class="num" style="width:7ch;text-align:right">${p === null ? "" : p + "%"}</span></div>`; }).join("")}</div></div>
  <div class="card stack"><h2>Test history</h2>
    ${hist.length ? `<div class="table-wrap"><table class="hist full"><thead><tr><th>Date</th><th>Subject</th><th>Test</th><th>Time</th><th style="text-align:right">Score</th></tr></thead><tbody>${hist.map(h => `<tr><td>${fmtDate(h.date)}</td><td>${SUBJECTS[h.subj].short}</td><td>${esc(h.title)}</td><td class="num">${mmss(h.secs)}</td><td class="num">${h.score}/${h.max}<span class="pc"> (${pct(h.score, h.max)}%)</span></td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">No tests yet.</p>`}
  </div>
  <div class="row">${S.confirm === "reset" ? `<span class="confirm row">Erase all test history and plan ticks on this device? <button class="btn small" data-act="reset">Erase</button><button class="btn small" data-act="cancel">Cancel</button></span>` : `<button class="btn" data-act="ask-reset">Reset progress</button>`}</div>`;
}

function pageJee() {
  return `
  <div class="head"><div><h1>JEE Foundation</h1><p>A second track for the same student. Light until the boards (2–3 hours a week), then the main track from April 2027. It never replaces a board chapter in the daily plan.</p></div></div>
  <div class="grid g3">
    <div class="card stack"><span class="label">Now to Feb 2027</span><h3>Stretch problems</h3><p class="muted">Multi-step problems on Class 10 chapters that JEE builds on: quadratics, AP, coordinate geometry, trigonometry, electricity, light, carbon compounds.</p></div>
    <div class="card stack"><span class="label">Apr to May 2027</span><h3>Bridge course</h3><p class="muted">Into Class 11: units and dimensions, vectors, kinematics, mole concept, sets and functions.</p></div>
    <div class="card stack"><span class="label">Class 11 and 12</span><h3>JEE Main pattern</h3><p class="muted">MCQs and numerical-answer questions with negative marking, chapter-wise previous year questions, speed drills.</p></div>
  </div>
  <h2>Stretch problems</h2>
  <div class="stack">${JEE_FOUNDATION.map((q, i) => `<div class="card q-card"><div class="row spread"><span class="label">${esc(q.area)} · ${esc(q.topic)}</span><span class="tag">JEE stretch</span></div><p class="q"><span class="qnum">J${i + 1}.</span> ${esc(q.q)}</p><details><summary>Solution</summary><div class="solution">${esc(q.a)}</div></details></div>`).join("")}</div>`;
}

/* ---------- render & events ---------- */
const EXTRA_PAGES = {};
function render() {
  // Pages added by later scripts (coach.js) register in EXTRA_PAGES.
  const fn = { home: pageHome, plan: pagePlan, topics: pageTopics, papers: pagePapers, hot: pageHot, tests: pageTests, progress: pageProgress, jee: pageJee, ...EXTRA_PAGES }[S.page] || pageHome;
  view.innerHTML = fn();
  document.querySelectorAll("#nav button").forEach(b => b.setAttribute("aria-current", b.dataset.page === S.page ? "page" : "false"));
  // On phones the nav is a horizontal strip: keep the current page's tab in view.
  const rail = document.querySelector(".rail"), cur = document.querySelector('#nav button[aria-current="page"]');
  if (rail && cur && rail.scrollWidth > rail.clientWidth) rail.scrollLeft = cur.offsetLeft - (rail.clientWidth - cur.offsetWidth) / 2;
  clearInterval(timerId);
  if (S.test) timerId = setInterval(tick, 1000);
}
function go(page) {
  if (S.test && page !== "tests") { S.page = "tests"; S.confirm = "quit"; render(); return; }
  S.page = page; S.confirm = null;
  if (page !== "topics") S.topic = null;
  try { history.replaceState(null, "", "#" + page); } catch (e) {}
  render(); window.scrollTo(0, 0);
}
function setSubj(k) { S.subj = k; S.topic = null; store.set("subj", k); }

document.getElementById("nav").addEventListener("click", e => { const b = e.target.closest("button[data-page]"); if (b) go(b.dataset.page); });

view.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const a = el.dataset.act;
  if (a === "subj") { if (S.result && S.page === "tests") S.result = null; setSubj(el.dataset.v); render(); }
  else if (a === "go") go(el.dataset.page);
  else if (a === "link") { if (el.dataset.subj) setSubj(el.dataset.subj); go(el.dataset.page); if (el.dataset.ch) { S.topic = el.dataset.ch; render(); } e.preventDefault(); }
  else if (a === "topic") { S.topic = el.dataset.v || null; render(); window.scrollTo(0, 0); }
  else if (a === "start") { const ch = el.dataset.ch || (document.getElementById("chSel") || {}).value; startTest(el.dataset.kind, ch); }
  else if (a === "ask-submit") { S.confirm = "submit"; render(); }
  else if (a === "ask-quit") { S.confirm = "quit"; render(); }
  else if (a === "cancel") { S.confirm = null; render(); }
  else if (a === "submit") submitTest();
  else if (a === "quit") { S.test = null; S.confirm = null; render(); }
  else if (a === "save-result") { saveResult(); render(); window.scrollTo(0, 0); }
  else if (a === "retake") { S.result = null; render(); }
  else if (a === "ask-reset") { S.confirm = "reset"; render(); }
  else if (a === "reset") { S.history = []; S.plan = {}; store.set("history", []); store.set("plan", {}); S.confirm = null; render(); }
});

view.addEventListener("change", e => {
  const el = e.target;
  if (el.id === "examDate" && el.value) { S.examDate = el.value; store.set("examDate", el.value); render(); return; }
  const a = el.dataset.act;
  if (a === "task") { if (el.checked) S.plan[el.dataset.id] = Date.now(); else delete S.plan[el.dataset.id]; store.set("plan", S.plan); render(); }
  else if (a === "ans") { S.test.ans[+el.dataset.i] = +el.value; const n = document.getElementById("answered"); if (n) n.textContent = Object.keys(S.test.ans).length; }
  else if (a === "self") { S.result.self[el.dataset.k] = el.checked; }
});
view.addEventListener("input", e => { if (e.target.dataset.act === "txt" && S.test) S.test.txt[+e.target.dataset.i] = e.target.value; });

const fromHash = (location.hash || "").slice(1);
if (PAGES.includes(fromHash)) S.page = fromHash;
// First render once every script has loaded, so pages extended by later scripts (prep.js, coach.js, print.js) are complete.
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render); else render();
