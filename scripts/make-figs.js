/* Draws the figures for past-paper questions as small SVGs and writes src/figs.js.
   Run from the repository root: node scripts/make-figs.js (then sh scripts/build.sh).
   Figures are drawn from each question's own data and are not to scale, like the board's figures.
   Keys are "<paper id>:<question number>", or "<paper id>:<passage title>" for a case-study passage. */
const fs = require("fs");

/* ---------- geometry ---------- */
const R = Math.PI / 180;
const at = (O, r, deg) => [O[0] + r * Math.cos(deg * R), O[1] - r * Math.sin(deg * R)]; // deg counter-clockwise from east
const lerp = (A, B, t) => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];
const dist = (A, B) => Math.hypot(B[0] - A[0], B[1] - A[1]);
const angTo = (O, P) => Math.atan2(-(P[1] - O[1]), P[0] - O[0]) / R;
function inter(A, B, C, D) {
  const d = (A[0] - B[0]) * (C[1] - D[1]) - (A[1] - B[1]) * (C[0] - D[0]);
  const t = ((A[0] - C[0]) * (C[1] - D[1]) - (A[1] - C[1]) * (C[0] - D[0])) / d;
  return lerp(A, B, t);
}
function foot(P, A, B) {
  const dx = B[0] - A[0], dy = B[1] - A[1], t = ((P[0] - A[0]) * dx + (P[1] - A[1]) * dy) / (dx * dx + dy * dy);
  return lerp(A, B, t);
}
// Points where tangents from external point E touch circle (O, r)
function tangents(E, O, r) {
  const d = dist(E, O), a = Math.acos(r / d) / R, b = angTo(O, E);
  return [at(O, r, b + a), at(O, r, b - a)];
}
// Point beyond B on line AB, extended by length k
const ext = (A, B, k) => { const d = dist(A, B); return [B[0] + (B[0] - A[0]) / d * k, B[1] + (B[1] - A[1]) / d * k]; };
// Tangent line through point T on circle centre O: the two ends at length k either side
const tanLine = (O, T, k) => { const a = angTo(O, T) + 90; return [at(T, k, a), at(T, k, a + 180)]; };
// Tangent line to circle (O, r) in direction of angle deg (normal direction n): touching point and line ends
const tanAt = (O, r, deg, k) => { const T = at(O, r, deg); return [T, ...tanLine(O, T, k)]; };

/* ---------- drawing ---------- */
const f1 = n => +n.toFixed(1);
class Fig {
  constructor(w, h) { this.w = w; this.h = h; this.P = {}; this.out = []; this.labs = []; this.top = []; }
  pts(o) { Object.assign(this.P, o); return this; }
  p(k) { const v = typeof k === "string" ? this.P[k] : k; if (!v) throw new Error("no point " + k); return v; }
  seg(s, dash) { s.split(" ").filter(Boolean).forEach(pair => { const [a, b] = pair.split("-"); const A = this.p(a), B = this.p(b);
    this.out.push(`<line x1="${f1(A[0])}" y1="${f1(A[1])}" x2="${f1(B[0])}" y2="${f1(B[1])}"${dash ? ' stroke-dasharray="4 3"' : ""}/>`); }); return this; }
  dash(s) { return this.seg(s, true); }
  line(A, B, dash) { return this.seg2(A, B, dash); }
  seg2(A, B, dash) { this.out.push(`<line x1="${f1(A[0])}" y1="${f1(A[1])}" x2="${f1(B[0])}" y2="${f1(B[1])}"${dash ? ' stroke-dasharray="4 3"' : ""}/>`); return this; }
  poly(names, cls) { const pts = names.split(" ").map(k => this.p(k)).map(q => f1(q[0]) + "," + f1(q[1])).join(" "); this.out.push(`<polygon points="${pts}"${cls ? ` class="${cls}"` : ' fill="none"'}/>`); return this; }
  circle(O, r, cls) { O = this.p(O); this.out.push(`<circle cx="${f1(O[0])}" cy="${f1(O[1])}" r="${f1(r)}"${cls ? ` class="${cls}"` : ' fill="none"'}/>`); return this; }
  path(d, cls, dash) { this.out.push(`<path d="${d}"${cls ? ` class="${cls}"` : ' fill="none"'}${dash ? ' stroke-dasharray="4 3"' : ""}/>`); return this; }
  // arc of circle (O, r) from angle a to b (counter-clockwise, degrees)
  arcD(O, r, a, b) { O = this.p(O); const A = at(O, r, a), B = at(O, r, b), large = ((b - a) % 360 + 360) % 360 > 180 ? 1 : 0;
    return `M${f1(A[0])} ${f1(A[1])}A${f1(r)} ${f1(r)} 0 ${large} 0 ${f1(B[0])} ${f1(B[1])}`; }
  arc(O, r, a, b, dash) { return this.path(this.arcD(O, r, a, b), null, dash); }
  // small angle mark at vertex V between rays to A and B, with optional text
  ang(V, A, B, text, r = 16) {
    V = this.p(V); let a = angTo(V, this.p(A)), b = angTo(V, this.p(B));
    let d = ((b - a) % 360 + 360) % 360; if (d > 180) { [a, b] = [b, a]; d = 360 - d; }
    this.out.push(`<path d="${this.arcD(V, r, a, a + d)}" fill="none" class="thin"/>`);
    if (text) { const m = at(V, r + 11, a + d / 2); this.text(m[0], m[1] + 4, text, "small"); }
    return this;
  }
  right(V, A, B, s = 9) {
    V = this.p(V); const ua = lerp(V, this.p(A), s / dist(V, this.p(A))), ub = lerp(V, this.p(B), s / dist(V, this.p(B)));
    const c = [ua[0] + ub[0] - V[0], ua[1] + ub[1] - V[1]];
    this.out.push(`<polyline points="${f1(ua[0])},${f1(ua[1])} ${f1(c[0])},${f1(c[1])} ${f1(ub[0])},${f1(ub[1])}" fill="none" class="thin"/>`);
    return this;
  }
  text(x, y, t, cls) { this.top.push(`<text x="${f1(x)}" y="${f1(y)}"${cls ? ` class="${cls}"` : ""}>${t}</text>`); return this; }
  // text at the middle of segment AB, pushed sideways by (dx, dy)
  mid(a, b, t, dx = 0, dy = 0) { const m = lerp(this.p(a), this.p(b), 0.5); return this.text(m[0] + dx, m[1] + dy + 4, t, "small"); }
  dot(k) { const q = this.p(k); this.out.push(`<circle cx="${f1(q[0])}" cy="${f1(q[1])}" r="2.2" class="dot"/>`); return this; }
  // labels: "A:n B:sw O:e" etc. Compass direction places the name beside the point.
  lab(spec) {
    const dirs = { n: [0, -9], s: [0, 17], e: [11, 5], w: [-11, 5], ne: [9, -5], nw: [-9, -5], se: [9, 15], sw: [-9, 15], c: [0, 5] };
    spec.split(" ").filter(Boolean).forEach(item => {
      const [k, d = "n"] = item.split(":"), q = this.p(k), o = dirs[d];
      this.labs.push(`<text x="${f1(q[0] + o[0])}" y="${f1(q[1] + o[1])}" class="lab">${k.replace(/'/g, "′")}</text>`);
    });
    return this;
  }
  svg() {
    return `<svg viewBox="0 0 ${this.w} ${this.h}" role="img" aria-label="Figure">${this.out.join("")}${this.top.join("")}${this.labs.join("")}</svg>`;
  }
}
// Two figures side by side (for OR questions), each with a caption
function pair(a, capA, b, capB) {
  const w = a.w + b.w + 20, h = Math.max(a.h, b.h) + 18;
  const inner = (f, x) => `<g transform="translate(${x},0)">${f.svg().replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g>`;
  return `<svg class="wide" viewBox="0 0 ${w} ${h}" role="img" aria-label="Figures">${inner(a, 0)}${inner(b, a.w + 20)}<text x="${a.w / 2}" y="${h - 3}" class="cap">${capA}</text><text x="${a.w + 20 + b.w / 2}" y="${h - 3}" class="cap">${capB}</text></svg>`;
}
// Axes for graphs: origin at (ox, oy)
function axes(f, ox, oy, x0, x1, y0, y1) {
  f.seg2([x0, oy], [x1, oy]).seg2([ox, y0], [ox, y1]);
  f.text(x1 - 4, oy + 14, "x", "small").text(ox + 8, y0 + 8, "y", "small").text(ox - 9, oy + 14, "O", "small");
  return f;
}
const plot = (fn, a, b, n = 60) => { let d = ""; for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n; d += (i ? "L" : "M") + f1(x) + " " + f1(fn(x)); } return d; };

