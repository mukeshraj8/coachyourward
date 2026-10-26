/* Weekly report for a parent: the last 7 days of tests, plan ticks, revision and weak chapters as plain text,
   shared through the phone's share sheet, WhatsApp or email. Nothing leaves the device unless it is shared.
   Loads after coach.js. */
function weeklyReport() {
  const end = today0(), start = new Date(end); start.setDate(start.getDate() - 6);
  const since = start.getTime(), from = isoOf(start), to = isoOf(end);
  const tests = S.history.filter(h => new Date(h.date).getTime() >= since);
  const lines = [`CoachYourWard weekly report, ${fmtDate(from)} to ${fmtDate(to)}`, ""];
  // Tests by subject
  if (tests.length) {
    lines.push(`Tests taken: ${tests.length}`);
    SUBJ_KEYS.forEach(k => {
      const h = tests.filter(x => x.subj === k); if (!h.length) return;
      lines.push(`  ${SUBJECTS[k].short}: ${h.length} test${h.length > 1 ? "s" : ""}, average ${pct(h.reduce((a, x) => a + x.score, 0), h.reduce((a, x) => a + x.max, 0))}%`);
    });
    const papers = tests.filter(h => h.kind === "paper" || h.kind === "full");
    papers.forEach(h => lines.push(`  Full paper: ${SUBJECTS[h.subj].short} ${h.title}, ${h.score}/${h.max}`));
  } else lines.push("Tests taken: none this week");
  // Plan
  const ticked = Object.values(S.plan).filter(v => typeof v === "number" && v >= since).length;
  const all = planStats(), wk = PLAN[currentWeekIndex()];
  const wkTasks = SUBJ_KEYS.flatMap(k => wk.tasks[k]), wkDone = wkTasks.filter(t => S.plan[t.id]).length;
  lines.push("", `Study plan: ${ticked} task${ticked === 1 ? "" : "s"} ticked this week. Week ${wk.n} (${wk.phase}): ${wkDone} of ${wkTasks.length} done. Whole plan: ${all.p}%.`);
  // Revision
  const revised = tests.filter(h => h.kind === "revise").length, due = dueRevisions().length;
  lines.push(`Revision: ${revised} chapter quiz${revised === 1 ? "" : "zes"} done${due ? `, ${due} due now` : ", nothing overdue"}.`);
  const nMist = SUBJ_KEYS.reduce((a, k) => a + mistakeQs(k).length, 0);
  lines.push(`Mistake book: ${nMist} question${nMist === 1 ? "" : "s"} still to fix.`);
  lines.push(`Streak: ${studyStreak()} day${studyStreak() === 1 ? "" : "s"} in a row with a test.`);
  // Weak chapters
  const weak = weakChapters(3).filter(w => w.p < 70);
  if (weak.length) lines.push("", "Needs attention:", ...weak.map(w => `  ${SUBJECTS[w.subj].short}: ${chName(w.subj, w.ch)} (${w.p}%)`));
  const days = Math.ceil((new Date(S.examDate + "T00:00:00") - today0()) / DAY);
  if (days > 0) lines.push("", `${days} days to the first board paper (${fmtDate(S.examDate)}).`);
  return lines.join("\n");
}

function reportCard() {
  const text = weeklyReport(), enc = encodeURIComponent(text);
  return `<div class="card stack">
    <div class="row spread"><h2>Weekly report for parents</h2>${navigator.share ? `<button class="btn primary" data-act="report-share">Share</button>` : ""}</div>
    <p class="muted" style="font-size:.9rem">The last 7 days in a few lines. Send it every Sunday so a parent can follow along without opening the app.</p>
    <div class="solution" style="white-space:pre-wrap;font-size:.9rem">${esc(text)}</div>
    <div class="row">
      <a class="btn" href="https://wa.me/?text=${enc}" target="_blank" rel="noopener">WhatsApp</a>
      <a class="btn" href="mailto:?subject=${encodeURIComponent("CoachYourWard weekly report")}&body=${enc}">Email</a>
      <button class="btn ghost" data-act="report-copy">Copy</button>
    </div>
  </div>`;
}

const reportBasePageProgress = pageProgress;
pageProgress = function () {
  const html = reportBasePageProgress();
  const i = html.indexOf(`<div class="grid g4">`);
  return i < 0 ? html + reportCard() : html.slice(0, i) + reportCard() + html.slice(i);
};

// On Sundays the Dashboard reminds to send it.
const reportBasePageHome = pageHome;
pageHome = function () {
  const html = reportBasePageHome();
  if (new Date().getDay() !== 0 || !S.history.length) return html;
  const card = `<div class="card row spread no-print"><p style="margin:0">It's Sunday: send this week's report to a parent.</p><button class="btn" data-act="go" data-page="progress">Weekly report</button></div>`;
  const i = html.indexOf(`<div class="grid g3">`);
  return i < 0 ? html + card : html.slice(0, i) + card + html.slice(i);
};

view.addEventListener("click", async e => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  if (el.dataset.act === "report-share") { try { await navigator.share({ title: "CoachYourWard weekly report", text: weeklyReport() }); } catch (err) {} }
  else if (el.dataset.act === "report-copy") {
    try { await navigator.clipboard.writeText(weeklyReport()); el.textContent = "Copied"; } catch (err) { el.textContent = "Copy failed"; }
  }
});
