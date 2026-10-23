/* Question bank, batch 2: week 2 chapters of the study plan. */
addTo("maths", "mcq", [
  { ch: "quad", q: "The roots of x² − 6x + 9 = 0 are", o: ["3, −3", "3, 3", "−3, −3", "not real"], a: 1, e: "(x − 3)² = 0." },
  { ch: "quad", q: "Which of these is a quadratic equation?", o: ["(x − 2)² + 1 = 2x − 3", "x(x + 1) + 8 = (x + 2)(x − 2)", "x² + 3x + 1 = (x − 2)²", "2x + 3 = 0"], a: 0, e: "It simplifies to x² − 6x + 8 = 0. The other two cancel x² and become linear." },
  { ch: "quad", q: "The sum of the roots of 2x² − 8x + 5 = 0 is", o: ["4", "−4", "5/2", "8"], a: 0, e: "−b/a = 8/2." },
  { ch: "quad", q: "Assertion (A): 3x² − 4√3x + 4 = 0 has two equal real roots. Reason (R): If D = 0, a quadratic equation has two equal real roots.", o: AR, a: 0, e: "D = 48 − 48 = 0; R explains A." },
  { ch: "ap", q: "Which of these is an AP?", o: ["1, 4, 9, 16", "2, 4, 8, 16", "3, 3, 3, 3", "1, 2, 4, 7"], a: 2, e: "d = 0 is allowed." },
  { ch: "ap", q: "The 21st term of the AP −3, −1/2, 2, ... is", o: ["47", "50", "48", "53"], a: 0, e: "d = 5/2; a₂₁ = −3 + 20 × 5/2 = 47." },
  { ch: "ap", q: "If 2p, p + 10, 3p + 2 are in AP, then p =", o: ["4", "6", "−6", "2"], a: 1, e: "2(p + 10) = 2p + 3p + 2 ⇒ p = 6." },
  { ch: "ap", q: "Assertion (A): The sum of the first 10 natural numbers is 55. Reason (R): Sₙ = n(n + 1)/2 for the first n natural numbers.", o: AR, a: 0, e: "10 × 11/2 = 55." },
  { ch: "tri", q: "If △ABC ~ △DEF, AB = 4 cm, DE = 6 cm, EF = 9 cm, then BC =", o: ["6 cm", "4.5 cm", "13.5 cm", "8 cm"], a: 0, e: "AB/DE = BC/EF ⇒ 4/6 = BC/9 ⇒ BC = 6." },
  { ch: "tri", q: "In △ABC, D and E are on AB and AC with AD/DB = AE/EC. Then", o: ["DE ⊥ BC", "DE ∥ BC", "DE = BC", "D and E are midpoints"], a: 1, e: "Converse of BPT." },
  { ch: "tri", q: "Assertion (A): All equilateral triangles are similar. Reason (R): Triangles with equal corresponding angles are similar.", o: AR, a: 0, e: "Every angle is 60°; AAA similarity." }
]);
addTo("maths", "written", [
  { ch: "quad", marks: 3, q: "Find the value of k for which kx² − 2kx + 6 = 0 has two equal roots.",
    a: "For equal roots D = 0.\n(−2k)² − 4(k)(6) = 0\n4k² − 24k = 0 ⇒ 4k(k − 6) = 0\nk = 0 or k = 6. k = 0 makes it not quadratic, so k = 6.",
    points: [["D = 0 set up", 1], ["Solved", 1], ["Rejects k = 0", 1]] },
  { ch: "ap", marks: 3, q: "How many terms of the AP 24, 21, 18, ... must be taken so that their sum is 78?",
    a: "a = 24, d = −3\n78 = n/2 [48 + (n − 1)(−3)]\n156 = n(51 − 3n) ⇒ 3n² − 51n + 156 = 0 ⇒ n² − 17n + 52 = 0\n(n − 4)(n − 13) = 0, n = 4 or 13\nBoth work: the terms after the 4th add up to zero (terms 5 to 13 are 12, 9, 6, 3, 0, −3, −6, −9, −12).",
    points: [["Sum formula set up", 1], ["Quadratic solved", 1], ["Both answers explained", 1]] },
  { ch: "ap", marks: 4, q: "Case study: A student saves ₹50 in week 1, ₹60 in week 2, ₹70 in week 3, and so on. (i) How much does she save in week 10? (1) (ii) In which week does she save ₹200? (1) (iii) How much does she save in total in the first 10 weeks? (2)",
    a: "a = 50, d = 10\n(i) a₁₀ = 50 + 9 × 10 = ₹140\n(ii) 200 = 50 + (n − 1)10 ⇒ n = 16, week 16\n(iii) S₁₀ = 10/2 (50 + 140) = ₹950",
    points: [["(i) ₹140", 1], ["(ii) week 16", 1], ["(iii) formula", 1], ["(iii) ₹950", 1]] },
  { ch: "tri", marks: 3, q: "In △ABC, DE ∥ BC. If AD = x, DB = x − 2, AE = x + 2 and EC = x − 1, find x.",
    a: "By BPT, AD/DB = AE/EC\nx/(x − 2) = (x + 2)/(x − 1)\nx² − x = x² − 4\n−x = −4 ⇒ x = 4",
    points: [["BPT applied", 1], ["Equation formed", 1], ["x = 4", 1]] }
]);