const FIGS = {};
const add = (key, f) => { FIGS[key] = typeof f === "string" ? f : f.svg(); };

/* Triangle with a line DE parallel to the base: D on AB, E on AC (or on BC). */
function bpt(t, names = "A B C D E") {
  const [a, b, c, d, e] = names.split(" ");
  const A = [150, 20], B = [40, 180], C = [260, 180];
  return new Fig(300, 200).pts({ [a]: A, [b]: B, [c]: C, [d]: lerp(A, B, t), [e]: lerp(A, C, t) })
    .poly(`${a} ${b} ${c}`).seg(`${d}-${e}`).lab(`${a}:n ${b}:sw ${c}:se ${d}:w ${e}:e`);
}

/* ================= Mathematics ================= */
add("m19-1:5", bpt(1 / 3));

{ const O = [100, 105], r = 60, T = [200, 105], [P, Q] = tangents(T, O, r);
  add("m19-1:18", new Fig(240, 210).pts({ O, T, P, Q }).circle("O", r).seg("P-Q O-P O-Q P-T Q-T").dash("O-T").dot("O").lab("O:w T:e P:n Q:s")); }

{ const A = [30, 170], B = [270, 170], C = [100, 70], D = [100, 170];
  add("m19-1:19", new Fig(300, 195).pts({ A, B, C, D }).poly("A B C").seg("C-D").right("C", "A", "B").right("D", "C", "B").lab("A:sw B:se C:n D:s")); }

{ const O = [150, 110], f = new Fig(300, 220).pts({ O, A: [70, 50], B: [230, 50], C: [230, 170], D: [70, 170] });
  f.path(`M50 110a100 100 0 1 0 200 0a100 100 0 1 0 -200 0ZM70 50L70 170L230 170L230 50Z`, "shade eo");
  add("m19-1:20", f.poly("A B C D").seg("A-C").dot("O").lab("A:nw B:ne C:se D:sw O:n").mid("A", "B", "8 cm", 0, -8).mid("B", "C", "6 cm", -18, 0)); }

{ const A = [85, 40], B = [85, 180], C = [275, 180], O = [85, 110], P = foot(B, A, C), Q = [180, 180];
  const [t1, t2] = tanLine(O, P, 70);
  add("m22s-1:12", new Fig(290, 205).pts({ A, B, C, O, P, Q }).circle("O", 70).poly("A B C").seg("B-P").seg2(P, Q).right("B", "A", "C").dot("O").lab("A:n B:sw C:se O:w P:ne Q:s")); }

{ // matchstick figures: squares in a row with a triangle on every outer side
  const f = new Fig(330, 120), s = 26;
  const fig = (x0, n, cap) => {
    const y0 = 40; let d = `M${x0} ${y0}h${n * s}v${s}h${-n * s}Z`;
    for (let i = 1; i < n; i++) d += `M${x0 + i * s} ${y0}v${s}`;
    for (let i = 0; i < n; i++) d += `M${x0 + i * s} ${y0}l${s / 2} ${-s * 0.8}l${s / 2} ${s * 0.8}M${x0 + i * s} ${y0 + s}l${s / 2} ${s * 0.8}l${s / 2} ${-s * 0.8}`;
    d += `M${x0} ${y0}l${-s * 0.8} ${s / 2}l${s * 0.8} ${s / 2}M${x0 + n * s} ${y0}l${s * 0.8} ${s / 2}l${-s * 0.8} ${s / 2}`;
    f.path(d); f.text(x0 + n * s / 2, 112, cap, "cap");
  };
  fig(30, 1, "Figure 1"); fig(110, 2, "Figure 2"); fig(220, 3, "Figure 3");
  add("m22s-1:13", f); }

{ const O = [150, 85], r = 60, B = [150, 145], A = at(O, r, -5);
  add("m23s-1:5", new Fig(300, 175).pts({ O, A, B, P: [50, 145], Q: [250, 145] }).circle("O", r).seg("O-A O-B A-B P-Q").dot("O").ang("O", "A", "B", "95°").lab("O:nw A:e B:s P:s Q:s")); }

{ const A = [60, 40], B = [60, 160], C = [210, 160];
  add("m23s-1:20", new Fig(260, 185).pts({ A, B, C }).poly("A B C").right("B", "A", "C").lab("A:n B:sw C:se").mid("A", "B", "2 cm", -24, 0).mid("B", "C", "3 cm", 0, 14)); }

{ const A = [150, 20], B = [30, 190], C = [270, 190], M = lerp(B, C, 3 / 8), Z = lerp(A, C, 0.6), X = lerp(A, B, 0.6), Y = lerp(A, M, 0.6);
  add("m23s-1:22", new Fig(300, 215).pts({ A, B, C, M, X, Y, Z }).poly("A B C").seg("X-Z A-M").lab("A:n B:sw C:se M:s X:w Z:e Y:ne")); }

