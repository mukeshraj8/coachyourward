/* Past papers: official CBSE Class X board papers, solved the way the marking scheme awards marks.
   Each papers-*.js file pushes papers into PAPERS. A paper's sections hold items of three kinds:
   - { text, title }: a passage or case shown above the questions that use it
   - { n, ch, q, o, a, e }: an MCQ (o = options, a = index of the right option, e = why)
   - { n, ch, marks, q, ans, pts, tip }: a written question (ans = model answer, pts = [marking point, marks]) */

const PAPERS = [];
const CBSE_QP = "https://www.cbse.gov.in/cbsenew/question-paper.html";
const CBSE_MS = "https://www.cbse.gov.in/cbsenew/marking-scheme.html";

/* Older papers, not yet solved in the app: links straight to the official zip files. */
const PAPER_LINKS = {
  maths: [
    [2025, "Supplementary (Jul)", "question-paper/2025-COMPTT/X/Maths_Standard.zip", "marking-scheme/2025-COMPTT/X/MATHEMATICS_STANDARD.zip", "Standard"],
    [2025, "Supplementary (Jul)", "question-paper/2025-COMPTT/X/Maths_Basic.zip", "marking-scheme/2025-COMPTT/X/MATHEMATICS_BASIC.zip", "Basic"],
    [2024, "Board exam", "question-paper/2024/X/MATHEMATICS_STANDARD.zip", "Marking-Scheme/2024/X/Mathematics_Standard.zip", "Standard"],
    [2024, "Board exam", "question-paper/2024/X/MATHEMATICS_BASIC.zip", "Marking-Scheme/2024/X/Mathematics.zip", "Basic"],
    [2024, "Supplementary", "question-paper/2024-COMPTT/X/MATHEMATICS_STANDARD.zip", "marking-scheme/2024-COMPTT/X/MATHS_STANDARD.zip", "Standard"],
    [2023, "Board exam", "question-paper/2023/X/MATHEMATICS_STANDARD.zip", "Marking-Scheme/2023/X/Maths_Standard.zip", "Standard"],
    [2023, "Board exam", "question-paper/2023/X/MATHEMATICS_BASIC.zip", "Marking-Scheme/2023/X/Math_Basic.zip", "Basic"],
    [2023, "Supplementary", "question-paper/2023-COMPTT/X/Maths_Standard.zip", "marking-scheme/2023-COMPTT/X/Mathematics_Standard.zip", "Standard"],
    [2022, "Term 2", "question-paper/2022/X/Math_S.zip", "Marking-Scheme/2022/X/Mathematic_Standard.zip", "Standard"]
  ],
  science: [
    [2025, "Supplementary (Jul)", "question-paper/2025-COMPTT/X/Science.zip", "marking-scheme/2025-COMPTT/X/SCIENCE.zip"],
    [2024, "Board exam", "question-paper/2024/X/SCIENCE.zip", "Marking-Scheme/2024/X/Science.zip"],
    [2024, "Supplementary", "question-paper/2024-COMPTT/X/SCIENCE.zip", "marking-scheme/2024-COMPTT/X/Science.zip"],
    [2023, "Board exam", "question-paper/2023/X/SCIENCE.zip", "Marking-Scheme/2023/X/Science_English_Medium.zip"],
    [2023, "Supplementary", "question-paper/2023-COMPTT/X/Science.zip", "marking-scheme/2023-COMPTT/X/Science.zip"],
    [2022, "Term 2", "question-paper/2022/X/Scince.zip", "Marking-Scheme/2022/X/science.zip"]
  ],
  english: [
    [2025, "Supplementary (Jul)", "question-paper/2025-COMPTT/X/English_L&L.zip", "marking-scheme/2025-COMPTT/X/ENGLISH_LANGUAGE_LITERATURE.zip"],
    [2024, "Board exam", "question-paper/2024/X/ENGLISH_L&L.zip", "Marking-Scheme/2024/X/English_Language_Lit.zip"],
    [2024, "Supplementary", "question-paper/2024-COMPTT/X/ENGLISH_L&L.zip", "marking-scheme/2024-COMPTT/X/English.zip"],
    [2023, "Board exam", "question-paper/2023/X/English_Language_Literature.zip", "Marking-Scheme/2023/X/English_Language_Lit.zip"],
    [2023, "Supplementary", "question-paper/2023-COMPTT/X/English_Lan_Lit.zip", "marking-scheme/2023-COMPTT/X/English_Lan_Lit.zip"],
    [2022, "Term 2", "question-paper/2022/X/English_&_Lit.zip", "Marking-Scheme/2022/X/English_Language_&_Literature.zip"]
  ],
  sanskrit: [
    [2025, "Supplementary (Jul)", "question-paper/2025-COMPTT/X/Sanskrit_Communicative.zip", "marking-scheme/2025-COMPTT/X/SANSKRIT_COMMUNICATIVE.zip"]
  ]
};
const cbseUrl = p => "https://www.cbse.gov.in/cbsenew/" + p.replace(/ /g, "%20").replace(/&/g, "%26");

