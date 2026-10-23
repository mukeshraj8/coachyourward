/* Question bank, batch 1: week 1 chapters of the study plan. Adds assertion-reason MCQs and case studies. */
const AR = ["Both A and R are true, and R is the correct explanation of A", "Both A and R are true, but R is not the correct explanation of A", "A is true, but R is false", "A is false, but R is true"];
const addTo = (subj, key, items) => SUBJECTS[subj][key].push(...items);

addTo("maths", "mcq", [
  { ch: "real", q: "The LCM of two numbers is 182 and their HCF is 13. If one number is 26, the other is", o: ["13", "91", "182", "52"], a: 1, e: "Other = (13 × 182)/26 = 91." },
  { ch: "real", q: "The exponent of 2 in the prime factorisation of 144 is", o: ["2", "3", "4", "5"], a: 2, e: "144 = 2⁴ × 3²." },
  { ch: "real", q: "For a natural number n, 4ⁿ can never end with the digit", o: ["4", "6", "0", "none of these"], a: 2, e: "4ⁿ = 2²ⁿ has no factor 5, so it cannot end in 0." },
  { ch: "real", q: "The HCF of the smallest prime number and the smallest composite number is", o: ["1", "2", "4", "8"], a: 1, e: "HCF(2, 4) = 2." },
  { ch: "real", q: "Assertion (A): 12ⁿ cannot end with the digit 0 for any natural number n. Reason (R): A number ends with 0 only if its prime factorisation contains both 2 and 5.", o: AR, a: 0, e: "12ⁿ = 2²ⁿ × 3ⁿ has no 5, so R explains A." },
  { ch: "real", q: "Assertion (A): √5 is irrational. Reason (R): The square root of a prime number is irrational.", o: AR, a: 0, e: "5 is prime, so R explains A." },
  { ch: "poly", q: "If 1 is a zero of x² − 4x + k, then k =", o: ["3", "−3", "4", "5"], a: 0, e: "1 − 4 + k = 0 ⇒ k = 3." },
  { ch: "poly", q: "If α, β are the zeroes of x² − 5x + 6, then 1/α + 1/β =", o: ["5/6", "6/5", "−5/6", "1/6"], a: 0, e: "(α + β)/αβ = 5/6." },
  { ch: "poly", q: "A polynomial whose graph does not meet the x-axis has", o: ["one zero", "two zeroes", "no real zero", "infinitely many zeroes"], a: 2, e: "Zeroes are where the graph meets the x-axis." },
  { ch: "poly", q: "If the zeroes of x² + (a + 1)x + b are 2 and −3, then", o: ["a = 0, b = −6", "a = −7, b = −1", "a = 5, b = −1", "a = 0, b = 6"], a: 0, e: "Sum −1 = −(a + 1) ⇒ a = 0; product −6 = b." },
  { ch: "poly", q: "Assertion (A): x² + 4x + 5 has two real zeroes. Reason (R): A quadratic polynomial can have at most two zeroes.", o: AR, a: 3, e: "D = 16 − 20 < 0, so no real zeroes: A false, R true." },
  { ch: "poly", q: "Assertion (A): The sum of the zeroes of 3x² − 6x + 1 is 2. Reason (R): Sum of zeroes = −b/a.", o: AR, a: 0, e: "−(−6)/3 = 2; R explains A." },
  { ch: "linear", q: "The pair x + 2y = 3 and 2x + 4y = 7 has", o: ["a unique solution", "no solution", "infinitely many solutions", "exactly two solutions"], a: 1, e: "1/2 = 2/4 ≠ 3/7: parallel lines." },
  { ch: "linear", q: "2x + 3y = 7 and 4x + ky = 14 have infinitely many solutions when k =", o: ["3", "6", "7", "14"], a: 1, e: "2/4 = 3/k = 7/14 ⇒ k = 6." },
  { ch: "linear", q: "The lines x = 2 and y = 3 intersect at", o: ["(3, 2)", "(2, 3)", "(0, 0)", "(2, 0)"], a: 1, e: "x = 2 and y = 3 together." },
  { ch: "linear", q: "If x = a, y = b solves x − y = 2 and x + y = 4, then", o: ["a = 3, b = 1", "a = 1, b = 3", "a = 2, b = 2", "a = 4, b = 0"], a: 0, e: "Adding: 2x = 6 ⇒ x = 3, y = 1." },
  { ch: "linear", q: "Assertion (A): 3x + 4y = 10 and 6x + 8y = 25 represent parallel lines. Reason (R): If a₁/a₂ = b₁/b₂ ≠ c₁/c₂, the lines are parallel.", o: AR, a: 0, e: "3/6 = 4/8 ≠ 10/25; R explains A." }
]);
addTo("maths", "written", [
  { ch: "real", marks: 3, q: "Find the HCF and LCM of 510 and 92 and verify that HCF × LCM = product of the two numbers.",
    a: "510 = 2 × 3 × 5 × 17\n92 = 2² × 23\nHCF = 2\nLCM = 2² × 3 × 5 × 17 × 23 = 23460\nHCF × LCM = 2 × 23460 = 46920\n510 × 92 = 46920 ✓",
    points: [["Prime factorisations", 1], ["HCF and LCM", 1], ["Verification", 1]] },
  { ch: "real", marks: 4, q: "Case study: A sweet-seller has 420 kaju barfis and 130 badam barfis. She stacks them so each stack has the same number of barfis of one kind only, using the least tray area. (i) How many barfis go in each stack? (1) (ii) How many stacks are there in all? (1) (iii) Find the LCM of 420 and 130. (2)",
    a: "(i) Barfis per stack = HCF(420, 130). 420 = 2² × 3 × 5 × 7, 130 = 2 × 5 × 13, so HCF = 2 × 5 = 10.\n(ii) Kaju stacks = 42, badam stacks = 13, total = 55.\n(iii) LCM = 2² × 3 × 5 × 7 × 13 = 5460.",
    points: [["(i) HCF = 10", 1], ["(ii) 55 stacks", 1], ["(iii) factorisation", 1], ["(iii) LCM = 5460", 1]] },
  { ch: "poly", marks: 3, q: "If α and β are the zeroes of 2x² − 5x + 3, find α² + β².",
    a: "α + β = 5/2, αβ = 3/2\nα² + β² = (α + β)² − 2αβ\n= 25/4 − 3\n= 13/4",
    points: [["Sum and product", 1], ["Identity used", 1], ["Answer 13/4", 1]] },
  { ch: "poly", marks: 4, q: "Case study: The arch of a bridge follows p(x) = −x² + 2x + 8, where x is in metres. (i) Find the zeroes of p(x). (2) (ii) Find the sum and product of the zeroes. (1) (iii) Does the graph open upward or downward? Why? (1)",
    a: "(i) −x² + 2x + 8 = 0 ⇒ x² − 2x − 8 = 0 ⇒ (x − 4)(x + 2) = 0 ⇒ x = 4, −2.\n(ii) Sum = 2, product = −8.\n(iii) Downward, because the coefficient of x² is negative.",
    points: [["(i) factorisation", 1], ["(i) zeroes 4 and −2", 1], ["(ii) sum and product", 1], ["(iii) downward with reason", 1]] },
  { ch: "linear", marks: 3, q: "Five years hence, Jacob's age will be three times his son's. Five years ago, Jacob's age was seven times his son's. Find their present ages.",
    a: "Let Jacob's age be x and his son's age be y.\nx + 5 = 3(y + 5) ⇒ x − 3y = 10 ... (1)\nx − 5 = 7(y − 5) ⇒ x − 7y = −30 ... (2)\n(1) − (2): 4y = 40 ⇒ y = 10, x = 40\nJacob is 40 years and his son is 10 years old.",
    points: [["Two equations formed", 1], ["Solved correctly", 1], ["Answer stated", 1]] },
  { ch: "linear", marks: 4, q: "Case study: A family pays ₹1200 for 2 adult and 3 child tickets. Another family pays ₹1300 for 3 adult and 2 child tickets. (i) Write the pair of equations. (1) (ii) Find the cost of one adult plus one child ticket. (1) (iii) Find each ticket's price. (2)",
    a: "(i) 2a + 3c = 1200, 3a + 2c = 1300\n(ii) Adding: 5a + 5c = 2500 ⇒ a + c = 500\n(iii) Subtracting: a − c = 100. So a = 300, c = 200.\nAdult ticket ₹300, child ticket ₹200.",
    points: [["(i) equations", 1], ["(ii) a + c = 500", 1], ["(iii) a − c = 100", 1], ["(iii) ₹300 and ₹200", 1]] }
]);