{ // circle inscribed in ABCD, angle B = 90°: AB and BC are tangents along the axes
  const O = [130, 100], r = 50, B = [80, 150];
  // D first: the two tangents from D meet the tangent lines AB (x = 80) and BC (y = 150) at A and C
  const D = [235, 35], [tA, tC] = tangents(D, O, r).sort((u, v) => u[0] - v[0]);
  const A = inter(D, tA, [80, 0], [80, 10]), C = inter(D, tC, [0, 150], [10, 150]);
  const f = new Fig(300, 175).pts({ O, A, B, C, D, P: [130, 150], Q: [80, 100], R: tA, S: tC });
  add("m23s-1:29", f.circle("O", r).poly("A B C D").right("B", "A", "C").dot("O").dash("O-P O-Q").lab("A:nw B:sw C:se D:ne O:e P:s Q:w R:ne S:e")); }

{ const O = [70, 95], r = 55, A = at(O, r, 90), B = [O[0] + r / Math.tan(30 * R), A[1]], Q = lerp(O, B, r / dist(O, B));
  const P = [Q[0], A[1]];
  add("m23s-1:38", new Fig(260, 165).pts({ O, A, B, Q, P }).circle("O", r).seg("O-A A-B O-B P-Q").right("A", "O", "B").ang("B", "A", "O", "30°", 22).dot("O").lab("O:w A:n B:e Q:s P:n")); }

{ const f = axes(new Fig(240, 190), 120, 100, 15, 225, 10, 185);
  f.seg2([60, 180], [225, 30]).seg2([40, 20], [225, 150]);
  add("m24s-1:18", f); }

{ const B = [30, 110], D = [270, 110], A = [120, 30], C = [120, 190];
  add("m24s-1:24", new Fig(300, 210).pts({ A, B, C, D }).poly("A B C D").seg("B-D").ang("B", "A", "D", "", 22).ang("B", "D", "C", "", 26).ang("D", "B", "A", "", 22).ang("D", "C", "B", "", 26).lab("A:n B:w C:s D:e")); }

{ // (A) AB a diameter, AQ and BP tangents at its ends, PQ tangent at C
  const O = [110, 100], r = 55, A = [110, 45], B = [110, 155], [C, t1, t2] = tanAt(O, r, -20, 10);
  const Q = inter(A, [200, 45], C, t1), Pp = inter(B, [200, 155], C, t1);
  const fa = new Fig(230, 190).pts({ O, A, B, C, Q, P: Pp, X: [20, 45], Y: [20, 155] }).circle("O", r).seg("A-B X-Q Y-P P-Q O-P O-Q").dot("O").lab("O:w A:n B:s C:e Q:ne P:se");
  // (B) circle in ABCD, AD ⊥ DC: D at bottom-left
  const O2 = [90, 95], r2 = 45, D = [45, 140];
  const Ad = [45, 25], Cd = [230, 140];
  const tA = tangents(Ad, O2, r2).find(t => t[0] > 50), tC = tangents(Cd, O2, r2).find(t => t[1] < 135);
  const Bd = inter(Ad, tA, Cd, tC);
  const fb = new Fig(250, 190).pts({ O: O2, A: Ad, B: Bd, C: Cd, D, P: [45, 95], Q: [90, 140], R: tC, S: tA }).circle("O", r2).poly("A B C D").right("D", "A", "C").dot("O").lab("A:nw B:ne C:se D:sw O:c P:w Q:s R:e S:n");
  add("m24s-1:30", pair(fa, "(A)", fb, "(B)")); }

{ const A = [30, 170], C = [270, 170], P = [30, 50], R = [270, 80], Q = inter(P, C, R, A), B = [Q[0], 170];
  add("m24s-1:34", new Fig(300, 195).pts({ A, B, C, P, Q, R }).seg("A-C A-P C-R P-C R-A Q-B").right("A", "P", "C").right("B", "Q", "C").right("C", "R", "A")
    .lab("A:sw B:s C:se P:n Q:n R:n").mid("A", "P", "x", -10, 0).mid("Q", "B", "y", 8, 0).mid("C", "R", "z", 10, 0)); }

{ const f = axes(new Fig(260, 200), 130, 100, 15, 245, 10, 190);
  f.path(plot(x => 100 + ((x - 130) * (x - 130) - 3600) / 60, 45, 215)).path(plot(x => 100 - ((x - 130) * (x - 130) - 3600) / 60, 45, 215));
  add("m25s-1:10", f); }

{ const O = [100, 100], r = 55, A = [100, 155], B = [100, 45], P = [230, 155];
  add("m25s-1:16", new Fig(260, 180).pts({ O, A, B, P }).circle("O", r).seg("A-B A-P O-P").right("A", "O", "P").dot("O").ang("O", "B", "P", "115°", 14).lab("O:w A:s B:n P:e")); }

{ // (b) ΔPQR with S on QR, T on QP produced
  const Q = [40, 170], R = [250, 170], P = [130, 80], S = [170, 170], T = ext(Q, P, 70);
  add("m25s-1:24", new Fig(290, 195).pts({ P, Q, R, S, T }).poly("P Q R").seg("P-S P-T T-R").ang("Q", "R", "P", "1", 20).ang("R", "P", "Q", "2", 20).lab("P:w Q:sw R:se S:s T:n")); }

{ const O = [140, 95], r = 55, C = [140, 150], B = [40, 150], D = [260, 150];
  const A = at(O, r, angTo(B, O) + 0), Pp = (() => { // line from B through O meets circle at P (near) and A (far)
    const u = [(O[0] - B[0]) / dist(B, O), (O[1] - B[1]) / dist(B, O)], d = dist(B, O);
    return [[B[0] + u[0] * (d - r), B[1] + u[1] * (d - r)], [B[0] + u[0] * (d + r), B[1] + u[1] * (d + r)]]; })();
  add("m25s-1:26", new Fig(290, 175).pts({ O, C, B, D, P: Pp[0], A: Pp[1] }).circle("O", r).seg("B-D B-A A-C O-C").right("C", "O", "D").dot("O").lab("O:s A:ne B:sw C:s D:se P:nw")); }

{ const O = [120, 110], r = 85, f = new Fig(240, 220).pts({ O });
  f.circle("O", r); for (let i = 0; i < 5; i++) f.seg2(at(O, r, 90 + i * 36), at(O, r, 270 + i * 36));
  f.path(f.arcD(O, r, 90, 126), "thick");
  f.pts({ A: at(O, r, 126), B: at(O, r, 90), C: at(O, r, 108) });
  add("m25s-1:37", f.dot("O").lab("O:se A:nw B:n C:n").text(120, 216, "Diameter 35 mm", "small")); }

