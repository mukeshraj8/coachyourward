/* Printable PDFs: a solved past paper (question paper or answers) and fresh practice sets from the question bank.
   Blocks are laid out in an off-screen A4 column, cut into pages without splitting a question,
   and each page is drawn with html2canvas and placed in a jsPDF document. Loads after app.js. */
const PDF_LIBS = [
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
];
const PG = { w: 794, h: 1123, padX: 56, padTop: 48, padBottom: 64 };
const PG_INNER = PG.h - PG.padTop - PG.padBottom;
let pdfLibs = null, pdfBusy = false;

const dlReady = window.claude && typeof claude.use === "function" ? claude.use("downloads").catch(() => null) : Promise.resolve(null);

(function () {
  const css = `
#pdf-stage { position: absolute; left: -12000px; top: 0; }
#pdf-stage .pg, #pdf-stage .col { background: #fff; color: #111; font-family: var(--body); font-size: 13.5px; line-height: 1.5; }
#pdf-stage .pg { width: ${PG.w}px; min-height: ${PG.h}px; padding: ${PG.padTop}px ${PG.padX}px ${PG.padBottom}px; box-sizing: border-box; }
#pdf-stage .col { width: ${PG.w - 2 * PG.padX}px; }
#pdf-stage .blk { padding-bottom: 12px; }
#pdf-stage h1 { font-family: var(--display); font-size: 21px; margin: 0 0 2px; color: #111; }
#pdf-stage h2 { font-family: var(--display); font-size: 15px; margin: 6px 0 0; padding-bottom: 4px; border-bottom: 1.5px solid #111; color: #111; }
#pdf-stage .sub { color: #444; font-size: 12.5px; white-space: pre-line; }
#pdf-stage .meta { display: flex; justify-content: space-between; font-weight: 600; margin-top: 8px; padding: 6px 0; border-top: 1px solid #999; border-bottom: 1px solid #999; }
#pdf-stage .fill { display: flex; gap: 24px; margin-top: 10px; font-size: 12.5px; }
#pdf-stage .fill span { flex: 1; border-bottom: 1px solid #999; padding-bottom: 2px; }
#pdf-stage .q { display: grid; grid-template-columns: minmax(34px, max-content) 1fr auto; gap: 6px; }
#pdf-stage .qn { font-weight: 700; }
#pdf-stage .qt { white-space: pre-line; }
#pdf-stage .mk { font-size: 12px; color: #333; white-space: nowrap; }
#pdf-stage .opts { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 18px; margin: 4px 0 0 40px; }
#pdf-stage .pass { white-space: pre-line; border: 1px solid #999; border-radius: 4px; padding: 8px 10px; }
#pdf-stage .pass b { display: block; margin-bottom: 2px; }
#pdf-stage .ans { margin-left: 40px; white-space: pre-line; }
#pdf-stage .pts { margin: 4px 0 0 40px; border-collapse: collapse; font-size: 12px; }
#pdf-stage .pts td { border: 1px solid #bbb; padding: 2px 8px; }
#pdf-stage .tipl { margin: 4px 0 0 40px; font-size: 12.5px; font-style: italic; }
#pdf-stage .key { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px 12px; }`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
})();

const loadScript = src => new Promise((res, rej) => {
  const s = document.createElement("script"); s.src = src; s.onload = res;
  s.onerror = () => { s.remove(); rej(new Error("load")); }; document.head.appendChild(s);
});
const loadPdfLibs = () => pdfLibs || (pdfLibs = Promise.all(PDF_LIBS.map(loadScript)).catch(e => { pdfLibs = null; throw e; }));
const fileSlug = s => String(s).replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "");
const marksLabel = m => `[${m} mark${m === 1 ? "" : "s"}]`;