(function () {
  const css = `
.paper-list { display: grid; gap: 10px; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
.paper-tile { text-align: left; border: 1px solid var(--line); background: var(--surface); border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 4px; color: var(--ink); cursor: pointer; }
.paper-tile:hover { border-color: var(--accent); }
.paper-tile b { font-family: var(--mono); font-size: 1.15rem; }
.paper-tile span { font-size: .85rem; color: var(--muted); }
.passage { white-space: pre-line; background: var(--paper); border-left: 3px solid var(--accent); }
.sec-head { margin-top: 10px; }
.opts-static { display: grid; gap: 6px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.opts-static div { border: 1px solid var(--line); border-radius: 8px; padding: 6px 10px; font-size: .95rem; }
.opts-static .right { border-color: var(--good); background: var(--good-soft); }
.tip { font-size: .92rem; border-left: 3px solid var(--good); padding: 4px 10px; }
.link-list { display: flex; flex-direction: column; gap: 6px; font-size: .92rem; }
@media (max-width: 640px) { .opts-static { grid-template-columns: 1fr; } }`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
})();

const paperById = id => PAPERS.find(p => p.id === id);
const paperItems = p => p.sections.flatMap(s => s.qs);

function paperArchive() {
  const mine = PAPERS.filter(p => p.subj === S.subj).sort((a, b) => b.year - a.year || (a.order || 0) - (b.order || 0));
  const links = PAPER_LINKS[S.subj] || [];
  return `
  <div class="card stack">
    <span class="label">Solved board papers</span>
    ${mine.length ? `<div class="paper-list">${mine.map(p => `<button class="paper-tile" data-act="paper" data-v="${p.id}">
      <b>${p.year}</b><strong>${esc(p.exam)}</strong><span>${esc(p.course ? p.course + " · " : "")}Set ${esc(p.set)} · ${p.marks} marks</span></button>`).join("")}</div>`
      : `<p class="muted">Solved papers for this subject are being added.</p>`}
    <p class="muted" style="font-size:.9rem">Every question is the board's own, with a model answer written the way the official marking scheme gives marks.</p>
  </div>
  ${links.length ? `<details class="card"><summary>More years: official papers and marking schemes (PDF zips from CBSE)</summary>
    <div class="link-list">${links.map(([y, ex, qp, ms, c]) => `<div>${y} · ${esc(ex)}${c ? " · " + esc(c) : ""}: <a href="${cbseUrl(qp)}" target="_blank" rel="noopener">question paper</a> · <a href="${cbseUrl(ms)}" target="_blank" rel="noopener">marking scheme</a></div>`).join("")}</div></details>` : ""}`;
}

function paperItem(it, subj) {
  if (it.text !== undefined) return `<div class="card passage stack">${it.title ? `<span class="label">${esc(it.title)}</span>` : ""}<div>${esc(it.text)}</div></div>`;
  const ch = it.ch ? `<span class="label">${esc(chName(subj, it.ch))}</span>` : "<span></span>";
  if (it.o) return `<div class="card q-card">
    <div class="row spread">${ch}<span class="tag marks">1 mark</span></div>
    <p class="q"><span class="qnum">Q${esc(it.n)}.</span> ${esc(it.q)}</p>
    <div class="opts-static">${it.o.map((o, j) => `<div data-o="${j}">(${"ABCD"[j]}) ${esc(o)}</div>`).join("")}</div>
    <details data-act="reveal"><summary>Answer</summary><div class="solution"><b>(${"ABCD"[it.a]}) ${esc(it.o[it.a])}</b>\n${esc(it.e)}</div></details>
  </div>`;
  return `<div class="card q-card">
    <div class="row spread">${ch}<span class="tag marks">${it.marks} mark${it.marks > 1 ? "s" : ""}</span></div>
    <p class="q"><span class="qnum">Q${esc(it.n)}.</span> ${esc(it.q)}</p>
    <details><summary>Model answer</summary><div class="stack"><div class="solution">${esc(it.ans)}</div>
      ${it.pts && it.pts.length ? `<div class="table-wrap"><table class="points"><tbody><tr><td colspan="2"><span class="label">How the marks are given</span></td></tr>${it.pts.map(([p, m]) => `<tr><td>${esc(p)}</td><td>${m}</td></tr>`).join("")}</tbody></table></div>` : ""}
      ${it.tip ? `<div class="tip"><b>Scoring tip:</b> ${esc(it.tip)}</div>` : ""}</div></details>
  </div>`;
}