addTo("science", "mcq", [
  { ch: "metals", q: "An element forms a basic oxide and conducts electricity. It is likely", o: ["sulphur", "carbon", "magnesium", "phosphorus"], a: 2, e: "Metals form basic oxides." },
  { ch: "metals", q: "Which metal can be cut with a knife?", o: ["iron", "sodium", "copper", "aluminium"], a: 1, e: "Sodium and potassium are soft." },
  { ch: "metals", q: "Food cans are coated with tin rather than zinc because", o: ["zinc is costlier", "zinc is more reactive than tin", "tin is harder", "zinc melts easily"], a: 1, e: "Zinc could react with acids in food." },
  { ch: "metals", q: "Assertion (A): Aluminium does not corrode easily. Reason (R): Aluminium forms a thin protective oxide layer on its surface.", o: AR, a: 0, e: "The Al₂O₃ layer protects it." },
  { ch: "carbon", q: "The number of covalent bonds in methane (CH₄) is", o: ["2", "3", "4", "5"], a: 2, e: "Four C–H bonds." },
  { ch: "carbon", q: "The IUPAC name of CH₃CHO is", o: ["methanal", "ethanal", "ethanol", "propanal"], a: 1, e: "Two carbons with an aldehyde group." },
  { ch: "carbon", q: "Hydrogenation of vegetable oil uses a catalyst of", o: ["iron", "nickel", "copper", "platinum only"], a: 1, e: "Nickel (or palladium)." },
  { ch: "carbon", q: "The next member of the homologous series after C₂H₄ is", o: ["C₃H₈", "C₃H₆", "C₄H₈", "C₂H₆"], a: 1, e: "Add CH₂: C₃H₆ (propene)." },
  { ch: "carbon", q: "Assertion (A): Detergents work well in hard water. Reason (R): Detergents do not form insoluble scum with calcium and magnesium ions.", o: AR, a: 0, e: "Soaps form scum; detergents don't." }
]);
addTo("science", "written", [
  { ch: "metals", marks: 5, q: "Explain how a metal of medium reactivity, like zinc, is extracted from (a) its sulphide ore and (b) its carbonate ore. Write equations and how the oxide is reduced.",
    a: "(a) Roasting: the sulphide ore is heated strongly in excess air.\n2ZnS + 3O₂ → 2ZnO + 2SO₂\n(b) Calcination: the carbonate ore is heated strongly in limited air.\nZnCO₃ → ZnO + CO₂\nReduction: the oxide is heated with carbon.\nZnO + C → Zn + CO\nMetals are converted to oxides first because it is easier to reduce an oxide than a sulphide or carbonate.",
    points: [["Roasting explained", 1], ["Roasting equation", 1], ["Calcination with equation", 1], ["Reduction with carbon equation", 1], ["Why oxide first", 1]] },
  { ch: "carbon", marks: 3, q: "What is a homologous series? Give two characteristics with an example.",
    a: "A series of carbon compounds with the same functional group and similar chemical properties, in which successive members differ by a CH₂ unit.\nCharacteristics: (1) successive members differ by CH₂ (14 u in mass); (2) physical properties like boiling point change gradually.\nExample: CH₃OH, C₂H₅OH, C₃H₇OH (alcohols).",
    points: [["Definition", 1], ["Two characteristics", 1], ["Example", 1]] },
  { ch: "carbon", marks: 4, q: "Case study: Rohan heats ethanol with excess concentrated sulphuric acid at 443 K and collects a gas that decolourises bromine water. (i) Name the gas. (1) (ii) Write the equation. (1) (iii) What is the role of conc. H₂SO₄? (1) (iv) Why does the gas decolourise bromine water? (1)",
    a: "(i) Ethene (C₂H₄)\n(ii) CH₃CH₂OH → CH₂=CH₂ + H₂O (hot conc. H₂SO₄, 443 K)\n(iii) A dehydrating agent: it removes water from ethanol.\n(iv) Ethene is unsaturated (has a C=C double bond); bromine adds across it.",
    points: [["(i)", 1], ["(ii)", 1], ["(iii)", 1], ["(iv)", 1]] }
]);

