/* AI help: "Ask a doubt" page and "Check with AI" on written answers.
   Calls the Firebase function in functions/index.js with the signed-in user's ID token. The function picks
   the AI service (Claude, ChatGPT or Grok) and falls back to the next if one fails; no key is ever in the app.
   Only works on the website/app build with Google sign-in (fbsync.js). Loads after fbsync.js. */
const AI_URL = "https://asia-south1-coachyourward.cloudfunctions.net/ai";
const AI_PROVIDER_NAMES = { anthropic: "Claude", openai: "ChatGPT", xai: "Grok" };
const aiState = { doubt: { subj: null, text: "", img: null, busy: false, err: "" } };
S.doubts = store.get("doubts", []);

(function () {
  const css = `
.ai-box { border: 1px dashed var(--line); border-radius: 10px; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }
.ai-thumb { display: flex; align-items: center; gap: 10px; }
.ai-thumb img { max-width: 120px; max-height: 120px; border-radius: 8px; border: 1px solid var(--line); object-fit: cover; }
.ai-answer { white-space: pre-wrap; line-height: 1.55; }
.ai-pt { display: flex; justify-content: space-between; gap: 10px; font-size: .9rem; padding: 4px 0; border-top: 1px solid var(--line); }
.ai-pt:first-child { border-top: 0; }
.ai-pt .num { flex: none; }
.ai-file { font-size: .9rem; max-width: 100%; }
.ai-err { color: var(--bad); font-size: .9rem; margin: 0; }`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
})();

const aiOn = () => typeof fb !== "undefined" && !!window.FIREBASE_CONFIG;
const aiSignedIn = () => aiOn() && !!fb.user;

async function aiPost(body) {
  if (!aiSignedIn()) throw new Error("Sign in with Google on the Dashboard first.");
  const token = await fb.user.getIdToken();
  let res;
  try { res = await fetch(AI_URL, { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer " + token }, body: JSON.stringify(body) }); }
  catch (e) { throw new Error(navigator.onLine === false ? "You're offline. Connect to the internet and try again." : "Couldn't reach the AI service. If this keeps happening, AI may not be switched on yet."); }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || (res.status === 404 ? "AI isn't switched on yet." : "The AI service had a problem. Please try again."));
  return json;
}

// Shrink a photo to at most 1400px on the long side as JPEG, so uploads are small and cheap.
function aiPrepImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const k = Math.min(1, 1400 / Math.max(img.width, img.height));
      const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Couldn't read that photo.")); };
    img.src = url;
  });
}

const aiVia = r => r && r.provider ? `<span class="muted" style="font-size:.8rem">Answered by ${esc(AI_PROVIDER_NAMES[r.provider] || r.provider)}${typeof r.left === "number" ? ` · ${r.left} left today` : ""}</span>` : "";
const aiPhotoInput = (act, i) => `<label class="muted" style="font-size:.9rem">Photo (optional): <input class="ai-file" type="file" accept="image/*" capture="environment" data-act="${act}"${i !== undefined ? ` data-i="${i}"` : ""}></label>`;
const aiThumb = (src, act, i) => `<div class="ai-thumb"><img src="${src}" alt="Photo to send"><button class="btn small ghost" data-act="${act}"${i !== undefined ? ` data-i="${i}"` : ""}>Remove photo</button></div>`;

/* ---------- Check with AI (result view, written answers) ---------- */
function aiCheckBlock(r, i) {
  if (!aiOn()) return "";
  if (!aiSignedIn()) return `<p class="muted" style="font-size:.9rem">Sign in on the Dashboard to have AI mark this answer.</p>`;
  r.ai = r.ai || {}; r.aiImg = r.aiImg || {};
  const a = r.ai[i] || {}, img = r.aiImg[i], has = (r.txt[i] || "").trim() || img;
  let out = `<div class="ai-box"><span class="label">Check with AI</span>`;
  if (a.points) {
    out += `<div><b>AI marks: ${a.total}/${r.written[i].marks}</b>${a.readable ? "" : ` <span class="tag bad">Couldn't read the photo</span>`}</div>
      <div>${r.written[i].points.map(([p], j) => `<div class="ai-pt"><span>${esc(p)}${a.points[j].note ? `<br><span class="muted">${esc(a.points[j].note)}</span>` : ""}</span><span class="num">${a.points[j].awarded}/${a.points[j].max}</span></div>`).join("")}</div>
      ${a.feedback ? `<p style="margin:0">${esc(a.feedback)}</p>` : ""}
      <p class="muted" style="font-size:.85rem;margin:0">The ticks above are set from the AI marking. Change any you disagree with.</p>${aiVia(a)}`;
  } else {
    out += `<p class="muted" style="font-size:.9rem;margin:0">Type the answer above while sitting the test, or take a photo of the written answer. AI marks it against the board's marking points.</p>`;
    out += img ? aiThumb(img, "ai-img-del", i) : aiPhotoInput("ai-img", i);
    if (a.err) out += `<p class="ai-err">${esc(a.err)}</p>`;
    out += `<div><button class="btn primary small" data-act="ai-check" data-i="${i}" ${has && !a.busy ? "" : "disabled"}>${a.busy ? "Checking…" : "Check with AI"}</button></div>`;
  }
  return out + `</div>`;
}

