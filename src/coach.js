/* Daily coach: today's plan on the Dashboard, spaced revision of every chapter (1, 3, 7 and 21 days after it is
   learnt or tested), exam-week mode with a date sheet and quick-revision sheets, and a weekly full mock.
   Adds the Revision page. Loads after prep.js and papers.js. */
const REVISE_GAPS = [1, 3, 7, 21];
const EXAM_MODE_DAYS = 14;
S.revise = store.get("revise", {});
S.dateSheet = store.get("dateSheet", {});
let reviseTab = "due";

(function () {
  const css = `
.coach-item { display: flex; gap: 10px; align-items: center; padding: 8px 0; border-top: 1px solid var(--line); font-size: .95rem; }
.coach-item:first-of-type { border-top: 0; }
.coach-item .what { flex: 1; min-width: 0; }
.coach-item .mins { font-family: var(--mono); font-size: .8rem; color: var(--muted); flex: none; }
.coach-item.done .what { color: var(--muted); text-decoration: line-through; }
.coach-item .tick { width: 20px; flex: none; color: var(--good); font-weight: 700; text-align: center; }
.exam-banner { border-color: var(--hot); box-shadow: 0 0 0 1px var(--hot); }
.sheet h3 { margin-top: 6px; }
.sheet .formula { font-size: .92rem; }
.sheet ul { margin: 4px 0 0; padding-left: 20px; }
.tabs { display: flex; gap: 6px; flex-wrap: wrap; }
.ds-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 6px 0; border-top: 1px solid var(--line); }
@media print {
  .rail, .no-print, .tabs { display: none !important; }
  .app { display: block; }
  .card { break-inside: avoid; border-color: #ccc; }
}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
})();

/* ---------- dates ---------- */
const isoOf = d => new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const todayIso = () => isoOf(today0());
const daysUntil = iso => Math.round((new Date(iso + "T00:00:00") - today0()) / DAY);

/* ---------- spaced revision ---------- */
const revKey = (subj, ch) => subj + "|" + ch;
function saveRevise() { store.set("revise", S.revise); }

// Put a chapter on the revision schedule (or back to the first step when it was answered badly).
function scheduleRevision(subj, ch, restart) {
  if (!SUBJECTS[subj] || !chapterOf(subj, ch)) return;
  const k = revKey(subj, ch), cur = S.revise[k];
  if (cur && !restart) return;
  S.revise[k] = { s: 0, due: addDays(todayIso(), REVISE_GAPS[0]) };
}
// After a revision: move to the next gap if it went well, start again if not. Done after the 21-day step.
function finishRevision(subj, ch, ok) {
  const k = revKey(subj, ch), cur = S.revise[k] || { s: 0 };
  if (!ok) S.revise[k] = { s: 0, due: addDays(todayIso(), REVISE_GAPS[0]) };
  else if (cur.s + 1 >= REVISE_GAPS.length) S.revise[k] = { s: REVISE_GAPS.length, done: todayIso() };
  else S.revise[k] = { s: cur.s + 1, due: addDays(todayIso(), REVISE_GAPS[cur.s + 1]) };
  saveRevise();
}
// Chapters tested or ticked as learnt before spaced revision existed join the schedule, a day after that test or tick.
// Saved without marking progress as changed, so an older copy on this device never overrides newer progress in the account.
function seedRevisions() {
  let added = false;
  const add = (subj, ch, when) => {
    const k = revKey(subj, ch);
    if (S.revise[k] || !SUBJECTS[subj] || !chapterOf(subj, ch)) return;
    S.revise[k] = { s: 0, due: addDays(isoOf(new Date(when)), REVISE_GAPS[0]) }; added = true;
  };
  S.history.filter(h => h.kind === "chapter").forEach(h => Object.keys(h.chStats || {}).forEach(ch => add(h.subj, ch, h.date)));
  Object.entries(S.plan).forEach(([id, v]) => { const m = /^w\d+-([a-z]+)-(.+)$/.exec(id); if (m && typeof v === "number") add(m[1], m[2], v); });
  if (added) try { localStorage.setItem("cyw.revise", JSON.stringify(S.revise)); } catch (e) {}
}

function dueRevisions() {
  seedRevisions();
  const t = todayIso();
  return Object.entries(S.revise).filter(([, v]) => v.due && v.due <= t)
    .map(([k, v]) => { const [subj, ch] = k.split("|"); return { subj, ch, ...v, late: -daysUntil(v.due) }; })
    .filter(r => SUBJECTS[r.subj] && chapterOf(r.subj, r.ch))
    .sort((a, b) => a.due.localeCompare(b.due) || a.s - b.s);
}
function upcomingRevisions(days) {
  const t = todayIso(), end = addDays(t, days);
  return Object.entries(S.revise).filter(([, v]) => v.due && v.due > t && v.due <= end)
    .map(([k, v]) => { const [subj, ch] = k.split("|"); return { subj, ch, ...v }; })
    .filter(r => SUBJECTS[r.subj] && chapterOf(r.subj, r.ch))
    .sort((a, b) => a.due.localeCompare(b.due));
}
const hasMcq = (subj, ch) => SUBJECTS[subj].mcq.some(q => q.ch === ch);
const stepLabel = s => `Step ${s + 1} of ${REVISE_GAPS.length}`;

/* ---------- tests: revision quiz, weekly mock ---------- */
const coachBaseStartTest = startTest;
startTest = function (kind, ch) {
  if (kind === "revise") {
    const [subj, chId] = String(ch).split("|");
    if (!SUBJECTS[subj]) return;
    S.subj = subj; store.set("subj", subj);
    const pool = SUBJECTS[subj].mcq.filter(q => q.ch === chId);
    const book = mistakeBook(subj);
    const wrong = pool.filter(q => book[qKey(q)]);
    const mcq = shuffle([...wrong.slice(0, 4), ...pickFresh(pool.filter(q => !book[qKey(q)]), 8 - Math.min(4, wrong.length))]);
    if (!mcq.length) return;
    S.test = { kind: "revise", rev: chId, subj, title: "Revision: " + chName(subj, chId), mcq, written: [], ans: {}, txt: {}, start: Date.now(), dur: Math.max(5, Math.ceil(mcq.length * 1.2)) * 60 };
    S.result = null; S.confirm = null; S.page = "tests";
    render(); window.scrollTo(0, 0);
    return;
  }
  coachBaseStartTest(kind, ch);
};

const coachBaseSubmitTest = submitTest;
submitTest = function () {
  const t = S.test;
  coachBaseSubmitTest();
  if (!t) return;
  const r = S.result || {}, stats = r.chStats || {};
  if (t.kind === "revise") {
    const [a, b] = stats[t.rev] || [0, 0];
    finishRevision(t.subj, t.rev, b > 0 && a / b >= 0.7);
  } else {
    Object.entries(stats).forEach(([ch, [a, b]]) => {
      if (t.kind === "chapter") scheduleRevision(t.subj, ch, b > 0 && a / b < 0.6);
      else if (b >= 2 && a / b < 0.5) scheduleRevision(t.subj, ch, true);
    });
    saveRevise();
  }
  render();
};

// Learning a chapter in the plan starts its revision clock.
view.addEventListener("change", e => {
  const el = e.target;
  if (el.dataset.act !== "task" || !el.checked) return;
  const m = /^w\d+-([a-z]+)-(.+)$/.exec(el.dataset.id || "");
  if (m && SUBJECTS[m[1]] && chapterOf(m[1], m[2])) { scheduleRevision(m[1], m[2]); saveRevise(); }
});

// The solved board paper to sit this week: the newest one not sat yet.
function weeklyMockPaper(subj) {
  if (typeof PAPERS === "undefined") return null;
  const sat = new Set(S.history.filter(h => h.kind === "paper").map(h => h.title));
  const mine = PAPERS.filter(p => p.subj === subj).sort((a, b) => (b.sqp ? 1 : 0) - (a.sqp ? 1 : 0) || b.year - a.year || (a.order || 0) - (b.order || 0));
  return mine.find(p => !sat.has(`${p.year} ${p.exam} (Set ${p.set})`)) || null;
}
const mockName = p => p.exam.includes(String(p.year)) ? p.exam : `${p.year} ${p.exam}`;
const mockSubjOfWeek = wi => SUBJ_KEYS[wi % SUBJ_KEYS.length];
// History dates are UTC ISO strings; compare on the local day.
const histDay = h => isoOf(new Date(h.date));
const tookToday = pred => S.history.some(h => histDay(h) === todayIso() && pred(h));

/* ---------- exam-week mode ---------- */
function examSchedule() {
  const ds = SUBJ_KEYS.filter(k => S.dateSheet[k]).map(k => ({ subj: k, date: S.dateSheet[k] }));
  return ds.sort((a, b) => a.date.localeCompare(b.date));
}
function nextPaper() {
  const t = todayIso();
  const ds = examSchedule().filter(x => x.date >= t);
  if (ds.length) return ds[0];
  return S.examDate >= t ? { subj: null, date: S.examDate } : null;
}
function examMode() {
  const np = nextPaper();
  return !!np && daysUntil(np.date) <= EXAM_MODE_DAYS || store.get("examModeOn", false);
}

// What to do on each day before the next paper.
function examDayPlan(np) {
  const d = daysUntil(np.date), subj = np.subj, items = [];
  const name = subj ? SUBJECTS[subj].short : "the first paper";
  if (d <= 0) {
    items.push({ text: `Exam day: ${name}. Light breakfast, reach early, read the paper fully in the 15 reading minutes.`, mins: 0 });
    return items;
  }
  if (d === 1) {
    items.push({ text: `Read the ${name} quick-revision sheet once, slowly`, mins: 45, act: subj ? { act: "sheet", subj } : null });
    items.push({ text: "Fix the mistake book for this subject (no new chapters today)", mins: 20, act: subj ? { act: "start-subj", kind: "mistakes", subj } : null });
    items.push({ text: "Pack admit card, pens, geometry box. Sleep by 10 pm.", mins: 0 });
    return items;
  }
  if (subj) {
    const mock = weeklyMockPaper(subj);
    if (d >= 3 && mock) items.push({ text: `Sit a full paper under exam time: ${mockName(mock)}`, mins: 180, act: { act: "sit-mock", v: mock.id } });
    else items.push({ text: `Section A sprint, ${name}`, mins: 25, act: { act: "start-subj", kind: "sprint", subj } });
    items.push({ text: `Revise the 3 weakest ${name} chapters, then the quick-revision sheet`, mins: 60, act: { act: "sheet", subj } });
    items.push({ text: `Re-solve the ${name} Hot questions without looking`, mins: 40, act: { act: "link", page: "hot", subj } });
    if (mistakeQs(subj).length) items.push({ text: `Mistake book: ${mistakeQs(subj).length} to fix`, mins: 15, act: { act: "start-subj", kind: "mistakes", subj } });
  } else {
    items.push({ text: "Add the CBSE date sheet on the Revision page so each day is planned for the right subject", mins: 2, act: { act: "rev-tab", v: "dates" } });
  }
  return items;
}

/* ---------- today's coach plan ---------- */
function todaysTasks(week) {
  const all = SUBJ_KEYS.flatMap(k => week.tasks[k].map(t => ({ ...t, subj: k })));
  let pick = store.get("coachDay", null);
  if (!pick || pick.date !== todayIso() || pick.week !== week.n) {
    const open = all.filter(t => !S.plan[t.id]), dow = new Date().getDay();
    const daysLeft = dow === 0 ? 1 : 8 - dow;
    // Spread the subjects: take tasks round-robin across subjects rather than all of one subject first
    const bySubj = SUBJ_KEYS.map(k => open.filter(t => t.subj === k)), order = [];
    for (let i = 0; order.length < open.length; i++) bySubj.forEach(l => l[i] && order.push(l[i]));
    pick = { date: todayIso(), week: week.n, ids: order.slice(0, Math.min(4, Math.ceil(open.length / daysLeft))).map(t => t.id) };
    store.set("coachDay", pick);
  }
  return pick.ids.map(id => all.find(t => t.id === id)).filter(Boolean);
}

function coachItems(week, started, pending) {
  const items = [];
  const wi = currentWeekIndex(), dow = new Date().getDay(); // 0 Sunday
  // 1. Revisions that are due
  dueRevisions().slice(0, 3).forEach(r => items.push({
    text: `Revise ${SUBJECTS[r.subj].short}: ${chName(r.subj, r.ch)} (${stepLabel(r.s)}${r.late > 0 ? `, ${r.late} day${r.late > 1 ? "s" : ""} late` : ""})`,
    mins: 10, act: hasMcq(r.subj, r.ch) ? { act: "rev-start", v: revKey(r.subj, r.ch) } : { act: "link", page: "topics", subj: r.subj, ch: r.ch }
  }));
  // 2. Today's share of this week's plan, fixed for the day so ticking a task doesn't pull in another
  const mockDay = started && wi >= 6 && (dow === 6 || dow === 0);
  if (started) {
    todaysTasks(week).slice(0, mockDay ? 2 : 4).forEach(t => items.push({ task: t, mins: /Learn/.test(t.text) ? 45 : 30 }));
  }
  // 3. Mistakes in the subject with the most
  const worst = SUBJ_KEYS.map(k => ({ k, n: mistakeQs(k).length })).sort((a, b) => b.n - a.n)[0];
  if (worst.n >= 5) items.push({ text: `Fix mistakes: ${SUBJECTS[worst.k].short} (${worst.n} waiting)`, mins: 15, act: { act: "start-subj", kind: "mistakes", subj: worst.k }, done: tookToday(h => h.kind === "mistakes") });
  // 4. Weekend full mock from week 7
  if (mockDay) {
    const subj = mockSubjOfWeek(wi), p = weeklyMockPaper(subj);
    items.push({ text: `Weekly full mock: ${SUBJECTS[subj].short}${p ? ` (${mockName(p)})` : ""}`, mins: 180,
      act: p ? { act: "sit-mock", v: p.id } : { act: "start-subj", kind: "full", subj }, done: tookToday(h => h.subj === subj && (h.kind === "paper" || h.kind === "full")) });
  }
  // 5. Sunday JEE stretch
  if (dow === 0 && typeof JEE_FOUNDATION !== "undefined") items.push({ text: "JEE Foundation: two stretch problems", mins: 30, act: { act: "go", page: "jee" } });
  return items;
}

function coachItemRow(it) {
  if (it.task) return `<div class="coach-item">${taskRow(it.task, it.task.subj, true).replace('class="task', 'style="flex:1;min-width:0" class="task')}<span class="mins">${it.mins} min</span></div>`;
  const a = it.act, attrs = a ? Object.entries(a).map(([k, v]) => k === "act" ? `data-act="${v}"` : `data-${k}="${esc(v)}"`).join(" ") : "";
  return `<div class="coach-item ${it.done ? "done" : ""}"><span class="tick">${it.done ? "✓" : "·"}</span><span class="what">${esc(it.text)}</span>${it.mins ? `<span class="mins">${it.mins} min</span>` : ""}${a && !it.done ? `<button class="btn small ghost" ${attrs}>Start</button>` : ""}</div>`;
}

todayCard = function (week, started, pending) {
  if (examMode()) {
    const np = nextPaper();
    if (np) {
      const d = daysUntil(np.date), items = examDayPlan(np);
      return `<div class="card stack today exam-banner">
        <div class="row spread"><h2>Exam mode: ${np.subj ? esc(SUBJECTS[np.subj].short) : "first paper"} ${d <= 0 ? "today" : d === 1 ? "tomorrow" : `in ${d} days`}</h2><span class="tag hot">${fmtDate(np.date)}</span></div>
        <div>${items.map(coachItemRow).join("")}</div>
        <div class="row"><button class="btn ghost" data-act="go" data-page="revise">Date sheet and quick-revision sheets</button></div>
      </div>`;
    }
  }
  const items = coachItems(week, started, pending);
  const mins = items.filter(i => !i.done && !(i.task && S.plan[i.task.id])).reduce((a, i) => a + i.mins, 0);
  const label = started ? `Week ${week.n} · ${esc(week.phase)}` : "Week 1 starts Monday, 26 Oct";
  return `<div class="card stack today">
    <div class="row spread"><h2>Today's plan</h2><span class="tag">${label}</span></div>
    ${items.length ? `<div>${items.map(coachItemRow).join("")}</div><p class="muted" style="font-size:.88rem">About ${Math.round(mins / 6) / 10} hours left today. Tick plan tasks as you finish them; revisions and tests tick themselves.</p>`
      : `<p class="muted">${started ? "Everything for today is done. Use the Hot Section or a Section A sprint for extra practice." : "The plan begins on 26 October. Read a chapter in Topics to get a head start."}</p>`}
    <div class="row"><button class="btn ghost" data-act="go" data-page="plan">Open the full plan</button><button class="btn ghost" data-act="go" data-page="revise">Revision</button></div>
  </div>`;
};

/* ---------- Revision page ---------- */
function quickSheet(subj) {
  const sub = SUBJECTS[subj];
  const label = subj === "science" ? "Key equations" : subj === "social" ? "Key dates and terms" : "Formulas";
  return `<div class="row spread no-print"><h2>${esc(sub.short)}: quick-revision sheet</h2><button class="btn" data-act="print-sheet">Print or save as PDF</button></div>
  <p class="muted">Every chapter on one page: the formulas or key terms, the points to remember, and the mistake that costs marks. Read it the evening before the paper.</p>
  <div class="stack sheet">${sub.chapters.map(c => `<div class="card stack" style="gap:6px">
    <h3>${esc(c.name)}</h3>
    ${c.formulas && c.formulas.length ? `<div><span class="label">${label}</span>${c.formulas.map(f => `<div class="formula">${esc(f)}</div>`).join("")}</div>` : ""}
    ${c.points && c.points.length ? `<ul>${c.points.slice(0, 4).map(p => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
    ${c.mistake ? `<div class="callout warn" style="font-size:.9rem"><b>Avoid:</b> ${esc(c.mistake)}</div>` : ""}
  </div>`).join("")}</div>`;
}

function dateSheetCard() {
  return `<div class="card stack">
    <span class="label">Board exam date sheet</span>
    <p class="muted" style="font-size:.9rem">Enter each paper's date when CBSE publishes the date sheet (usually in December). Exam mode switches on ${EXAM_MODE_DAYS} days before the first paper, and the Dashboard then plans each day for the next paper.</p>
    <div>${SUBJ_KEYS.map(k => `<div class="ds-row"><span class="subj-h ${k}">${SUBJECTS[k].short}</span><span class="row" style="gap:8px">${S.dateSheet[k] ? "" : `<span class="muted" style="font-size:.85rem">Not set</span>`}<input type="date" data-act="ds" data-subj="${k}" value="${esc(S.dateSheet[k] || "")}" aria-label="${SUBJECTS[k].short} paper date"></span></div>`).join("")}</div>
    <label class="row muted" style="font-size:.9rem;gap:8px"><input type="checkbox" data-act="exam-mode" ${store.get("examModeOn", false) ? "checked" : ""}> Turn exam mode on now (for school pre-boards)</label>
  </div>`;
}

function pageRevise() {
  const due = dueRevisions(), soon = upcomingRevisions(7);
  const tracked = Object.values(S.revise), finished = tracked.filter(v => v.done).length;
  const tabs = [["due", `Due now (${due.length})`], ["sheets", "Quick-revision sheets"], ["dates", "Date sheet"]];
  let body = "";
  if (reviseTab === "sheets") body = `${subjPills()}${quickSheet(S.subj)}`;
  else if (reviseTab === "dates") body = dateSheetCard();
  else body = `
    <div class="card stack">
      ${due.length ? `<div>${due.map(r => coachItemRow({ text: `${SUBJECTS[r.subj].short}: ${chName(r.subj, r.ch)} · ${stepLabel(r.s)}${r.late > 0 ? ` · ${r.late} day${r.late > 1 ? "s" : ""} late` : ""}`, mins: 10,
        act: hasMcq(r.subj, r.ch) ? { act: "rev-start", v: revKey(r.subj, r.ch) } : { act: "rev-read", v: revKey(r.subj, r.ch) } })).join("")}</div>`
        : `<p class="muted">Nothing due today.${tracked.length ? "" : " Chapters join the schedule when they are ticked in the Study Plan or tested."}</p>`}
    </div>
    ${soon.length ? `<div class="card stack"><h3>Coming up this week</h3><div>${soon.map(r => `<div class="ds-row"><span>${SUBJECTS[r.subj].short}: ${esc(chName(r.subj, r.ch))}</span><span class="num muted" style="font-size:.85rem">${fmtDate(r.due)}</span></div>`).join("")}</div></div>` : ""}
    <div class="grid g3">
      <div class="card stack"><span class="label">On the schedule</span><div class="stat"><b>${tracked.length - finished}</b><span class="muted">chapters</span></div></div>
      <div class="card stack"><span class="label">Fully revised</span><div class="stat"><b>${finished}</b><span class="muted">all 4 steps done</span></div></div>
      <div class="card stack"><span class="label">How it works</span><p class="muted" style="font-size:.88rem">A short quiz 1, 3, 7 and 21 days after a chapter is learnt. Score 70% to move on; below that, the chapter starts again tomorrow.</p></div>
    </div>`;
  return `
  <div class="head"><div><h1>Revision</h1><p>Spaced revision keeps every finished chapter fresh until the exam, and exam mode turns the last two weeks into a day-by-day plan.</p></div></div>
  <div class="tabs no-print">${tabs.map(([k, l]) => `<button class="pill" data-act="rev-tab" data-v="${k}" aria-pressed="${reviseTab === k}">${l}</button>`).join("")}</div>
  ${body}`;
}
EXTRA_PAGES.revise = pageRevise;

/* ---------- Tests page: this week's mock ---------- */
const coachBasePageTests = pageTests;
pageTests = function () {
  const html = coachBasePageTests();
  if (S.test || S.result) return html;
  const p = weeklyMockPaper(S.subj);
  if (!p) return html;
  const card = `<div class="card row spread"><div class="stack" style="gap:4px"><span class="label">This week's full mock · ${p.mins / 60} hours</span><h3>${esc(mockName(p))}${p.course ? " · " + esc(p.course) : ""}</h3><p class="muted">The newest solved board paper not sat yet. Sit it in one go at 10:30 am, like the real exam.</p></div><button class="btn primary" data-act="sit-mock" data-v="${p.id}">Sit this paper</button></div>`;
  const i = html.indexOf(`<h2>Smart practice`);
  return i < 0 ? html + card : html.slice(0, i) + card + html.slice(i);
};

/* ---------- events ---------- */
view.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const a = el.dataset.act, d = el.dataset;
  if (a === "rev-start") startTest("revise", d.v);
  else if (a === "rev-read") { const [subj, ch] = d.v.split("|"); finishRevision(subj, ch, true); setSubj(subj); S.page = "topics"; S.topic = ch; render(); window.scrollTo(0, 0); }
  else if (a === "rev-tab") { reviseTab = d.v; if (S.page !== "revise") go("revise"); else render(); }
  else if (a === "sheet") { setSubj(d.subj); reviseTab = "sheets"; go("revise"); }
  else if (a === "start-subj") { setSubj(d.subj); startTest(d.kind); }
  else if (a === "sit-mock") sitPaper(d.v);
  else if (a === "print-sheet") window.print();
  else if (a === "reset") { S.revise = {}; saveRevise(); render(); }
});
view.addEventListener("change", e => {
  const el = e.target, a = el.dataset.act;
  if (a === "ds") {
    if (el.value) S.dateSheet[el.dataset.subj] = el.value; else delete S.dateSheet[el.dataset.subj];
    store.set("dateSheet", S.dateSheet);
    const first = examSchedule()[0];
    if (first) { S.examDate = first.date; store.set("examDate", first.date); }
    render();
  } else if (a === "exam-mode") { store.set("examModeOn", el.checked); render(); }
});