{ const A = [40, 190], B = [40, 110], E = [240, 190], C = [240, 20], D = [240, 110];
  add("m25s-1:38", new Fig(280, 210).pts({ A, B, C, D, E }).seg("A-E C-E A-B A-C B-C").dash("B-D").right("E", "A", "C").ang("A", "E", "C", "60°", 24).ang("B", "D", "C", "45°", 24)
    .lab("A:sw B:w C:n D:e E:se").mid("A", "B", "40 m", -22, 0).mid("C", "D", "h", 10, 0)); }

add("m26s-1:6", bpt(1 / 4));

{ // circle centred (1, 2) through the origin; diameter from (0, 4) to (2, 0)
  const s = 40, ox = 60, oy = 190, X = (x, y) => [ox + x * s, oy - y * s];
  const f = axes(new Fig(220, 215), ox, oy, 15, 210, 10, 210);
  f.pts({ C: X(1, 2), A: X(0, 4), B: X(2, 0) }).circle("C", Math.sqrt(5) * s).seg("A-B").dot("C").dot("A").dot("B");
  add("m26s-1:7", f.text(X(1, 2)[0] + 30, X(1, 2)[1] + 2, "(1, 2)", "small")); }

{ const O = [110, 95], r = 60, S = at(O, r, 180), P = at(O, r, 0), Rr = at(O, r, 65);
  const Q1 = [P[0], 15], Q2 = [P[0], 190], T = inter(S, Rr, Q1, Q2);
  add("m26s-1:14", new Fig(260, 200).pts({ O, S, P, R: Rr, T, Q: [P[0], 185] }).circle("O", r).seg("S-P O-R S-T").seg2(Q1, Q2).dot("O").ang("O", "P", "R", "65°", 16).lab("O:s S:w P:se R:n T:e Q:e")); }

{ const A = [70, 30], B = [30, 180], C = [280, 180], D = [150, 180];
  add("m26s-1:22", new Fig(310, 200).pts({ A, B, C, D }).poly("A B C").seg("A-D").ang("A", "B", "C", "", 22).ang("D", "A", "C", "", 22).lab("A:n B:sw C:se D:s")); }

{ const O = [130, 92], r = 80, A = at(O, r, 210), B = at(O, r, 330), f = new Fig(260, 185).pts({ O, A, B });
  f.path(`${f.arcD(O, r, 210, 330)}Z`, "shade").circle("O", r).seg("O-A O-B A-B").dot("O").ang("O", "A", "B", "120°", 16);
  add("m26s-1:27", f.lab("O:n A:w B:e")); }

{ // (a) shed: cuboid with a half-cylinder roof, drawn in oblique view; (b) cone on a hemisphere
  const fa = new Fig(240, 190), x = 30, y = 95, w = 110, h = 70, dx = 70, dy = -35;
  fa.path(`M${x} ${y}h${w}v${h}h${-w}Z M${x + w} ${y}l${dx} ${dy}v${h}l${-dx} ${-dy}`);
  fa.path(`M${x} ${y}A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y}`).path(`M${x + dx} ${y + dy}A${w / 2} ${w / 2} 0 0 1 ${x + w + dx} ${y + dy}`);
  fa.path(`M${x + w / 2} ${y - w / 2}l${dx} ${dy}`).path(`M${x + w + dx} ${y + dy + h}`);
  fa.text(x + w / 2, y + h + 16, "14 m", "small").text(x + w + dx / 2 + 14, y + h + dy / 2 + 12, "25 m", "small").text(x - 14, y + h / 2 + 4, "16 m", "small");
  const fb = new Fig(170, 190), c = [85, 120], R2 = 60;
  fb.path(`M${c[0] - R2} ${c[1]}A${R2} ${R2} 0 0 0 ${c[0] + R2} ${c[1]}`).path(`M${c[0] - 40} ${c[1]}A40 40 0 0 0 ${c[0] + 40} ${c[1]}`, null, true);
  fb.path(`M${c[0] - R2} ${c[1]}H${c[0] - 40}M${c[0] + 40} ${c[1]}H${c[0] + R2}`).path(`M${c[0] - 40} ${c[1]}L${c[0]} ${c[1] - 95}L${c[0] + 40} ${c[1]}`).path(`M${c[0]} ${c[1]}V${c[1] - 95}`, null, true);
  add("m26s-1:29", pair(fa, "(a)", fb, "(b)")); }

{ // two circles on line QBT, tangents from T
  const M = [70, 87], N = [175, 112], Q = [70, 140], B = [175, 140], T = [285, 140];
  const P = tangents(T, M, 53).find(t => t[1] < 100), A = tangents(T, N, 28).find(t => t[1] < 120);
  add("m26s-1:33", new Fig(310, 165).pts({ M, N, Q, B, T, P, A }).circle("M", 53).circle("N", 28).seg("Q-T P-T M-Q N-B M-P N-A").dash("M-N").dot("M").dot("N").lab("M:n N:n Q:s B:s T:s P:n A:n")); }

{ // carom board, side 65: C top-left, B top-right, A bottom-right, D bottom-left; R on AB (right side)
  const s = 3, X = (u, v) => [22 + u * s, 212 - v * s]; // u from D rightwards, v upwards
  const D = X(0, 0), A = X(65, 0), B = X(65, 65), C = X(0, 65), P = X(30, 9 + 0), Rr = X(65, 37), Q = X(65, 9), S = X(30, 0);
  const f = new Fig(245, 240).pts({ A, B, C, D, P, R: Rr, Q, S, T: X(50, 37) });
  f.poly("A B C D").seg("P-R R-C P-Q P-S").dash("R-T").dot("P");
  add("m26s-1:Case study 1", f.lab("A:se B:ne C:nw D:sw P:w R:e Q:e S:s T:w").mid("P", "Q", "35 cm", 0, -8).mid("P", "S", "9", 8, 0)); }

{ const O = [90, 110], r = 50, A = at(O, r, 90 + 45), B = at(O, r, 45 - 45 + 0);
  const a = at(O, r, 135 - 45), b = at(O, r, 0 - 0);
  // tangents at A (top) and B (right) are perpendicular: P is the corner
  const A2 = [90, 60], B2 = [140, 110], P = [140, 60];
  add("m26s-2:13", new Fig(200, 170).pts({ O, A: A2, B: B2, P }).circle("O", r).seg("O-A O-B A-P B-P A-B").right("A", "O", "P").right("B", "O", "P").dot("O").lab("O:sw A:n B:e P:ne")); }

{ const O = [100, 100], r = 60, A = [100, 160], B = [100, 40], C = at(O, r, 40), T = [230, 160];
  add("m26s-2:14", new Fig(250, 185).pts({ O, A, B, C, T }).circle("O", r).seg("A-B B-C C-A A-T").dot("O").ang("B", "A", "C", "50°", 18).lab("O:w A:s B:n C:ne T:s")); }