async function aiCheck(i) {
  const r = S.result, q = r.written[i]; r.ai = r.ai || {}; r.aiImg = r.aiImg || {};
  r.ai[i] = { busy: true }; render();
  try {
    const out = await aiPost({ task: "check", subj: r.subj, question: q.q, marks: q.marks, modelAnswer: q.a, points: q.points, answer: r.txt[i] || "", images: r.aiImg[i] ? [r.aiImg[i]] : [] });
    r.ai[i] = out;
    q.points.forEach(([, m], j) => { r.self[i + "-" + j] = out.points[j] && out.points[j].awarded >= m / 2; });
  } catch (e) { r.ai[i] = { err: e.message }; }
  if (S.result === r) render();
}

/* ---------- Ask a doubt page ---------- */
function pageDoubt() {
  const d = aiState.doubt; d.subj = d.subj || S.subj;
  const head = `<div class="head"><div><h1>Ask a doubt</h1><p>Type a question or take a photo of it, and get a step-by-step explanation at the CBSE Class 10 level.</p></div></div>`;
  if (!aiOn()) return head + `<div class="card"><p class="muted">Ask a doubt works on study.rekhank.app and in the Android app, after signing in with Google.</p></div>`;
  if (!aiSignedIn()) return head + `<div class="card row spread"><p style="margin:0">Sign in with Google to ask doubts.</p><button class="btn primary" data-act="go" data-page="home">Go to sign-in</button></div>`;
  return head + `
  <div class="card stack">
    <div class="subj-pills" role="group" aria-label="Subject">${SUBJ_KEYS.map(k => `<button class="pill ${k}" data-act="doubt-subj" data-v="${k}" aria-pressed="${k === d.subj}">${SUBJECTS[k].short}</button>`).join("")}</div>
    <textarea id="doubtText" data-act="doubt-text" placeholder="For example: why is the HCF × LCM = product of two numbers only for two numbers?" style="min-height:110px">${esc(d.text)}</textarea>
    ${d.img ? aiThumb(d.img, "doubt-img-del") : aiPhotoInput("doubt-img")}
    ${d.err ? `<p class="ai-err">${esc(d.err)}</p>` : ""}
    <div><button class="btn primary" data-act="doubt-ask" ${d.busy ? "disabled" : ""}>${d.busy ? "Thinking…" : "Ask"}</button></div>
  </div>
  ${S.doubts.map((x, n) => `<div class="card stack">
    <div class="row spread"><span class="label">${esc(SUBJECTS[x.subj] ? SUBJECTS[x.subj].short : "")} · ${fmtDate(x.at)}</span><button class="btn small ghost" data-act="doubt-del" data-n="${n}">Delete</button></div>
    <p style="margin:0"><b>${esc(x.q || "Question in the photo")}</b></p>
    <div class="ai-answer">${esc(x.a)}</div>${aiVia(x)}
  </div>`).join("")}`;
}

async function aiAskDoubt() {
  const d = aiState.doubt, el = document.getElementById("doubtText"); if (el) d.text = el.value;
  if (!d.text.trim() && !d.img) { d.err = "Type the doubt or add a photo first."; render(); return; }
  d.busy = true; d.err = ""; render();
  try {
    const out = await aiPost({ task: "doubt", subj: d.subj, doubt: d.text, images: d.img ? [d.img] : [] });
    S.doubts.unshift({ subj: d.subj, q: d.text.trim(), a: out.answer, provider: out.provider, left: out.left, at: new Date().toISOString().slice(0, 10) });
    S.doubts = S.doubts.slice(0, 20); store.set("doubts", S.doubts);
    d.text = ""; d.img = null;
  } catch (e) { d.err = e.message; }
  d.busy = false; if (S.page === "doubt") render();
}

EXTRA_PAGES.doubt = pageDoubt;
// Sign-in finishes after the first render: redraw AI parts once it is known.
const aiWait = setInterval(() => { if (!aiOn() || fb.state !== "loading") { clearInterval(aiWait); if (S.page === "doubt" || (S.result && S.page === "tests")) render(); } }, 500);
PAGES.push("doubt");
if (location.hash === "#doubt") S.page = "doubt";

view.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const a = el.dataset.act, d = aiState.doubt;
  if (a === "ai-check") aiCheck(+el.dataset.i);
  else if (a === "ai-img-del") { delete S.result.aiImg[+el.dataset.i]; render(); }
  else if (a === "doubt-subj") { const t = document.getElementById("doubtText"); if (t) d.text = t.value; d.subj = el.dataset.v; render(); }
  else if (a === "doubt-ask") aiAskDoubt();
  else if (a === "doubt-img-del") { d.img = null; render(); }
  else if (a === "doubt-del") { S.doubts.splice(+el.dataset.n, 1); store.set("doubts", S.doubts); render(); }
});
view.addEventListener("input", e => { if (e.target.dataset.act === "doubt-text") aiState.doubt.text = e.target.value; });
view.addEventListener("change", async e => {
  const el = e.target, a = el.dataset.act; if ((a !== "ai-img" && a !== "doubt-img") || !el.files || !el.files[0]) return;
  try {
    const src = await aiPrepImage(el.files[0]);
    if (a === "ai-img") { S.result.aiImg = S.result.aiImg || {}; S.result.aiImg[+el.dataset.i] = src; if (S.result.ai) delete S.result.ai[+el.dataset.i]; }
    else { const t = document.getElementById("doubtText"); if (t) aiState.doubt.text = t.value; aiState.doubt.img = src; }
  } catch (err) { if (a === "doubt-img") aiState.doubt.err = err.message; }
  render();
});