/* ---------- blocks: each is { html, brk } where brk starts a new page ---------- */
function headerBlock(title, sub, maxMarks, mins) {
  const time = mins >= 60 ? `${mins / 60} hour${mins === 60 ? "" : "s"}` : `${mins} minutes`;
  return { html: `<h1>${esc(title)}</h1><div class="sub">${esc(sub)}</div>
    <div class="meta"><span>Time allowed: ${time}</span><span>Maximum marks: ${maxMarks}</span></div>
    <div class="fill"><span>Name:</span><span>Date:</span><span>Marks scored: &nbsp;&nbsp;&nbsp;&nbsp; / ${maxMarks}</span></div>` };
}
const secBlock = (name, info, brk) => ({ brk, html: `<h2>${esc(name)}</h2>${info ? `<div class="sub" style="margin-top:4px">${esc(info)}</div>` : ""}` });
const passageBlock = (title, text) => ({ html: `<div class="pass">${title ? `<b>${esc(title)}</b>` : ""}${esc(text)}</div>` });
const mcqBlock = (n, q) => ({ html: `<div class="q"><span class="qn">${esc(n)}.</span><span class="qt">${esc(q.q)}</span><span class="mk">${marksLabel(1)}</span></div>
  <div class="opts">${q.o.map((o, j) => `<div>(${"ABCD"[j]}) ${esc(o)}</div>`).join("")}</div>` });
const writtenBlock = (n, q, marks) => ({ html: `<div class="q"><span class="qn">${esc(n)}.</span><span class="qt">${esc(q)}</span><span class="mk">${marksLabel(marks)}</span></div>` });
function answerBlock(n, q, ans, pts, tip) {
  return { html: `<div class="q"><span class="qn">${esc(n)}.</span><span class="qt">${esc(q)}</span><span></span></div>
    <div class="ans"><b>Model answer:</b>\n${esc(ans)}</div>
    ${pts && pts.length ? `<table class="pts"><tbody>${pts.map(([p, m]) => `<tr><td>${esc(p)}</td><td>${esc(m)}</td></tr>`).join("")}</tbody></table>` : ""}
    ${tip ? `<div class="tipl">Scoring tip: ${esc(tip)}</div>` : ""}` };
}
const mcqAnswerBlock = (n, q) => ({ html: `<div class="q"><span class="qn">${esc(n)}.</span><span class="qt"><b>(${"ABCD"[q.a]}) ${esc(q.o[q.a])}</b>${q.e ? " · " + esc(q.e) : ""}</span><span></span></div>` });

/* ---------- a solved past paper ---------- */
function paperBlocks(p, withAnswers) {
  const subj = SUBJECTS[p.subj].name + (p.course ? " · " + p.course : "");
  const blocks = [headerBlock(`CBSE Class X · ${subj}`, `${p.year} · ${p.exam} · Set ${p.set}${withAnswers ? "\nAnswers and marking scheme" : p.note ? "\n" + p.note : ""}`, p.marks, p.mins)];
  if (withAnswers && p.advice) blocks.push(secBlock("How to score full marks in this paper"), { html: `<div class="qt">${esc(p.advice)}</div>` });
  for (const s of p.sections) {
    const items = withAnswers ? s.qs.filter(it => it.text === undefined) : s.qs;
    if (!items.length) continue;
    blocks.push(secBlock(s.name, withAnswers ? "" : s.info));
    for (const it of items) {
      if (it.text !== undefined) blocks.push(passageBlock(it.title, it.text));
      else if (it.o) blocks.push(withAnswers ? mcqAnswerBlock("Q" + it.n, it) : mcqBlock("Q" + it.n, it));
      else blocks.push(withAnswers ? answerBlock("Q" + it.n, it.q, it.ans, it.pts, it.tip) : writtenBlock("Q" + it.n, it.q, it.marks));
    }
  }
  const name = `${fileSlug(SUBJECTS[p.subj].short + (p.course ? " " + p.course.split(" ")[0] : ""))}-${p.year}-${fileSlug(p.exam.split("(")[0])}-Set-${fileSlug(p.set)}-${withAnswers ? "answers" : "question-paper"}.pdf`;
  return { blocks, name, footer: `CBSE Class X ${SUBJECTS[p.subj].short} ${p.year} - Set ${p.set}${withAnswers ? " - Answers" : ""}` };
}

