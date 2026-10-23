/* JEE Foundation: more stretch problems on Class 10 chapters, a Class 11 bridge set, subject filters and a
   solved tracker. Loads after app.js. */
JEE_FOUNDATION.push(
  { area: "Maths", topic: "Polynomials", q: "If α and β are the zeroes of x² − 5x + 6, find α³ + β³ without finding the zeroes.", a: "α + β = 5, αβ = 6.\nα³ + β³ = (α + β)³ − 3αβ(α + β) = 125 − 3 × 6 × 5 = 125 − 90 = 35." },
  { area: "Maths", topic: "Polynomials", q: "The zeroes of x³ − 3x² + x + 1 are a − b, a and a + b. Find a and b.", a: "Sum of zeroes = 3a = 3, so a = 1.\nProduct = (a − b) a (a + b) = a(a² − b²) = −1 ⇒ 1 − b² = −1 ⇒ b² = 2, b = ±√2." },
  { area: "Maths", topic: "Quadratic Equations", q: "For what values of k does kx² + 4x + 1 = 0 have two distinct real roots?", a: "Need k ≠ 0 (quadratic) and D > 0: 16 − 4k > 0 ⇒ k < 4.\nAnswer: k < 4, k ≠ 0." },
  { area: "Maths", topic: "Quadratic Equations", q: "A train covers 360 km at a uniform speed. Had the speed been 5 km/h more, it would have taken 1 hour less. Find its speed.", a: "360/x − 360/(x + 5) = 1 ⇒ 1800 = x(x + 5) ⇒ x² + 5x − 1800 = 0 ⇒ (x + 45)(x − 40) = 0.\nSpeed = 40 km/h." },
  { area: "Maths", topic: "Arithmetic Progressions", q: "Find the sum of all three-digit numbers divisible by 7.", a: "First 105, last 994, d = 7. n = (994 − 105)/7 + 1 = 128.\nSum = 128/2 × (105 + 994) = 64 × 1099 = 70,336." },
  { area: "Maths", topic: "Arithmetic Progressions", q: "How many terms of the AP 54, 51, 48, … must be taken so that their sum is 513? Explain the double answer.", a: "n/2 [108 − 3(n − 1)] = 513 ⇒ n(111 − 3n) = 1026 ⇒ n² − 37n + 342 = 0 ⇒ n = 18 or 19.\nBoth work because the 19th term is 54 − 18 × 3 = 0, which adds nothing to the sum." },
  { area: "Maths", topic: "Coordinate Geometry", q: "Find the point on the x-axis that is equidistant from (2, −5) and (−2, 9).", a: "Let it be (x, 0). (x − 2)² + 25 = (x + 2)² + 81 ⇒ −4x + 29 = 4x + 85 ⇒ x = −7.\nPoint: (−7, 0)." },
  { area: "Maths", topic: "Coordinate Geometry", q: "In what ratio does the y-axis divide the join of (5, −6) and (−1, −4)? Find the point.", a: "Let the ratio be k : 1. x = (−k + 5)/(k + 1) = 0 ⇒ k = 5, ratio 5 : 1.\ny = (5 × (−4) + (−6))/6 = −26/6 = −13/3. Point (0, −13/3)." },
  { area: "Maths", topic: "Trigonometry", q: "If sin θ + cos θ = √2 cos θ, show that cos θ − sin θ = √2 sin θ.", a: "sin θ = (√2 − 1) cos θ ⇒ cos θ = sin θ/(√2 − 1) = (√2 + 1) sin θ (rationalise).\nSo cos θ − sin θ = √2 sin θ." },
  { area: "Maths", topic: "Trigonometry", q: "Prove that sin⁴θ − cos⁴θ = 1 − 2cos²θ.", a: "sin⁴θ − cos⁴θ = (sin²θ − cos²θ)(sin²θ + cos²θ) = sin²θ − cos²θ = (1 − cos²θ) − cos²θ = 1 − 2cos²θ." },
  { area: "Maths", topic: "Heights and Distances", q: "The angles of elevation of the top of a tower from two points at distances a and b from its base, on the same line, are complementary. Prove that the height is √(ab).", a: "tan θ = h/a and tan(90° − θ) = cot θ = h/b.\nMultiplying: tan θ × cot θ = h²/(ab) = 1 ⇒ h = √(ab)." },
  { area: "Maths", topic: "Real Numbers", q: "The LCM of two numbers is 14 times their HCF, and LCM + HCF = 600. If one number is 280, find the other.", a: "L = 14H, 15H = 600 ⇒ H = 40, L = 560.\nOther number = HCF × LCM / 280 = 40 × 560/280 = 80." },
  { area: "Maths", topic: "Probability", q: "Two dice are thrown. Find the probability that the sum is a prime number.", a: "Prime sums: 2 (1 way), 3 (2), 5 (4), 7 (6), 11 (2) = 15 outcomes.\nP = 15/36 = 5/12." },
  { area: "Maths", topic: "Bridge: Sets", q: "In a class of 40, 25 like cricket, 20 like football and 10 like both. How many like neither?", a: "n(C ∪ F) = 25 + 20 − 10 = 35.\nNeither = 40 − 35 = 5." },
  { area: "Physics", topic: "Electricity", q: "Five resistors of 1/5 Ω each are connected first all in series and then all in parallel. Find the ratio of maximum to minimum resistance.", a: "Series: 5 × 1/5 = 1 Ω. Parallel: (1/5)/5 = 1/25 Ω.\nRatio = 1 ÷ 1/25 = 25 : 1." },
  { area: "Physics", topic: "Electricity", q: "Bulbs rated 100 W, 220 V and 60 W, 220 V are joined in series across 220 V. Which glows brighter?", a: "R = V²/P: 100 W bulb 484 Ω, 60 W bulb ≈ 807 Ω.\nIn series the current is the same, so P = I²R is larger for the larger resistance. The 60 W bulb glows brighter." },
  { area: "Physics", topic: "Electricity", q: "A wire of resistance R is stretched to twice its length. What is its new resistance?", a: "Volume stays the same, so doubling the length halves the area.\nR = ρl/A becomes ρ(2l)/(A/2) = 4R." },
  { area: "Physics", topic: "Electricity", q: "How many 40 W, 220 V bulbs can be used safely on a 220 V line with a 5 A fuse?", a: "Maximum power = 220 × 5 = 1100 W.\n1100/40 = 27.5, so 27 bulbs." },
  { area: "Physics", topic: "Light", q: "An object is 20 cm in front of a convex mirror of radius of curvature 30 cm. Find the image position, nature and magnification.", a: "f = +15 cm, u = −20 cm. 1/v = 1/f − 1/u = 1/15 + 1/20 = 7/60 ⇒ v ≈ +8.6 cm (behind the mirror).\nm = −v/u ≈ +0.43: virtual, erect, diminished." },
  { area: "Physics", topic: "Light", q: "A convex lens of focal length 25 cm and a concave lens of focal length 10 cm are placed in contact. Find the power and nature of the combination.", a: "P = 1/0.25 + 1/(−0.10) = 4 − 10 = −6 D.\nf = −1/6 m ≈ −16.7 cm: the combination is diverging." },
  { area: "Physics", topic: "Bridge: Motion", q: "A car speeds up uniformly from 18 km/h to 36 km/h in 5 s. Find the acceleration and the distance covered.", a: "u = 5 m/s, v = 10 m/s. a = (10 − 5)/5 = 1 m/s².\ns = ut + ½at² = 25 + 12.5 = 37.5 m." },
  { area: "Physics", topic: "Bridge: Motion", q: "A ball is thrown straight up at 20 m/s. Taking g = 10 m/s², find the maximum height and the total time in the air.", a: "At the top v = 0: h = u²/2g = 400/20 = 20 m.\nTime up = u/g = 2 s, so total time = 4 s." },
  { area: "Physics", topic: "Bridge: Units and dimensions", q: "Write the dimensions of force and work, and check that E = mc² is dimensionally correct.", a: "Force = mass × acceleration: [MLT⁻²]. Work = force × distance: [ML²T⁻²].\nmc² = [M][LT⁻¹]² = [ML²T⁻²], the same as energy, so the equation is dimensionally correct." },
  { area: "Chemistry", topic: "Mole concept (bridge)", q: "How many molecules are present in 9 g of water?", a: "Molar mass of H₂O = 18 g/mol, so 9 g = 0.5 mol.\nMolecules = 0.5 × 6.022 × 10²³ = 3.011 × 10²³." },
  { area: "Chemistry", topic: "Mole concept (bridge)", q: "Find the mass of 0.2 mol of sodium carbonate (Na₂CO₃).", a: "Molar mass = 2 × 23 + 12 + 3 × 16 = 106 g/mol.\nMass = 0.2 × 106 = 21.2 g." },
  { area: "Chemistry", topic: "Mole concept (bridge)", q: "4 g of hydrogen reacts with 16 g of oxygen: 2H₂ + O₂ → 2H₂O. Which reactant is limiting and how much water forms?", a: "H₂: 4/2 = 2 mol; O₂: 16/32 = 0.5 mol. 2 mol H₂ would need 1 mol O₂, so O₂ is limiting.\n0.5 mol O₂ gives 1 mol H₂O = 18 g." },
  { area: "Chemistry", topic: "Chemical Reactions", q: "Balance: Al + O₂ → Al₂O₃.", a: "4Al + 3O₂ → 2Al₂O₃ (4 Al and 6 O on each side)." },
  { area: "Chemistry", topic: "Stoichiometry (bridge)", q: "A compound has 40% carbon, 6.67% hydrogen and 53.3% oxygen by mass. Find its empirical formula.", a: "Moles in 100 g: C 40/12 = 3.33, H 6.67/1 = 6.67, O 53.3/16 = 3.33.\nDivide by 3.33: 1 : 2 : 1. Empirical formula CH₂O." },
  { area: "Chemistry", topic: "Acids, Bases and Salts", q: "What volume of 0.1 M NaOH neutralises 20 mL of 0.2 M HCl?", a: "Moles of HCl = 0.2 × 0.020 = 0.004 mol; NaOH needed is also 0.004 mol.\nVolume = 0.004/0.1 = 0.04 L = 40 mL." },
  { area: "Chemistry", topic: "Carbon Compounds", q: "How many structural isomers do butane (C₄H₁₀) and pentane (C₅H₁₂) have? Name them.", a: "C₄H₁₀: 2 (n-butane, isobutane or 2-methylpropane).\nC₅H₁₂: 3 (n-pentane, isopentane or 2-methylbutane, neopentane or 2,2-dimethylpropane)." },
  { area: "Chemistry", topic: "Atomic structure (bridge)", q: "An element has atomic number 17. Write its electronic configuration, valency and the kind of ion it forms.", a: "2, 8, 7. It needs one electron to complete its octet, so valency 1. It forms an anion with charge −1 (it is chlorine, Cl⁻)." },
  { area: "Chemistry", topic: "Acids, Bases and Salts", q: "In the chlor-alkali process, name the products at the anode, at the cathode and near the cathode.", a: "2NaCl (aq) + 2H₂O (l) → 2NaOH (aq) + Cl₂ (g) + H₂ (g)\nAnode: chlorine gas. Cathode: hydrogen gas. Near the cathode: sodium hydroxide solution." }
);