{ const O = [130, 95], r = 55, A = at(O, r, 210), C = at(O, r, 330);
  const Bp = at(A, 90, 210 - 90), Dp = at(C, 90, 330 + 90);
  add("m26s-2:25", new Fig(260, 175).pts({ O, A, C, B: Bp, D: Dp }).circle("O", r).seg("A-C A-B C-D").dot("O").lab("O:n A:w C:e B:sw D:se")); }

{ const O = [130, 95], r = 50, X = [130, 45], Y = [130, 145];
  const [M, t1] = tanAt(O, r, -30, 10), Pp = inter([0, 45], [10, 45], M, t1), Qp = inter([0, 145], [10, 145], M, t1);
  add("m26s-2:29", new Fig(260, 170).pts({ O, X, Y, M, P: Pp, Q: Qp, A: [20, 45], B: [240, 45], C: [20, 145], D: [240, 145] })
    .circle("O", r).seg("A-B C-D P-Q O-P O-Q").dash("X-Y").dot("O").lab("O:w X:n Y:s M:e P:n Q:s A:w B:e C:w D:e")); }

{ const C = [30, 190], A = [270, 190], O = [180, 190], P = [270, 190 - 90 * Math.tan(60 * R)], Rr = [30, 190 - 150];
  add("m26s-2:Case study 2", new Fig(300, 210).pts({ C, A, O, P, R: Rr }).seg("C-A A-P C-R O-P O-R").right("A", "O", "P").right("C", "O", "R")
    .ang("O", "A", "P", "60°", 22).ang("O", "R", "C", "45°", 22).lab("C:sw A:se O:s P:ne R:nw").text(285, 120, "Y", "small").text(15, 120, "X", "small")); }

{ const O = [90, 100], r = 45, Pp = [260, 100], Rr = [45, 100], T = tangents(Pp, O, r)[0];
  add("mb20-1:3", new Fig(280, 160).pts({ O, P: Pp, R: Rr, T }).circle("O", r).seg("R-P O-T P-T").right("T", "O", "P").dot("O").lab("O:s P:e R:w T:n")); }

{ const f = axes(new Fig(260, 200), 130, 100, 15, 245, 10, 190);
  f.path(plot(x => { const u = (x - 130) / 40; return 100 - 25 * (u + 2) * (u + 0.3) * (u - 1.8) / 2; }, 40, 215));
  add("mb20-1:8", f); }

add("mb20-1:19", bpt(0.75));

{ const O = [140, 100], r = 55;
  const A = [40, 30], C = [250, 180];
  const tA = tangents(A, O, r), tC = tangents(C, O, r);
  const B = inter(A, tA[1], C, tC[0]), D = inter(A, tA[0], C, tC[1]);
  add("mb20-1:24", new Fig(290, 205).pts({ O, A, B, C, D }).circle("O", r).poly("A B C D").dot("O").lab("A:nw B:ne C:se D:sw O:c")); }

{ const A = [120, 30], B = [20, 190], C = [300, 190];
  // square DEFG with D, E on BC, G on AB, F on AC; A is the right angle
  const Ar = [100, 40], Br = [20, 190], Cr = [300, 190];
  const s = (() => { const H = 150, base = 280; return H * base / (H + base); })();
  const yTop = 190 - s, G = inter(Ar, Br, [0, yTop], [10, yTop]), F = inter(Ar, Cr, [0, yTop], [10, yTop]);
  const D = [G[0], 190], E = [F[0], 190];
  add("mb20-1:38", new Fig(320, 210).pts({ A: Ar, B: Br, C: Cr, D, E, F, G }).poly("A B C").poly("D E F G").lab("A:n B:sw C:se D:s E:s F:ne G:nw")); }

{ const O = [80, 90], r = 50, Pp = [250, 90], [A, B] = tangents(Pp, O, r);
  add("mb22-1:6", new Fig(270, 180).pts({ O, P: Pp, A, B }).circle("O", r).seg("O-A O-B P-A P-B").dash("O-P").dot("O").ang("P", "A", "B", "70°", 30).lab("O:w P:e A:n B:s")); }

{ const B = [250, 190], A = [250, 90], Pp = [250 - 100 / Math.tan(60 * R), 190], Q = [250 - 100 / Math.tan(30 * R), 190];
  add("mb22-1:9", new Fig(280, 210).pts({ A, B, P: Pp, Q }).seg("Q-B A-B A-P A-Q").right("B", "A", "Q").ang("P", "A", "B", "60°", 18).ang("Q", "A", "B", "30°", 26).lab("A:n B:se P:s Q:sw").mid("A", "B", "h", 10, 0)); }

{ const O = [130, 95], r = 50, A = [130, 45], B = [130, 145], [Rr, t1] = tanAt(O, r, -35, 10);
  const Q = inter([0, 45], [10, 45], Rr, t1), Pp = inter([0, 145], [10, 145], Rr, t1);
  add("mb22-1:12", new Fig(270, 175).pts({ O, A, B, R: Rr, Q, P: Pp }).circle("O", r).seg2([20, 45], [250, 45]).seg2([20, 145], [250, 145]).seg("P-Q O-P O-Q").dash("A-B").dot("O")
    .lab("O:w A:n B:s R:e Q:n P:s").text(258, 49, "l", "small").text(258, 149, "m", "small")); }

{ const f = axes(new Fig(260, 200), 130, 170, 15, 245, 10, 190);
  f.path(plot(x => { const u = (x - 130) / 45; return 120 - 30 * (u * u - 1) * (u * u - 1) + 10 * 0; }, 50, 210));
  add("mb23-1:7", f); }

{ const A = [40, 40], B = [130, 40], O = [150, 100], k = 0.4, D = [O[0] + (O[0] - A[0]) * k, O[1] + (O[1] - A[1]) * k], C = [O[0] + (O[0] - B[0]) * k, O[1] + (O[1] - B[1]) * k];
  add("mb23-1:9", new Fig(210, 140).pts({ A, B, C, D, O }).seg("A-B C-D A-D B-C").lab("A:nw B:ne C:sw D:se O:e")); }

{ const tri = (x0, s, n) => { const B = [x0, 150], C = [x0 + 3.5 * s, 150], A = at(B, 2.2 * s, 50); return { [n[0]]: A, [n[1]]: B, [n[2]]: C }; };
  const f = new Fig(300, 170).pts({ ...tri(15, 22, "ABC"), ...tri(120, 44, "PQR") });
  f.poly("A B C").poly("P Q R").ang("B", "C", "A", "50°", 16).ang("Q", "R", "P", "50°", 16).lab("A:n B:sw C:se P:n Q:sw R:se")
    .mid("A", "B", "2.2", -14, 0).mid("B", "C", "3.5", 0, 12).mid("P", "Q", "4.4", -14, 0).mid("Q", "R", "7", 0, 12);
  add("mb23-1:15", f.text(160, 12, "lengths in cm", "small")); }