/* ---------- a fresh practice set from the question bank ---------- */
function practiceSet(kind) {
  const sub = SUBJECTS[S.subj];
  let mcq = [], written = [], mins, title;
  if (kind.startsWith("ch:")) {
    const ch = kind.slice(3);
    mcq = shuffle(sub.mcq.filter(q => q.ch === ch)); written = sub.written.filter(q => q.ch === ch);
    mins = Math.max(10, Math.ceil(mcq.length * 1.5) + written.reduce((m, q) => m + q.marks * 2, 0));
    title = "Chapter practice: " + chName(S.subj, ch);
  } else if (kind === "sprint") { mcq = shuffle(sub.mcq).slice(0, 20); mins = 24; title = "Section A sprint"; }
  else if (kind === "full") {
    mcq = shuffle(sub.mcq).slice(0, 20); let m = 0;
    const pool = [...shuffle(sub.written.filter(q => q.marks >= 10)).slice(0, 1), ...shuffle(sub.written.filter(q => q.marks < 10))];
    pool.forEach(q => { if (m + q.marks <= 60) { written.push(q); m += q.marks; } });
    mins = 180; title = "Full practice paper";
  } else { mcq = shuffle(sub.mcq).slice(0, 10); written = shuffle(sub.written).slice(0, 3); mins = 45; title = "Mini board paper"; }
  const total = mcq.length + written.reduce((m, q) => m + q.marks, 0);
  const blocks = [headerBlock(`${sub.name} · ${title}`, "CBSE Class X practice set from CoachYourWard. Answers are at the end.", total, mins)];
  if (mcq.length) { blocks.push(secBlock("Section A · Multiple choice", "Choose the correct option.")); mcq.forEach((q, i) => blocks.push(mcqBlock(i + 1, q))); }
  if (written.length) { blocks.push(secBlock("Section B · Written answers", "Answer in full sentences. Marks are shown against each question.")); written.forEach((q, i) => blocks.push(writtenBlock(mcq.length + i + 1, q.q, q.marks))); }
  blocks.push(secBlock("Answers", "", true));
  if (mcq.length) blocks.push({ html: `<div class="key">${mcq.map((q, i) => `<div><b>${i + 1}.</b> (${"ABCD"[q.a]}) ${esc(q.o[q.a])}</div>`).join("")}</div>` });
  written.forEach((q, i) => blocks.push(answerBlock(mcq.length + i + 1, q.q.length > 160 ? q.q.slice(0, 157) + "…" : q.q, q.a, q.points)));
  const day = new Date().toISOString().slice(0, 10);
  return { blocks, name: `${fileSlug(sub.short)}-${fileSlug(title)}-${day}.pdf`, footer: `${sub.short} - ${title.replace(/[^\x20-\x7E]/g, "")} - CoachYourWard` };
}

/* ---------- layout and PDF ---------- */
async function buildPdf({ blocks, footer }) {
  await loadPdfLibs();
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  const stage = document.createElement("div"); stage.id = "pdf-stage"; document.body.appendChild(stage);
  try {
    const col = document.createElement("div"); col.className = "col"; stage.appendChild(col);
    const els = blocks.map(b => { const d = document.createElement("div"); d.className = "blk"; d.innerHTML = b.html; col.appendChild(d); return d; });
    const pages = []; let cur = null, used = 0;
    els.forEach((el, i) => {
      const h = el.offsetHeight;
      if (!cur || blocks[i].brk || used + h > PG_INNER) { cur = []; pages.push(cur); used = 0; }
      cur.push(el); used += h;
    });
    // A section heading never ends a page on its own.
    for (let i = 0; i < pages.length - 1; i++) {
      const last = pages[i][pages[i].length - 1];
      if (pages[i].length > 1 && last.querySelector("h2") && !last.querySelector(".q")) { pages[i].pop(); pages[i + 1].unshift(last); }
    }
    col.remove();
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const W = pdf.internal.pageSize.getWidth(), H = pdf.internal.pageSize.getHeight();
    const shots = [];
    for (const els of pages) {
      const pg = document.createElement("div"); pg.className = "pg"; els.forEach(e => pg.appendChild(e)); stage.appendChild(pg);
      const c = await html2canvas(pg, { scale: 2, backgroundColor: "#ffffff", logging: false, useCORS: true });
      pg.remove();
      const sliceH = Math.round(c.width * H / W);
      for (let y = 0; y < c.height - 4; y += sliceH) {
        const part = document.createElement("canvas"); part.width = c.width; part.height = Math.min(sliceH, c.height - y);
        part.getContext("2d").drawImage(c, 0, -y);
        shots.push(part);
      }
    }
    shots.forEach((part, i) => {
      if (i) pdf.addPage();
      pdf.addImage(part.toDataURL("image/jpeg", 0.9), "JPEG", 0, 0, W, part.height * W / part.width);
      pdf.setFontSize(8.5); pdf.setTextColor(110);
      pdf.text(`${footer}   |   Page ${i + 1} of ${shots.length}`, W / 2, H - 22, { align: "center" });
    });
    return pdf.output("blob");
  } finally { stage.remove(); }
}

