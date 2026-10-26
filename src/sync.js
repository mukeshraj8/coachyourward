/* Progress sync: the study plan, test history, exam date, mistake book, revision schedule and date sheet are kept in one document per person, so progress
   follows them to every device. Two back ends plug in through startSync(): the claude.ai store (db + user
   capabilities, below) and Firebase on the own website (fbsync.js). Without either, progress stays in this
   device's localStorage. Loads after app.js. */
const SYNC_KEYS = ["plan", "history", "examDate", "mistakes", "revise", "dateSheet"];
const sync = { backend: null, busy: false, again: false, timer: null, seen: store.get("syncedAt", 0), first: true, unsub: null };
const baseStoreSet = store.set;
const SYNC_OFF = "Progress is saved on this device.";
let syncOnNote = "Progress syncs to your account.";

store.set = function (k, v) {
  baseStoreSet.call(store, k, v);
  if (SYNC_KEYS.includes(k)) { baseStoreSet.call(store, "updatedAt", Date.now()); schedulePush(); }
};

function syncNote(text) { const el = document.querySelector(".rail-foot"); if (el) el.textContent = text; }

function schedulePush() {
  if (!sync.backend) return;
  clearTimeout(sync.timer); sync.timer = setTimeout(pushProgress, 1500);
}

async function pushProgress() {
  if (!sync.backend) return;
  if (sync.busy) { sync.again = true; return; }
  sync.busy = true;
  const at = store.get("updatedAt", 0) || Date.now();
  try {
    await sync.backend.set(JSON.parse(JSON.stringify({ plan: S.plan, history: S.history, examDate: S.examDate, mistakes: S.mistakes || {}, revise: S.revise || {}, dateSheet: S.dateSheet || {}, updatedAt: at })));
    sync.seen = at; baseStoreSet.call(store, "syncedAt", at);
    syncNote(syncOnNote);
  } catch (e) {
    const code = e && e.code;
    if (code === "unavailable" || code === "resource_exhausted") { syncNote("Sync paused; progress is safe on this device."); setTimeout(schedulePush, 5000 + Math.random() * 5000); }
    else { stopSync(); }
  } finally {
    sync.busy = false;
    if (sync.again) { sync.again = false; pushProgress(); }
  }
}

// Take the account copy, keeping any tests taken on this device since the last sync.
function applyRemote(d) {
  const known = new Set((d.history || []).map(h => h.id));
  const extra = S.history.filter(h => !known.has(h.id) && h.id > sync.seen);
  S.plan = { ...(d.plan || {}) };
  S.history = [...(d.history || []), ...extra].sort((a, b) => a.id - b.id);
  if (d.examDate) S.examDate = d.examDate;
  if (d.mistakes) { S.mistakes = d.mistakes; baseStoreSet.call(store, "mistakes", S.mistakes); }
  if (d.revise) { S.revise = d.revise; baseStoreSet.call(store, "revise", S.revise); }
  if (d.dateSheet) { S.dateSheet = d.dateSheet; baseStoreSet.call(store, "dateSheet", S.dateSheet); }
  baseStoreSet.call(store, "plan", S.plan); baseStoreSet.call(store, "history", S.history); baseStoreSet.call(store, "examDate", S.examDate);
  sync.seen = d.updatedAt; baseStoreSet.call(store, "syncedAt", d.updatedAt);
  baseStoreSet.call(store, "updatedAt", extra.length ? Date.now() : d.updatedAt);
  if (extra.length) schedulePush();
  if (!S.test) render();
}

// backend: { set(data) → Promise, subscribe(onDoc(data | null), onError) → unsubscribe }.
// onDoc must only receive server-confirmed state.
function startSync(backend, note) {
  stopSync();
  sync.backend = backend; sync.first = true;
  if (note) syncOnNote = note;
  sync.unsub = backend.subscribe(d => {
    const local = store.get("updatedAt", 0);
    if (sync.first) {
      sync.first = false;
      if (d && d.updatedAt > local) applyRemote(d);
      else if (!d ? local || S.history.length || Object.keys(S.plan).length : local > d.updatedAt) pushProgress();
      else syncNote(syncOnNote);
    } else if (d && d.updatedAt > local && d.updatedAt !== sync.seen) applyRemote(d);
  }, () => stopSync());
}

function stopSync() {
  if (sync.unsub) { try { sync.unsub(); } catch (e) {} }
  sync.backend = null; sync.unsub = null; clearTimeout(sync.timer);
  syncNote(SYNC_OFF);
}

/* ---------- claude.ai back end ---------- */
(async function claudeSync() {
  if (!(window.claude && typeof claude.use === "function")) return;
  let db, user;
  try { [db, user] = await Promise.all([claude.use("db"), claude.use("user")]); } catch (e) { return; }
  if (!db || !user) return;
  const uid = await user.id();
  if (!uid) return;
  let ref;
  try { ref = db.doc("data/users/" + uid + "/progress"); } catch (e) { return; }
  startSync({
    set: data => ref.set(data),
    subscribe: (onDoc, onError) => ref.onSnapshot(snap => {
      if (snap.metadata.fromCache || snap.metadata.hasPendingWrites) return;
      onDoc(snap.exists ? snap.data() : null);
    }, onError)
  }, "Progress syncs to your claude.ai account.");
})();