addTo("english", "mcq", [
  { ch: "fp-thief", q: "What did Anil promise to teach Hari Singh?", o: ["to ride a cycle", "to write and add numbers", "to swim", "to drive"], a: 1, e: "Anil promised to teach him to write his name and to add numbers." },
  { ch: "fp-thief", q: "Why did Hari Singh not leave on the train?", o: ["he missed it", "he realised education mattered more than money", "the police caught him", "Anil stopped him"], a: 1, e: "He chose the chance to learn over the stolen money." },
  { ch: "g-sva", q: "The number of students in the class ___ forty.", o: ["are", "is", "were", "have"], a: 1, e: "'The number of' is singular." },
  { ch: "g-sva", q: "Bread and butter ___ my favourite breakfast.", o: ["are", "is", "were", "have been"], a: 1, e: "One dish treated as a single unit." },
  { ch: "ff-flying", q: "Why was the young seagull afraid?", o: ["of the sea", "to fly", "of his brothers", "of the dark"], a: 1, e: "He feared his wings would not support him." },
  { ch: "ff-flying", q: "In 'The Black Aeroplane', the pilot was flying to", o: ["Paris", "England", "Rome", "Berlin"], a: 1, e: "From Paris to England, for breakfast with his family." },
  { ch: "fp-midnight", q: "Max entered Ausable's room carrying", o: ["a knife", "a pistol", "a letter", "a lamp"], a: 1, e: "He held a small automatic pistol." },
  { ch: "g-reported", q: "He said, \"I will come tomorrow.\" becomes", o: ["He said that he will come tomorrow.", "He said that he would come the next day.", "He said that I would come tomorrow.", "He told that he would come the next day."], a: 1, e: "will → would; tomorrow → the next day." },
  { ch: "g-reported", q: "The teacher said, \"Sit down.\" becomes", o: ["The teacher said to sit down.", "The teacher told us to sit down.", "The teacher asked that sit down.", "The teacher said that sit down."], a: 1, e: "Commands: told/ordered + to + verb." }
]);

addTo("sanskrit", "mcq", [
  { ch: "s-samas", q: "'प्रतिदिनम्' इत्यस्य विग्रहः", o: ["दिनस्य प्रति", "दिनं दिनं प्रति", "प्रति च दिनं च", "दिनेन प्रति"], a: 1, e: "अव्ययीभाव with प्रति." },
  { ch: "s-samas", q: "'असत्यम्' इत्यत्र कः समासः?", o: ["द्वन्द्वः", "अव्ययीभावः", "नञ्-तत्पुरुषः", "उपपद-तत्पुरुषः"], a: 2, e: "न सत्यम्." },
  { ch: "s-samas", q: "'जलदः' इत्यस्य विग्रहः", o: ["जलस्य दः", "जलं ददाति इति", "जलं च दः च", "जलेन दः"], a: 1, e: "उपपद-तत्पुरुष: one who gives water (cloud)." },
  { ch: "m-srishti", q: "'का-का' इति कस्य ध्वनिः?", o: ["हंसस्य", "काकस्य", "मयूरस्य", "कोकिलस्य"], a: 1, e: "The crow." },
  { ch: "m-srishti", q: "केन समयः वृथा न यापयितव्यः?", o: ["आनन्देन", "कलहेन", "गानेन", "अध्ययनेन"], a: 1, e: "Time should not be wasted in quarrels." },
  { ch: "s-pratyay", q: "इतिहास + ठक् =", o: ["इतिहासिकः", "ऐतिहासिकः", "इतिहासकः", "ऐतिहासः"], a: 1, e: "ठक् strengthens the first vowel: इ → ऐ." },
  { ch: "s-pratyay", q: "दृश् + अनीयर् =", o: ["दर्शनीयम्", "दृशनीयम्", "द्रष्टव्यम्", "दर्शितम्"], a: 0, e: "दर्शनीयम् = worth seeing." }
]);