addTo("science", "mcq", [
  { ch: "reactions", q: "Which of these is a redox reaction?", o: ["NaOH + HCl → NaCl + H₂O", "CuO + H₂ → Cu + H₂O", "CaCO₃ → CaO + CO₂", "AgNO₃ + NaCl → AgCl + NaNO₃"], a: 1, e: "CuO is reduced to Cu while H₂ is oxidised to H₂O." },
  { ch: "reactions", q: "The gas evolved when zinc reacts with dilute sulphuric acid is", o: ["oxygen", "hydrogen", "sulphur dioxide", "carbon dioxide"], a: 1, e: "Zn + H₂SO₄ → ZnSO₄ + H₂." },
  { ch: "reactions", q: "Silver chloride turns grey in sunlight because it", o: ["absorbs light", "decomposes into silver and chlorine", "reacts with oxygen", "melts"], a: 1, e: "2AgCl → 2Ag + Cl₂ (photolytic decomposition)." },
  { ch: "reactions", q: "BaCl₂ + Na₂SO₄ → BaSO₄ + 2NaCl is a", o: ["combination reaction", "decomposition reaction", "double displacement reaction", "redox reaction"], a: 2, e: "Ions are exchanged and a white precipitate of BaSO₄ forms." },
  { ch: "reactions", q: "In the electrolysis of water, the volumes of hydrogen and oxygen are in the ratio", o: ["1 : 2", "2 : 1", "1 : 1", "1 : 8"], a: 1, e: "2H₂O → 2H₂ + O₂." },
  { ch: "reactions", q: "Assertion (A): Copper vessels develop a green coating over time. Reason (R): Copper reacts with moist carbon dioxide in air to form basic copper carbonate.", o: AR, a: 0, e: "The green layer is basic copper carbonate; R explains A." },
  { ch: "reactions", q: "Assertion (A): Decomposition of vegetable matter into compost is endothermic. Reason (R): A decomposition reaction breaks one reactant into simpler products.", o: AR, a: 3, e: "Composting releases heat (exothermic), so A is false; R is true." },
  { ch: "acids", q: "When sodium carbonate reacts with dilute HCl, the gas evolved is", o: ["H₂", "CO₂", "Cl₂", "O₂"], a: 1, e: "Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂." },
  { ch: "acids", q: "Which of these is used as an antacid?", o: ["Milk of magnesia", "Vinegar", "Lemon juice", "Washing soda"], a: 0, e: "Mg(OH)₂, a mild base." },
  { ch: "acids", q: "Bleaching powder is made by passing chlorine over", o: ["quicklime", "dry slaked lime", "limestone", "gypsum"], a: 1, e: "Ca(OH)₂ + Cl₂ → CaOCl₂ + H₂O." },
  { ch: "acids", q: "The number of molecules of water of crystallisation in washing soda is", o: ["2", "5", "7", "10"], a: 3, e: "Na₂CO₃·10H₂O." },
  { ch: "acids", q: "When an acid is diluted, the concentration of H₃O⁺ ions per unit volume", o: ["increases", "decreases", "stays the same", "becomes zero"], a: 1, e: "The same ions spread through more water." },
  { ch: "acids", q: "Assertion (A): Dry HCl gas does not change the colour of dry blue litmus paper. Reason (R): HCl produces H⁺ ions only in the presence of water.", o: AR, a: 0, e: "Without water there are no H⁺ ions; R explains A." },
  { ch: "acids", q: "Assertion (A): The pH of human blood is about 4. Reason (R): The human body works within a narrow pH range of 7.0 to 7.8.", o: AR, a: 3, e: "Blood pH is about 7.4, so A is false; R is true." }
]);
addTo("science", "written", [
  { ch: "reactions", marks: 3, q: "Why is respiration considered an exothermic reaction? Write the equation.",
    a: "During respiration, glucose combines with oxygen in our cells and releases energy, so it is exothermic.\nC₆H₁₂O₆ (aq) + 6O₂ (g) → 6CO₂ (g) + 6H₂O (l) + energy",
    points: [["Glucose oxidised in cells", 1], ["Energy released, so exothermic", 1], ["Balanced equation", 1]] },
  { ch: "reactions", marks: 4, q: "Case study: A teacher heats green ferrous sulphate crystals in a dry boiling tube. The colour changes and a smell of burning sulphur is noticed. (i) What colour change is seen? (1) (ii) Write the balanced equation. (2) (iii) Name the type of reaction. (1)",
    a: "(i) Green crystals first lose water and become white, then a reddish-brown solid (Fe₂O₃) forms.\n(ii) 2FeSO₄ (s) → Fe₂O₃ (s) + SO₂ (g) + SO₃ (g)\n(iii) Thermal decomposition reaction.",
    points: [["(i) colour change", 1], ["(ii) correct products", 1], ["(ii) balanced", 1], ["(iii) thermal decomposition", 1]] },
  { ch: "acids", marks: 3, q: "What happens when zinc reacts with (a) dilute HCl and (b) sodium hydroxide solution? Write equations. How is the gas tested?",
    a: "(a) Zn + 2HCl → ZnCl₂ + H₂\n(b) Zn + 2NaOH → Na₂ZnO₂ + H₂ (sodium zincate)\nTest: a burning candle near the gas burns with a pop sound, showing hydrogen.",
    points: [["(a) equation", 1], ["(b) equation", 1], ["Pop test for H₂", 1]] },
  { ch: "acids", marks: 4, q: "Case study: Four solutions have pH values A = 2, B = 7, C = 11, D = 5.5. (i) Which is strongly acidic? (ii) Which turns red litmus blue? (iii) Which could be pure water? (iv) Which has more H⁺ ions, A or D?",
    a: "(i) A (pH 2)\n(ii) C (pH 11, basic)\n(iii) B (pH 7, neutral)\n(iv) A: the lower the pH, the higher the H⁺ ion concentration.",
    points: [["(i)", 1], ["(ii)", 1], ["(iii)", 1], ["(iv) with reason", 1]] }
]);

