/* Solved paper: CBSE Class X Mathematics Basic (241), Term 2 board exam 2022, set 430/1/1. CBSE did not publish a marking scheme for this exam; answers and mark splits are our own, following the usual CBSE pattern. */
PAPERS.push({
  id: "mb22-1", subj: "maths", course: "Basic (241)", year: 2022, exam: "Term 2 board exam (May 2022)", set: "430/1/1", order: 2,
  marks: 40, mins: 120,
  qp: "question-paper/2022/X/Math_B.zip", ms: "",
  note: "In 2022 the board exam was split into two terms. This Term 2 paper covered only half the syllabus: 14 written questions, 40 marks, 2 hours, no MCQs. CBSE did not publish a marking scheme, so these answers and mark splits are our own. Q8 (constructions) is no longer in the syllabus; it is kept for completeness.",
  advice: "1. Every question here is a standard textbook type. Use it to practise writing complete steps.\n2. Nature of roots (Q3a): calculate D and state the conclusion in words.\n3. Median (Q7): build the cumulative frequency column first; it shows the median class immediately.\n4. In Q9, multiply tan 60° and tan 30° to get 1. Look for such shortcuts in 'prove that' questions.\n5. Case study Q14: the same point A gives two angles. Find the distance from the lower point first, then use it for the top.",
  sections: [
    { name: "Section A · Short answers (2 marks each)", qs: [
      { n: "1", ch: "ap", marks: 2, q: "(a) In an AP, if a = 50, d = −4 and Sₙ = 0, then find the value of n.\nOR\n(b) Find the sum of the first twelve 2-digit multiples of 7, using an AP.",
        ans: "(a) Sₙ = (n/2)[2 × 50 + (n − 1)(−4)] = 0\n(n/2)(104 − 4n) = 0\nn ≠ 0, so 104 − 4n = 0 and n = 26.\nOR\n(b) The 2-digit multiples of 7: 14, 21, 28, … with a = 14, d = 7, n = 12.\nS₁₂ = (12/2)[2 × 14 + 11 × 7] = 6 × (28 + 77) = 6 × 105 = 630",
        pts: [["(a) Sum formula = 0 (or (b) a = 14, d = 7)", "1"], ["(a) n = 26 (or (b) 630)", "1"]] },
      { n: "2", ch: "solids", marks: 2, q: "A solid metallic sphere of radius 3 cm is melted and recast into the shape of a solid cylinder of radius 2 cm. Find the height of the cylinder.",
        ans: "Volume of sphere = volume of cylinder\n(4/3)π × 3³ = π × 2² × h\n36π = 4πh\nh = 9 cm",
        pts: [["Equating volumes", "1"], ["h = 9 cm", "1"]] },
      { n: "3", ch: "quad", marks: 2, q: "(a) Find the nature of the roots of the quadratic equation x² − 5x + 9 = 0.\nOR\n(b) Write a quadratic equation with roots −3 and 5.",
        ans: "(a) D = b² − 4ac = 25 − 36 = −11\nD < 0, so the equation has no real roots.\nOR\n(b) Sum of roots = −3 + 5 = 2; product = −15.\nx² − (sum)x + product = 0: x² − 2x − 15 = 0",
        pts: [["(a) D = −11 (or (b) sum and product)", "1"], ["(a) No real roots (or (b) x² − 2x − 15 = 0)", "1"]] },
      { n: "4", ch: "stats", marks: 2, q: "Find the mode of the following frequency distribution:\nClass: 0–20, 20–40, 40–60, 60–80, 80–100\nFrequency: 8, 7, 12, 5, 3",
        ans: "Modal class = 40–60 (highest frequency 12).\nl = 40, f₁ = 12, f₀ = 7, f₂ = 5, h = 20\nMode = 40 + [(12 − 7)/(24 − 7 − 5)] × 20 = 40 + (5/12) × 20 = 40 + 8.33 = 48.33",
        pts: [["Modal class and values", "1"], ["Mode ≈ 48.33", "1"]] },
      { n: "5", ch: "quad", marks: 2, q: "Solve the quadratic equation 2x² − 5x − 1 = 0 for x.",
        ans: "a = 2, b = −5, c = −1\nD = 25 + 8 = 33\nx = (5 ± √33)/4",
        pts: [["D = 33", "1"], ["x = (5 ± √33)/4", "1"]] },
      { n: "6", ch: "circles", marks: 2, q: "In Figure 1, if tangents PA and PB drawn from a point P to a circle with centre O, are inclined to each other at an angle of 70°, then find the measure of ∠POA.",
        ans: "OP bisects ∠APB, so ∠APO = 35°.\n∠OAP = 90° (radius ⊥ tangent).\nIn ΔOAP: ∠POA = 180° − 90° − 35° = 55°",
        pts: [["∠APO = 35°, ∠OAP = 90°", "1"], ["∠POA = 55°", "1"]] }
    ] },
    { name: "Section B · Short answers (3 marks each)", qs: [
      { n: "7", ch: "stats", marks: 3, q: "The frequency distribution below shows the weight of 40 students of a class. Find the median weight of the students.\nWeight (kg): 40–45, 45–50, 50–55, 55–60, 60–65, 65–70\nNumber of students: 9, 5, 8, 9, 6, 3",
        ans: "Cumulative frequencies: 9, 14, 22, 31, 37, 40 (N = 40)\nN/2 = 20, which falls in cf 22: median class = 50–55.\nl = 50, cf = 14, f = 8, h = 5\nMedian = 50 + [(20 − 14)/8] × 5 = 50 + 3.75 = 53.75 kg",
        pts: [["cf column and median class", "1"], ["Formula substitution", "1"], ["53.75 kg", "1"]] },
      { n: "8", ch: "circles", marks: 3, q: "(a) Draw a circle of radius 4 cm. Construct a pair of tangents to the circle from a point 6 cm away from its centre.\nOR\n(b) Draw a line segment PQ = 7.5 cm. Divide it in the ratio 3 : 1.",
        ans: "(a) 1. Draw a circle with centre O and radius 4 cm. Mark P with OP = 6 cm.\n2. Bisect OP at M. With centre M and radius MO, draw a circle cutting the given circle at A and B.\n3. Join PA and PB: these are the required tangents (each √(36 − 16) = √20 ≈ 4.5 cm).\nJustification: ∠OAP = 90° (angle in a semicircle), so PA ⊥ OA.\nOR\n(b) 1. Draw PQ = 7.5 cm. Draw a ray PX making an acute angle with PQ.\n2. Mark 4 (= 3 + 1) equal arcs on PX: A₁, A₂, A₃, A₄.\n3. Join A₄Q. Through A₃ draw a line parallel to A₄Q, meeting PQ at R.\n4. Then PR : RQ = 3 : 1 (PR ≈ 5.6 cm, RQ ≈ 1.9 cm), by the basic proportionality theorem.",
        pts: [["First step", "1"], ["Construction", "1"], ["Final lines / justification", "1"]], tip: "Constructions were dropped from the syllabus after 2022. Skip this one if you are short of time." },
      { n: "9", ch: "heights", marks: 3, q: "In Figure 2, the angles of elevation of the top of a tower AB of height h m, from two points P and Q at a distance of x m and y m from the base of the tower respectively and in the same straight line with it, are 60° and 30°, respectively. Prove that h² = xy.",
        ans: "In ΔBAP: tan 60° = h/x … (i)\nIn ΔBAQ: tan 30° = h/y … (ii)\nMultiply (i) and (ii): tan 60° × tan 30° = h²/(xy)\n√3 × (1/√3) = 1 = h²/(xy)\nSo h² = xy.",
        pts: [["tan 60° = h/x", "1"], ["tan 30° = h/y", "1"], ["Multiplying to get h² = xy", "1"]] },
      { n: "10", ch: "stats", marks: 3, q: "The following table shows the age of patients admitted in a hospital during a particular week:\nAge (years): 5–15, 15–25, 25–35, 35–45, 45–55, 55–65\nNumber of patients: 5, 12, 20, 24, 15, 4\nFind the mean age of the patients.",
        ans: "Mid-points xᵢ: 10, 20, 30, 40, 50, 60\nfᵢxᵢ: 50, 240, 600, 960, 750, 240\nΣfᵢ = 80, Σfᵢxᵢ = 2840\nMean = 2840/80 = 35.5 years",
        pts: [["Table with xᵢ and fᵢxᵢ", "1"], ["Σfᵢxᵢ = 2840", "1"], ["Mean = 35.5 years", "1"]] }
    ] },
    { name: "Section C · Long answers and case studies (4 marks each)", qs: [
      { n: "11", ch: "solids", marks: 4, q: "(a) A spherical glass vessel has a cylindrical neck 8 cm long and 1 cm in radius. The radius of the spherical part is 9 cm. Find the amount of water (in litres) it can hold, when filled completely.\nOR\n(b) From a solid cylinder, whose height is 2.4 cm and diameter 1.4 cm, a conical cavity of the same height and same diameter is hollowed out. Find the total surface area of the remaining solid.",
        ans: "(a) Volume of sphere = (4/3)π × 9³ = 972π cm³\nVolume of neck = π × 1² × 8 = 8π cm³\nTotal = 980π = 980 × 22/7 = 3080 cm³ = 3.08 litres\nOR\n(b) r = 0.7 cm, h = 2.4 cm, slant l = √(2.4² + 0.7²) = √6.25 = 2.5 cm\nTSA = CSA of cylinder + top base + CSA of cone\n= 2πrh + πr² + πrl = πr(2h + r + l)\n= (22/7) × 0.7 × (4.8 + 0.7 + 2.5) = 2.2 × 8 = 17.6 cm²",
        pts: [["(a) Sphere volume (or (b) slant height 2.5)", "1"], ["(a) Neck volume (or (b) TSA expression)", "1"], ["(a) 3080 cm³ (or (b) substitution)", "1"], ["(a) 3.08 litres (or (b) 17.6 cm²)", "1"]] },
      { n: "12", ch: "circles", marks: 4, q: "In Figure 3, the tangent l is parallel to the tangent m drawn at points A and B respectively to a circle centred at O. PQ is a tangent to the circle at R [Q on l, P on m]. Prove that ∠POQ = 90°.",
        ans: "Join OR. Since l ∥ m, AB is a diameter through O.\nIn ΔOAQ and ΔORQ: OA = OR (radii), QA = QR (tangents from Q), OQ common. So ΔOAQ ≅ ΔORQ (SSS) and ∠AOQ = ∠ROQ … (i)\nSimilarly ΔOBP ≅ ΔORP, so ∠BOP = ∠ROP … (ii)\nAOB is a straight line: ∠AOQ + ∠ROQ + ∠ROP + ∠BOP = 180°\nUsing (i) and (ii): 2∠ROQ + 2∠ROP = 180°\n∠ROQ + ∠ROP = 90°, i.e. ∠POQ = 90°.",
        pts: [["Join OR; AB a diameter", "1"], ["ΔOAQ ≅ ΔORQ", "1"], ["ΔOBP ≅ ΔORP", "1"], ["∠POQ = 90°", "1"]] },
      { n: "13", ch: "ap", marks: 4, q: "Case Study 1: Old clothes thrown as waste fill landfill sites and produce harmful greenhouse gas, so it is important to reuse them. A footmat (rug) made out of old t-shirt yarn has stitches in circular rows making a pattern: 6, 12, 18, 24, …\n(a) Check whether the given pattern forms an AP. If yes, find the common difference and the next term of the AP. (2)\n(b) Write the nth term of the AP. Hence, find the number of stitches in the 10th circular row. (2)",
        ans: "(a) 12 − 6 = 18 − 12 = 24 − 18 = 6. The difference is constant, so it is an AP with d = 6. Next term = 24 + 6 = 30.\n(b) aₙ = 6 + (n − 1) × 6 = 6n\na₁₀ = 60 stitches",
        pts: [["(a) Constant difference d = 6", "1"], ["(a) Next term 30", "1"], ["(b) aₙ = 6n", "1"], ["(b) 60 stitches", "1"]] },
      { n: "14", ch: "heights", marks: 4, q: "Case Study 2: The TV Tower at Pitampura, Delhi stands vertically on the ground. From a point A on the ground, the angle of elevation of the top of the tower (point B) is 60°. There is a point C on the tower which is 78 m (approx.) above the ground. The angle of elevation of the point C from point A is found to be 30°.\n(a) Draw a well-labelled figure, based on the information given above. (2)\n(b) Find the height of the tower and the distance of the tower from point A. (2)",
        ans: "(a) [Figure: tower DB standing at D on the ground; C on DB with DC = 78 m; point A on the ground with AD = x. Join AB (60° with the ground) and AC (30°).]\n(b) In ΔADC: tan 30° = 78/x, so x = 78√3 m ≈ 78 × 1.73 = 134.94 m.\nIn ΔADB: tan 60° = DB/x, so DB = √3 × 78√3 = 234 m.\nHeight of the tower = 234 m; distance from A = 78√3 ≈ 134.94 m.",
        pts: [["(a) Labelled figure", "2"], ["(b) Distance 78√3 m", "1"], ["(b) Height 234 m", "1"]], tip: "The real Pitampura TV tower is about 235 m tall, so the answer is a good sanity check." }
    ] }
  ]
});