{ const O = [140, 125], r = 45, A = [140, 28];
  const [t1, t2] = tangents(A, O, r), B = inter(A, t2, [0, 170], [10, 170]), C = inter(A, t1, [0, 170], [10, 170]);
  add("mb23-1:17", new Fig(280, 192).pts({ A, B, C, P: [140, 170], R: t2, Q: t1, O }).circle("O", r).poly("A B C").lab("A:n B:sw C:se P:s R:w Q:e")); }

{ const O = [90, 90], r = 50, B = [250, 90], [C, D] = tangents(B, O, r);
  add("mb23-1:18", new Fig(270, 175).pts({ O, B, C, D }).circle("O", r).seg("O-C O-D B-C B-D O-B").dot("O").lab("O:w B:e C:n D:s")); }

{ // shared angle at A: B and P on one ray, C and M on the other; CB ⊥ AP and PM ⊥ AC
  const A = [20, 110], B = at(A, 180, -10), C = at(A, 220, 25), P = at(A, 146, -10), M = at(A, 120, 25);
  add("mb23-1:25", new Fig(260, 165).pts({ A, B, C, M, P }).seg("A-B A-C C-B P-M").right("B", "C", "A").right("M", "P", "A").lab("A:w B:se C:ne M:n P:s")); }

{ const B = [30, 180], A = [150, 25], C = [290, 180], E = [190, 180], D = inter(B, A, E, [E[0] - (C[0] - A[0]), E[1] - (C[1] - A[1])]);
  const F = inter(B, C, D, [D[0] + (E[0] - A[0]), D[1] + (E[1] - A[1])]);
  add("mb23-1:31", new Fig(320, 200).pts({ A, B, C, D, E, F }).poly("A B C").seg("D-E D-F A-E").lab("A:n B:sw C:se D:nw E:s F:s")); }

{ const O = [80, 90], r = 50, Pp = [250, 90], [A, B] = tangents(Pp, O, r);
  add("mb24-1:19", new Fig(270, 175).pts({ O, P: Pp, A, B }).circle("O", r).seg("O-A O-B P-A P-B").dot("O").right("A", "O", "P").right("B", "O", "P").lab("O:w P:e A:n B:s")); }

{ // (A) concentric circles: chord CD of the large circle touches the small one at Q; PA tangent to the large circle
  const O = [75, 95], r1 = 30, r2 = 60, Q = [75, 125], half = Math.sqrt(r2 * r2 - r1 * r1), Cc = [75 - half, 125], D = [75 + half, 125];
  const Pext = [175, 95], A = tangents(Pext, O, r2)[0];
  const fa = new Fig(200, 190).pts({ O, Q, C: Cc, D, P: Pext, A }).circle("O", r1).circle("O", r2).seg("C-D O-Q O-A P-A O-P").dot("O").lab("O:w Q:s C:sw D:se P:e A:n");
  const O2 = [80, 95], r = 45, T = [210, 95], [Pq, Qq] = tangents(T, O2, r);
  const fb = new Fig(230, 190).pts({ O: O2, T, P: Pq, Q: Qq }).circle("O", r).seg("O-P O-Q T-P T-Q P-Q").dot("O").lab("O:w T:e P:n Q:s");
  add("mb24-1:29", pair(fa, "(A)", fb, "(B)")); }

{ const C1 = [95, 100], C2 = [95 + 70 + 45, 100];
  add("mb24-1:36", new Fig(300, 190).pts({ A: C1, B: C2 }).circle("A", 70).circle("B", 45).seg("A-B").dot("A").dot("B")
    .mid("A", [165, 100], "R", 0, -8).mid([165, 100], "B", "r", 0, -8).text(150, 186, "14 m between centres", "small")); }

{ const O = [100, 140], r = 50, A = [100, 140 - r / Math.sin(30 * R)], [P, Q] = tangents(A, O, r);
  add("mb24-1:38", new Fig(200, 205).pts({ O, A, P, Q }).circle("O", r).seg("A-P A-Q O-P O-Q P-Q").dot("O").ang("A", "P", "Q", "60°", 22).lab("O:s A:n P:w Q:e")); }

{ const f = new Fig(320, 170), B = [20, 150], C = [140, 150], A = inter(B, at(B, 10, 60), C, at(C, 10, 180 - 40));
  const Q = [175, 150], Pp = [300, 150], Rr = inter(Q, at(Q, 10, 60), Pp, at(Pp, 10, 180 - 40));
  f.pts({ A, B, C, P: Pp, Q, R: Rr }).poly("A B C").poly("P Q R").ang("A", "B", "C", "80°", 14).ang("B", "C", "A", "60°", 16)
    .mid("A", "B", "3.8", -14, 0).mid("A", "C", "3√3", 16, 0).mid("B", "C", "6", 0, 12).mid("Q", "R", "7.6", -16, 0).mid("P", "R", "6√3", 18, 0).mid("P", "Q", "12", 0, 12);
  add("mb25-1:8", f.lab("A:n B:sw C:se R:n Q:sw P:se")); }

{ const O = [70, 100], r = 45, Pp = [70 + 90, 100], A = tangents([250, 100], O, r)[0];
  const P2 = [250, 100], A2 = tangents(P2, O, r)[0];
  add("mb25-1:9", new Fig(270, 175).pts({ O, P: P2, A: A2 }).circle("O", r).seg("O-P O-A P-A").right("A", "O", "P").ang("P", "O", "A", "30°", 30).dot("O").lab("O:w P:e A:n").mid("O", "P", "10 cm", 0, 14)); }

{ const T = [40, 30], G = [40, 170], X = [250, 170], H = [250, 30];
  add("mb25-1:12", new Fig(280, 190).pts({ T, G, X, H }).seg("T-G G-X T-X").dash("T-H").right("G", "T", "X")
    .text(85, 44, "z", "small").text(52, 70, "y", "small").text(215, 160, "x", "small").text(55, 160, "a", "small").text(180, 24, "horizontal", "small")); }

{ const O = [110, 40], r = 120, A = at(O, r, 240), B = at(O, r, 300), f = new Fig(220, 175).pts({ O, A, B });
  f.path(`M${f1(O[0])} ${f1(O[1])}L${f1(A[0])} ${f1(A[1])}${f.arcD(O, r, 240, 300).replace(/^M[^A]+/, "")}Z`, "shade").dash("A-B");
  add("mb25-1:13", f.dot("O").lab("O:n").mid("O", "A", "r", -10, 0).mid("O", "B", "r", 10, 0).mid("A", "B", "a", 0, -8).text(110, 170, "l", "small")); }

