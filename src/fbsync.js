/* Own-website sign-in: Google accounts through Firebase Auth, progress in Firestore at users/{uid}.
   Only runs when the site build sets window.FIREBASE_CONFIG. Loads after sync.js. */
const FB_SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
const fb = { auth: null, user: null, state: "loading", error: "" };

(function () {
  const css = `
.acct { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 16px; }
.acct p { margin: 0; font-size: .95rem; }
.acct .who { font-weight: 600; }`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
})();

function accountCard() {
  if (fb.state === "loading") return `<div class="card acct"><p class="muted">Checking sign-in…</p></div>`;
  if (fb.state === "off") return `<div class="card acct"><p class="muted">Sign-in is unavailable right now (${esc(fb.error || "no connection")}). Progress is saved on this device.</p></div>`;
  if (fb.user) return `<div class="card acct"><p>Signed in as <span class="who">${esc(fb.user.displayName || fb.user.email || "you")}</span>. Progress syncs across all your devices.</p>
    <button class="btn small" data-act="fb-out">Sign out</button></div>`;
  return `<div class="card acct"><p><b>Sign in with Google</b> to keep the plan, test scores and exam date in sync on phone and PC.</p>
    <button class="btn primary" data-act="fb-in">Sign in with Google</button></div>`;
}

if (window.FIREBASE_CONFIG) {
  const basePageHome = pageHome;
  pageHome = function () { return accountCard() + basePageHome(); };

  view.addEventListener("click", async e => {
    const el = e.target.closest("[data-act]"); if (!el || !fb.auth) return;
    if (el.dataset.act === "fb-in") {
      const provider = new firebase.auth.GoogleAuthProvider();
      try { await fb.auth.signInWithPopup(provider); }
      catch (err) {
        if (err && (err.code === "auth/popup-blocked" || err.code === "auth/operation-not-supported-in-this-environment")) fb.auth.signInWithRedirect(provider);
      }
    } else if (el.dataset.act === "fb-out") {
      await fb.auth.signOut();
    }
  });

  const load = src => new Promise((res, rej) => { const s = document.createElement("script"); s.src = FB_SDK + src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  (async () => {
    try {
      await load("firebase-app-compat.js");
      await Promise.all([load("firebase-auth-compat.js"), load("firebase-firestore-compat.js")]);
      firebase.initializeApp(window.FIREBASE_CONFIG);
      fb.auth = firebase.auth();
      const fs = firebase.firestore();
      fb.auth.onAuthStateChanged(u => {
        fb.user = u; fb.state = "ready";
        if (u) {
          const ref = fs.collection("users").doc(u.uid);
          startSync({
            set: data => ref.set(data),
            subscribe: (onDoc, onError) => ref.onSnapshot({ includeMetadataChanges: true }, snap => {
              if (snap.metadata.fromCache || snap.metadata.hasPendingWrites) return;
              onDoc(snap.exists ? snap.data() : null);
            }, onError)
          }, "Progress syncs to your Google account.");
        } else stopSync();
        if (S.page === "home" && !S.test) render();
      });
    } catch (err) {
      fb.state = "off"; fb.error = "couldn't load sign-in";
      if (S.page === "home" && !S.test) render();
    }
  })();
}