addTo("english", "mcq", [
  { ch: "g-tense", q: "I ___ in this city since 2020.", o: ["live", "lived", "have lived", "am living"], a: 2, e: "'since' with an action continuing to now: present perfect." },
  { ch: "g-tense", q: "Water ___ at 100 °C.", o: ["boil", "boils", "is boiling", "boiled"], a: 1, e: "Universal truth: simple present." },
  { ch: "g-tense", q: "While I ___, the phone rang.", o: ["studied", "was studying", "have studied", "study"], a: 1, e: "Longer action interrupted: past continuous." },
  { ch: "ff-letter", q: "What destroyed Lencho's crops?", o: ["a flood", "a hailstorm", "locusts", "a drought"], a: 1, e: "A hailstorm ruined the corn field." },
  { ch: "ff-letter", q: "How much money did Lencho receive?", o: ["100 pesos", "70 pesos", "50 pesos", "30 pesos"], a: 1, e: "Seventy of the hundred he asked for." },
  { ch: "fp-triumph", q: "What did Herriot advise Mrs Pumphrey about Tricki?", o: ["more food", "less food and more exercise", "a surgery", "new toys"], a: 1, e: "He told her to cut down his food and give him more exercise." },
  { ch: "g-modals", q: "She ___ swim when she was five.", o: ["can", "could", "may", "must"], a: 1, e: "Past ability: could." },
  { ch: "g-modals", q: "You ___ see a doctor about that cough.", o: ["should", "might", "can", "would"], a: 0, e: "Advice: should." },
  { ch: "ff-mandela", q: "Mandela became the first ___ President of South Africa.", o: ["white", "Black", "elected woman", "military"], a: 1, e: "First Black President, 1994." }
]);