{ const Pa = [40, 40], Qa = [140, 40], O = [100, 95], k = 1.0, S = [O[0] + (O[0] - Pa[0]) * k, O[1] + (O[1] - Pa[1]) * k], Ra = [O[0] + (O[0] - Qa[0]) * k, O[1] + (O[1] - Qa[1]) * k];
  const fa = new Fig(200, 170).pts({ P: Pa, Q: Qa, O, S, R: Ra }).seg("P-Q R-S P-S Q-R").lab("P:nw Q:ne O:e S:se R:sw");
  const S2 = [40, 40], R2 = [150, 40], P2 = [20, 150], Q2 = [170, 150], O2 = inter(S2, Q2, R2, P2);
  const fb = new Fig(200, 170).pts({ S: S2, R: R2, P: P2, Q: Q2, O: O2 }).seg2([10, 40], [190, 40]).seg2([10, 150], [190, 150]).seg("S-Q R-P").lab("S:n R:n P:s Q:s O:e");
  add("mb25-1:22", pair(fa, "(a)", fb, "(b)")); }

{ const f = new Fig(260, 120);
  f.path("M30 30A50 50 0 0 0 30 130Z".replace("Z", ""), null).path("M30 30V130").path("M230 30A50 50 0 0 1 230 130").path("M230 30V130");
  f.path("M30 30A50 50 0 0 1 80 80A50 50 0 0 1 30 130").path("M230 30A50 50 0 0 0 180 80A50 50 0 0 0 230 130");
  add("mb26-1:3", new Fig(200, 120).path("M50 20V100A40 40 0 0 0 50 20Z".replace("A40 40 0 0 0 50 20", "A40 40 0 0 0 50 20")).path("M130 20V100A40 40 0 0 1 130 20Z")
    .dot([90, 60]).path("M50 60H90", null, true).text(70, 54, "r", "small")); }

{ const O = [90, 95], r = 50, Pp = [250, 95], [Q, Rr] = tangents(Pp, O, r);
  add("mb26-1:12", new Fig(270, 175).pts({ O, P: Pp, Q, R: Rr }).circle("O", r).seg("O-Q O-R P-Q P-R Q-R").dot("O").ang("R", "O", "Q", "25°", 22).lab("O:w P:e Q:n R:s")); }

add("mb26-1:15", bpt(0.3, "A B C P Q"));

{ const O = [170, 95], r = 45, A = [20, 95], [Pp, Q] = tangents(A, O, r).map(t => ext(A, t, 40));
  const Rr = at(O, r, 180), Bp = inter(A, Pp, Rr, [Rr[0], 0]), Cp = inter(A, Q, Rr, [Rr[0], 200]);
  const fa = new Fig(260, 190).pts({ O, A, P: Pp, Q, R: Rr, B: Bp, C: Cp }).circle("O", r).seg("A-P A-Q B-C").dot("O").lab("O:e A:w P:ne Q:se R:w B:n C:s");
  const O2 = [70, 95], r2 = 45, B2 = at(O2, r2, 180), A2 = at(O2, r2, 0), T2 = [220, 95], P2 = tangents(T2, O2, r2)[0];
  const fb = new Fig(240, 190).pts({ O: O2, A: A2, B: B2, T: T2, P: P2 }).circle("O", r2).seg("B-T P-T B-P O-P").dot("O").lab("O:s A:s B:w T:e P:n");
  add("mb26-1:24", pair(fa, "(a)", fb, "(b)")); }

{ const A = [150, 20], B = [30, 190], C = [290, 190], Pp = lerp(B, C, 0.4), Rr = inter(A, B, Pp, [Pp[0] + (A[0] - C[0]), Pp[1] + (A[1] - C[1])]);
  const Q = inter(A, C, Rr, [Rr[0] + 10, Rr[1]]);
  add("mb26-1:25", new Fig(320, 210).pts({ A, B, C, P: Pp, Q, R: Rr }).poly("A B C").seg("R-Q R-P").lab("A:n B:sw C:se P:s Q:e R:w")); }

{ const B = [40, 180], A = [140, 20], C = [270, 180], E = lerp(B, C, 5 / 8), D = lerp(B, A, 5 / 8);
  add("mb26-2:3", new Fig(300, 200).pts({ A, B, C, D, E }).poly("A B C").seg("D-E").lab("A:n B:sw C:se D:w E:s")); }

{ const A = [150, 20], B = [30, 180], C = [290, 180], E = [200, 180], F = inter(A, B, E, [E[0] - (C[0] - A[0]), E[1] - (C[1] - A[1])]);
  const D = inter(B, C, F, [F[0] + (E[0] - A[0]), F[1] + (E[1] - A[1])]);
  const fa = new Fig(320, 200).pts({ A, B, C, D, E, F }).poly("A B C").seg("F-E F-D A-E").lab("A:n B:sw C:se D:s E:s F:nw");
  const A2 = [120, 20], B2 = [20, 180], C2 = [220, 180], D2 = lerp(A2, B2, 0.55), E2 = lerp(A2, C2, 0.55);
  const fb = new Fig(240, 200).pts({ A: A2, B: B2, C: C2, D: D2, E: E2 }).poly("A B C").seg("B-E C-D D-E").lab("A:n B:sw C:se D:w E:e");
  add("mb26-2:21", pair(fa, "(a)", fb, "(b)")); }

{ const O = [130, 95], r = 50, Pp = [130, 45], Q = [130, 145], [Cc, t1] = tanAt(O, r, 25, 10);
  const A = inter([0, 45], [10, 45], Cc, t1), Bb = inter([0, 145], [10, 145], Cc, t1);
  add("mb26-2:27", new Fig(270, 170).pts({ O, P: Pp, Q, C: Cc, A, B: Bb, X: [20, 45], Y: [250, 45], "X'": [20, 145], "Y'": [250, 145] })
    .circle("O", r).seg("X-Y X'-Y' A-B O-A O-B").dash("P-Q").dot("O").lab("O:w P:n Q:s C:e A:n B:s X:w Y:e X':w Y':e")); }

{ const O = [120, 100], r = 70, f = new Fig(240, 190).pts({ O, H: [50, 100], D: [190, 100], A: [50, 170], C: [190, 170], B: [120, 170] });
  f.circle("O", r).poly("H A C D").seg("H-D");
  for (const a of [45, 90, 135]) f.seg2(at(O, r, a), at(O, r, a + 180));
  f.pts({ F: at(O, r, 135), G: at(O, r, 90), E: at(O, r, 45) });
  add("mb26-2:Case study 3", f.dot("O").lab("O:ne H:w D:e A:sw C:se B:s F:nw G:n E:ne")); }

/* ================= Science ================= */
{ const f = new Fig(260, 190), lv = ["T1", "T2", "T3", "T4", "T5"];
  for (let i = 0; i < 5; i++) { const y = 170 - i * 32, w = 220 - i * 40; f.path(`M${130 - w / 2} ${y}h${w}l-20 -32h${-(w - 40)}Z`); f.text(130, y - 12, lv[i], "small"); }
  add("s26-1:6", f); }