async function saveFile(name, blob) {
  const dl = await dlReady;
  if (dl) return dl.save({ filename: name, data: blob });
  const url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

async function makePdf(btn, spec) {
  if (pdfBusy) return;
  pdfBusy = true;
  const label = btn.textContent, status = document.getElementById("pdfStatus");
  const say = t => { if (status) status.textContent = t; };
  btn.disabled = true; btn.textContent = "Making PDF…"; say("");
  try {
    const blob = await buildPdf(spec);
    btn.textContent = "Saving…";
    await saveFile(spec.name, blob);
    say(`Saved ${spec.name}`);
  } catch (e) {
    const code = e && e.code;
    say(code === "declined" ? "Download cancelled." : code === "rate_limited" ? "A download is already waiting for you. Try again in a moment."
      : e && e.message === "load" ? "Couldn't load the PDF maker. Check the internet connection and try again." : "Couldn't make the PDF. Please try again.");
  } finally { pdfBusy = false; btn.disabled = false; btn.textContent = label; }
}

/* ---------- UI: buttons on a solved paper and a card on Tests ---------- */
if (typeof paperView === "function") {
  const basePaperView = paperView;
  paperView = function () {
    const h = basePaperView(), p = typeof paperById === "function" && paperById(S.paperId);
    if (!p) return h;
    const bar = `<div class="card row spread"><div class="stack" style="gap:2px"><span class="label">Print it</span><span class="muted" style="font-size:.9rem">A4 PDF. Print the question paper, and keep the answers separately for checking.</span><span class="muted" id="pdfStatus" aria-live="polite" style="font-size:.9rem"></span></div>
      <div class="row"><button class="btn" data-act="pdf-paper" data-v="q">Download question paper (PDF)</button><button class="btn" data-act="pdf-paper" data-v="a">Download answers (PDF)</button></div></div>`;
    const at = h.indexOf('<div class="row" style="font-size:.9rem">');
    return at < 0 ? bar + h : h.slice(0, at) + bar + h.slice(at);
  };
}

const basePageTests = pageTests;
pageTests = function () {
  const h = basePageTests();
  if (S.test || S.result) return h;
  const sub = SUBJECTS[S.subj];
  const chs = sub.chapters.filter(c => sub.mcq.some(q => q.ch === c.id) || sub.written.some(q => q.ch === c.id));
  return h + `
  <div class="card stack"><span class="label">Print a practice set</span><h3>Download as PDF</h3>
    <p class="muted">A fresh set from the question bank each time, laid out for A4 paper with the answers at the end. Good for practice away from the screen.</p>
    <div class="row"><select id="pdfKind" aria-label="Practice set">
      <option value="full">Full practice paper (3 hours, about 80 marks)</option>
      <option value="mock">Mini board paper (45 minutes)</option>
      <option value="sprint">Section A sprint (20 MCQs)</option>
      ${chs.map(c => `<option value="ch:${c.id}">Chapter: ${esc(c.name)}</option>`).join("")}
    </select><button class="btn primary" data-act="pdf-set">Download PDF</button></div>
    <span class="muted" id="pdfStatus" aria-live="polite" style="font-size:.9rem"></span></div>`;
};

view.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  if (el.dataset.act === "pdf-paper") {
    const p = paperById(S.paperId); if (p) makePdf(el, paperBlocks(p, el.dataset.v === "a"));
  } else if (el.dataset.act === "pdf-set") {
    makePdf(el, practiceSet((document.getElementById("pdfKind") || {}).value || "full"));
  }
});