addTo("sanskrit", "mcq", [
  { ch: "m-vangmayam", q: "'अम्भोजः' इत्यस्य पर्यायः", o: ["जलम्", "कमलम्", "मेघः", "सूर्यः"], a: 1, e: "अम्भोज = born in water = lotus." },
  { ch: "m-vangmayam", q: "कीदृशी वाणी पुरुषं प्रसन्नं करोति?", o: ["कठोरा", "मधुरभाषिणी", "असत्या", "उच्चा"], a: 1, e: "Sweet speech pleases a person." },
  { ch: "m-vangmayam", q: "'ऊह' इत्यस्य विलोमपदम्", o: ["अपोहः", "मोहः", "स्नेहः", "देहः"], a: 0, e: "ऊह (reasoning for) and अपोह (reasoning against)." },
  { ch: "s-sandhi", q: "'गायकः' इत्यस्य सन्धिविच्छेदः", o: ["गा + यकः", "गै + अकः", "गाय + कः", "गे + अकः"], a: 1, e: "अयादि: ऐ + अ = आय्." },
  { ch: "s-sandhi", q: "निः + आशा =", o: ["निसाशा", "निराशा", "नीआशा", "निशाशा"], a: 1, e: "विसर्ग becomes र् (रत्व)." },
  { ch: "s-sandhi", q: "वृक्ष + छाया =", o: ["वृक्षछाया", "वृक्षच्छाया", "वृक्षाछाया", "वृक्षश्छाया"], a: 1, e: "तुगागम: च् is added before छ." },
  { ch: "m-tyag", q: "बोधिसत्त्वः केषां राजा आसीत्?", o: ["शिबीनाम्", "कुरूणाम्", "यादवानाम्", "पाण्डवानाम्"], a: 0, e: "King of the Shibis." },
  { ch: "m-tyag", q: "शक्रः केन रूपेण राजानम् अगच्छत्?", o: ["वैद्यरूपेण", "अन्धयाचकरूपेण", "मन्त्रिरूपेण", "बालरूपेण"], a: 1, e: "As a blind beggar." }
]);
