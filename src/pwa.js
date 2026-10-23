/* Website only: register the service worker so the app can be installed and opened offline. */
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}

/* On Android phones opened in the browser, offer the Android app on the Dashboard. */
const APK_URL = "https://github.com/mukeshraj8/coachyourward/releases/latest/download/CoachYourWard.apk";
const inApp = window.matchMedia && matchMedia("(display-mode: standalone)").matches || document.referrer.startsWith("android-app://");
if (/Android/i.test(navigator.userAgent) && !inApp) {
  const pwaBasePageHome = pageHome;
  pageHome = function () {
    return `<div class="card row spread"><p style="margin:0">Use CoachYourWard as an <b>Android app</b>: it opens straight from the home screen and works offline.</p><a class="btn primary" href="${APK_URL}">Download the app</a></div>` + pwaBasePageHome();
  };
}
