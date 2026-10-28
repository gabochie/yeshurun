/* One-off errata pass on the master manuscript. Safe to re-run (idempotent). */
const fs = require('fs');
const f = 'Book/Manuscript/Yeshurun-Final-Manuscript.md';
let m = fs.readFileSync(f, 'utf8');
const FF = String.fromCharCode(0xFFFD);
const trueR = [
  ['DeuterTag 32:15', 'Deuteronomy 32:15'],
  ['Transcrenderal', 'Transcendental'],
  ['Stritude', 'Strife'],
  ['Chaphter 4', 'Chapter 4'],
  ["Isaac's assertion in the next verse", "Isaiah's oracle in the next verse"],
  ["(*tole'a')", "(*tole'ah*)"],
  ['(יִשְ' + FF + 'רָאֵל)', '(יִשְׂרָאֵל)'],
  ['(יָשָבר, "straight/upright")', '(יָשָׁר, "straight/upright")'],
  ['es **ctic hope', 'eschatological hope'],
  ['### 6.6 Synthesis', '### 6.4 Synthesis'],
  ['### 3.4 The Twelve Stones', '### 3.5 The Twelve Stones'],
  ['The map comforted that', 'The map assures us that'],
  ['*For more resources, visit [Author Website].*', '*For more resources and reader community: studio.gabochie.com · wa.me/233243262019 · @gideonabochie on Instagram, TikTok & YouTube.*'],
];
let count = 0;
for (const [a, b] of trueR) {
  if (m.includes(a)) { m = m.split(a).join(b); count++; }
  else console.log('MISS:', a.slice(0, 44));
}
fs.writeFileSync(f, m);
console.log('applied', count, 'of', trueR.length, 'fixes');
if (m.includes(FF)) console.log('WARNING: replacement chars remain');
else console.log('no replacement chars remain');