let jeeDone = store.get("jeeDone", {});
let jeeArea = "All";

pageJee = function () {
  const areas = ["All", "Maths", "Physics", "Chemistry"];
  const items = JEE_FOUNDATION.map((q, i) => ({ q, i })).filter(x => jeeArea === "All" || x.q.area === jeeArea);
  const done = JEE_FOUNDATION.filter((q, i) => jeeDone[i]).length;
  return `
  <div class="head"><div><h1>JEE Foundation</h1><p>A second track for the same student. Light until the boards (2–3 hours a week), then the main track from April 2027. It never replaces a board chapter in the daily plan.</p></div></div>
  <div class="grid g3">
    <div class="card stack"><span class="label">Now to Feb 2027</span><h3>Stretch problems</h3><p class="muted">Multi-step problems on Class 10 chapters that JEE builds on. Two or three a week, after the board work is done.</p></div>
    <div class="card stack"><span class="label">Apr to May 2027</span><h3>Bridge set</h3><p class="muted">Problems marked "Bridge" preview Class 11: motion, units and dimensions, sets, the mole concept and stoichiometry.</p></div>
    <div class="card stack"><span class="label">Solved</span><h3>${done} of ${JEE_FOUNDATION.length}</h3>${bar(pct(done, JEE_FOUNDATION.length))}<p class="muted" style="font-size:.88rem">Try each one on paper before opening the solution, then tick it.</p></div>
  </div>
  <div class="row">${areas.map(a => `<button class="pill" data-act="jee-area" data-v="${a}" aria-pressed="${a === jeeArea}">${a}</button>`).join("")}</div>
  <div class="stack">${items.map(({ q, i }) => `<div class="card q-card"><div class="row spread"><span class="label">${esc(q.area)} · ${esc(q.topic)}</span><label class="row muted" style="font-size:.88rem;gap:6px"><input type="checkbox" data-act="jee-done" data-v="${i}" ${jeeDone[i] ? "checked" : ""}> Solved</label></div><p class="q"><span class="qnum">J${i + 1}.</span> ${esc(q.q)}</p><details><summary>Solution</summary><div class="solution">${esc(q.a)}</div></details></div>`).join("")}</div>`;
};

view.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  if (el.dataset.act === "jee-area") { jeeArea = el.dataset.v; render(); }
  else if (el.dataset.act === "jee-done") { const i = el.dataset.v; if (el.checked) jeeDone[i] = 1; else delete jeeDone[i]; store.set("jeeDone", jeeDone); render(); }
});