function paperView() {
  const p = paperById(S.paperId);
  if (!p) { S.paperId = null; return pagePapers(); }
  return `
  <div class="row"><button class="btn small" data-act="paper" data-v="">← All papers</button></div>
  <div class="head"><div><span class="label">${esc(SUBJECTS[p.subj].name)}${p.course ? " · " + esc(p.course) : ""} · Set ${esc(p.set)}</span><h1>${p.year} · ${esc(p.exam)}</h1>
    <p>${p.marks} marks · ${p.mins / 60} hours. ${esc(p.note || "")}</p></div>
    <button class="btn primary" data-act="sit-paper">Sit this paper (${p.mins / 60} hours, timed)</button></div>
  <div class="row" style="font-size:.9rem">${p.qp ? `<a href="${cbseUrl(p.qp)}" target="_blank" rel="noopener">Official question paper</a>` : ""}${p.ms ? ` · <a href="${cbseUrl(p.ms)}" target="_blank" rel="noopener">Official marking scheme</a>` : ""}</div>
  ${p.advice ? `<div class="card stack"><span class="label">How to score full marks in this paper</span><div style="white-space:pre-line">${esc(p.advice)}</div></div>` : ""}
  ${p.sections.map(s => `<h2 class="sec-head">${esc(s.name)}</h2>${s.info ? `<p class="muted">${esc(s.info)}</p>` : ""}<div class="stack">${s.qs.map(it => paperItem(it, p.subj)).join("")}</div>`).join("")}
  <div class="row"><button class="btn small" data-act="paper" data-v="">← All papers</button></div>`;
}

// Marks in pts are display strings like "1½", "½ + ½" or "½ × 4"; tests need numbers.
const markNum = m => {
  if (typeof m === "number") return m;
  const num = t => (parseFloat(t) || 0) + (/½/.test(t) ? 0.5 : 0);
  return String(m).split("+").reduce((sum, term) => sum + term.split("×").reduce((prod, f) => prod * num(f.trim()), 1), 0);
};

function sitPaper(id) {
  const p = paperById(id); if (!p) return;
  const mcq = [], written = []; let ctx = "";
  for (const it of paperItems(p)) {
    if (it.text !== undefined) { ctx = (it.title ? it.title + "\n" : "") + it.text; continue; }
    const q = (ctx ? ctx + "\n\n" : "") + "Q" + it.n + ". " + it.q; ctx = "";
    if (it.o) mcq.push({ ch: it.ch || "paper", q, o: it.o, a: it.a, e: it.e });
    else written.push({ ch: it.ch || "paper", q, marks: it.marks, a: it.ans, points: it.pts && it.pts.length ? it.pts.map(([t, m]) => [t, markNum(m)]) : [["Matches the model answer", it.marks]] });
  }
  S.paperId = null; S.subj = p.subj;
  S.test = { kind: "paper", subj: p.subj, title: `${p.year} ${p.exam} (Set ${p.set})`, mcq, written, ans: {}, txt: {}, start: Date.now(), dur: p.mins * 60 };
  S.result = null; S.confirm = null; S.page = "tests";
  render(); window.scrollTo(0, 0);
}

document.getElementById("nav").addEventListener("click", e => { if (e.target.closest("button[data-page]")) S.paperId = null; });
document.getElementById("view").addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  if (el.dataset.act === "paper") { S.paperId = el.dataset.v || null; render(); window.scrollTo(0, 0); }
  else if (el.dataset.act === "sit-paper") sitPaper(S.paperId);
  else if (el.dataset.act === "subj") S.paperId = null;
});