{ const O = [140, 100], f = new Fig(280, 200).pts({ O, A: at(O, 110, 150), B: at(O, 100, -60), N1: [140, 10], N2: [140, 190] });
  f.seg2([20, 100], [260, 100]).dash("N1-N2").seg("A-O O-B").ang("O", "A", [20, 100], "30°", 30).ang("O", "B", "N2", "30°", 34)
    .text(40, 80, "Medium 1", "small").text(230, 125, "Medium 2", "small");
  add("s26-1:33", f.lab("A:nw O:ne B:s")); }

{ const f = new Fig(240, 190).pts({ A: [120, 30], B: [120, 170] });
  for (const y of [50, 100, 150]) { f.seg2([20, y], [220, y]).path(`M205 ${y - 5}l10 5l-10 5`); }
  f.seg("A-B").path("M114 60l6 -10l6 10", "thick").text(150, 112, "I", "small").text(215, 40, "B", "small");
  add("s26-1:39", f.lab("A:n B:s")); }

{ const f = new Fig(280, 140), c = [140, 125], r = 100;
  f.path(`M${c[0] - r} ${c[1]}A${r} ${r} 0 0 1 ${c[0] + r} ${c[1]}`);
  for (let i = 0; i <= 20; i++) { const a = 180 - i * 9, o = at(c, r, a), n = at(c, i % 10 === 0 ? r - 14 : i % 5 === 0 ? r - 10 : r - 6, a); f.seg2(o, n); }
  f.text(c[0] - r - 6, c[1] + 4, "0", "small").text(c[0], c[1] - r - 6, "1.5", "small").text(c[0] + r + 8, c[1] + 4, "3", "small");
  f.seg2(c, at(c, r - 18, 90 - 18), false).path(`M${c[0] - 4} ${c[1]}a4 4 0 1 0 8 0a4 4 0 1 0 -8 0`).text(c[0], c[1] - 30, "V", "small");
  add("s23-1:15", f); }

{ const ox = 50, oy = 170, f = axes(new Fig(260, 200), ox, oy, 30, 250, 10, 190), sx = 360, sy = 70; // 0.5 A → 180 px, 2 V → 140 px
  f.seg2([ox, oy], [ox + 0.5 * sx, oy - 2.0 * sy]);
  for (const [i, v] of [[0.1, 0.4], [0.2, 0.8], [0.3, 1.2], [0.4, 1.6]]) { f.dot([ox + i * sx, oy - v * sy]); }
  f.text(150, 194, "Current I (A) → 0 to 0.5", "small").text(20, 60, "V (volts)", "small");
  add("s20-1:23", f); }

{ // A–5 Ω–C, then 10 Ω ∥ 10 Ω between C and D, then D–5 Ω–B
  const res = (f, x, y, w) => f.path(`M${x} ${y}h${(w - 40) / 2}l4 -6l8 12l8 -12l8 12l8 -12l4 6h${(w - 40) / 2}`);
  const f = new Fig(330, 130).pts({ A: [20, 65], C: [90, 65], D: [210, 65], B: [310, 65] });
  res(f, 20, 65, 70);
  f.seg2([90, 35], [90, 95]).seg2([210, 35], [210, 95]);
  res(f, 90, 35, 120); res(f, 90, 95, 120);
  res(f, 210, 65, 100);
  f.text(55, 52, "5 Ω", "small").text(150, 22, "10 Ω", "small").text(150, 120, "10 Ω", "small").text(260, 52, "5 Ω", "small");
  add("s22-1:11", f.dot("A").dot("B").dot("C").dot("D").lab("A:w B:e C:nw D:ne")); }

{ const f = new Fig(300, 170);
  f.path("M30 40H270V140H30Z");
  f.path("M60 40l4 -6l8 12l8 -12l8 12l8 -12l4 6", "fillbg").text(80, 22, "lamp 20 Ω", "small");
  f.path("M150 40l4 -6l8 12l8 -12l8 12l8 -12l4 6", "fillbg").text(170, 22, "4 Ω", "small");
  f.path("M215 40a14 14 0 1 0 28 0a14 14 0 1 0 -28 0", "fillbg").text(229, 45, "A", "small");
  f.path("M140 130v20M150 134v12", "thick").text(145, 165, "6 V", "small");
  f.path("M60 140h0").text(70, 132, "( ) key", "small");
  add("s19-1:20", f); }

{ const f = new Fig(300, 170), P = [150, 85];
  f.path("M165 20A140 140 0 0 0 165 150", null).seg2([10, 85], [290, 85]).seg2([70, 85], [70, 45]).path("M64 51l6 -8l6 8")
    .seg2([70, 45], [151, 45]).seg2([70, 45], [150, 62])
    .text(70, 100, "A", "lab").text(70, 38, "B", "lab").text(150, 102, "P", "lab").text(205, 100, "F", "lab").text(260, 100, "C", "lab").dot([205, 85]).dot([260, 85]);
  add("s23-1:30", f.text(105, 38, "Ray 1", "small").text(100, 72, "Ray 2", "small")); }

/* ---------- write ---------- */
const body = Object.entries(FIGS).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(",\n");
fs.writeFileSync("src/figs.js", `/* Figures for past-paper questions, drawn by scripts/make-figs.js. Do not edit by hand: change the script and run it again.
   Each figure is attached to its question as it.fig, shown under the question text. Loads after papers.js. */
const FIGS = {
${body}
};
(function () {
  const css = \`
.fig { margin: 4px 0 2px; }
.fig svg { width: 100%; max-width: 340px; height: auto; display: block; color: var(--ink); }
.fig svg line, .fig svg path, .fig svg polygon, .fig svg circle, .fig svg polyline { stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.fig svg.wide { max-width: 560px; }
.fig svg .thin { stroke-width: 1; }
.fig svg .thick { stroke-width: 3; }
.fig svg .shade { fill: var(--accent-soft); }
.fig svg .eo { fill-rule: evenodd; }
.fig svg .dot { fill: currentColor; stroke: none; }
.fig svg .fillbg { fill: var(--surface); }
.fig svg text { fill: currentColor; stroke: none; font: 600 13px var(--body); text-anchor: middle; }
.fig svg text.small { font-weight: 400; font-size: 11px; }
.fig svg text.cap { font-weight: 600; font-size: 12px; }\`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
})();
PAPERS.forEach(p => p.sections.forEach(s => s.qs.forEach(it => {
  const f = FIGS[p.id + ":" + (it.n !== undefined ? it.n : it.title)];
  if (f) it.fig = f;
})));
const figHtml = q => q && q.fig ? \`<div class="fig">\${q.fig}</div>\` : "";
`);
console.log("Wrote src/figs.js with", Object.keys(FIGS).length, "figures");
