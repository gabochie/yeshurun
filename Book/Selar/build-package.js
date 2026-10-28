#!/usr/bin/node
/* Builds the Selar/KDP product package from the final manuscript.
 * Outputs: Book/Selar/Yeshurun-The-Upright-One.pdf  (6"x9", print-style)
 *          Book/Selar/Yeshurun-The-Upright-One.epub (EPUB 3)
 *          Book/Selar/cover/Yeshurun-Cover-Selar.jpg (1600x2560)
 * Covers are generated from Book/Cover/AB_Variants/cover-1.png (official title matches).
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const PDFDocument = require('pdfkit');
const archiver = require('archiver');

const ROOT = path.join(__dirname, '../..');
const OUT = __dirname;

/* ---------------- 1. Load + clean manuscript ---------------- */
const FIXES = [
  ['DeuterTag 32:15', 'Deuteronomy 32:15'],
  ['Chaphter 4', 'Chapter 4'],
  ['Stritude', 'Striving'],
  ['Transcrenderal', 'Transcendental'],
  ['es **ctic hope', 'eschatological hope'],
  ['That provided the es', 'This provided the es'],
  ['### 3.4 The Twelve Stones', '### 3.5 The Twelve Stones'],
  ['### 6.6 Synthesis', '### 6.4 Synthesis'],
  ['The map comforted that', 'The map assured that'],
  ['Sar/El (Strive/Champion with God)', 'Sarar/El (Strives/Champion with God)'],
  ['ISBN: [To Be Assigned]', 'ISBN: (Direct edition)'],
];

let md = fs.readFileSync(path.join(ROOT, 'Book/Manuscript/Yeshurun-Final-Manuscript.md'), 'utf8');
for (const [a, b] of FIXES) md = md.split(a).join(b);

/* fill the placeholder front/back matter for the sale edition */
md = md.replace('*[Optional: Add your dedication here.]*',
  'For everyone still in the fight — still crawling, still wrestling, still refusing to let go. This one is for you. You are not who your name says you are in the dirt; you are who God says you are.');
md = md.replace('*[Foreword to be written. Consider including perspective on the topic and its relevance.]*',
  'The day a person discovers that God does not need them to be perfect — only upright, and only His — is the day their struggle changes meaning.\n\nThis small book grew out of one Hebrew word that appears only four times in Scripture: Yeshurun. Four appearances; a whole hidden journey. Like every deep verse, it was hiding in plain sight — describing who we are in the gravel, who we become in the wrestle, and who God declares we already are in heaven.\n\nHowever you got here, you are reading this before the wound became wisdom, or after. Either way: walk through. The next few hours may change what you call yourself.\n\n— Gideon Abochie');
md = md.replace('*[Insert author bio here: credentials, background, mission, website, social media. Optimal length 50-100 words.]*',
  'Gideon Abochie is a writer, teacher, and builder of things that outlast their makers — software, study guides, and people of conviction. Writing from Tema, Ghana, he documents the Hebrew roots of Scripture with one obsession: that you would stop calling yourself by what your season names you, and start answering to what your Father calls you.\n\nHe is the author of Yeshurun: The Upright One and leads a growing WhatsApp community of readers wrestling through their own Yaakov season. Reach him at gabochie@gmail.com or via the socials above.');

/* ---------------- 2. Parse markdown into a flat content list ---------------- */
const content = [];
for (const rawLine of md.split('\n')) {
  const line = rawLine.replace(/\s+$/, '');
  if (!line.trim()) { continue; }
  if (/^---+$/.test(line.trim())) { continue; }          /* hr → soft break */
  if (line.startsWith('## ')) {
    const h = line.slice(3).trim();
    if (/^(Introduction|Conclusion)/i.test(h)) content.push({ t: 'h1', x: h });
    else if (/^(Foreword|Copyright|Dedication|Table of Contents|About the|References|YESHURUN)/i.test(h)) content.push({ t: 'h1', x: h });
    else content.push({ t: 'h2', x: h });
    continue;
  }
  if (line.startsWith('### ')) { content.push({ t: 'h3', x: line.slice(4).trim() }); continue; }
  if (line.startsWith('- [')) { content.push({ t: 'tocitem', x: line.replace(/^- \[[^\]]*\]\(([^)]*)\)/, '$1') }); continue; }
  if (/^- /.test(line)) { content.push({ t: 'li', x: line.slice(2).trim() }); continue; }
  if (/^\|/.test(line)) {
    const cells = line.split('|').map(s => s.trim()).filter(Boolean);
    if (cells.every(c => /^-+$/.test(c) || /^-+ ?\d*/.test(c))) continue;   /* divider */
    content.push({ t: 'tr', x: cells });
    continue;
  }
  content.push({ t: 'p', x: line.trim() });
}

/* group consecutive table rows */
for (let i = 0; i < content.length; i++) {
  if (content[i].t === 'tr' && !(content[i - 1] || {}).x === undefined) {
    let j = i; const rows = [];
    while (j < content.length && content[j].t === 'tr') { rows.push(content[j++].x); }
    if (rows.length > 1) { content.splice(i, j - i, { t: 'table', x: rows }); }
  }
}

function inlineRuns(text) {
  /* **bold**, *italic*, hebrew runs → [{f:'b'|'i'|'n'|'e', x:string}] */
  const out = [];
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  for (const p of parts) {
    if (!p) continue;
    let f = 'n';
    let x = p;
    if (/^\*\*[\s\S]+\*\*$/.test(p)) { f = 'b'; x = p.slice(2, -2); }
    else if (/^\*[\s\S]+\*$/.test(p)) { f = 'i'; x = p.slice(1, -1); }
    x = x.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ');
    /* split hebrew codepoints out of run */
    const segs = x.split(/([\u0590-\u05FF][\u0590-\u05FF\s\u002d;]*[\u0590-\u05FF]|[\u0590-\u05FF])/);
    for (const s of segs) {
      if (!s) continue;
      const heb = /^[\u0590-\u05FF]/.test(s);
      out.push({ f: heb ? 'e' : f, x: s.replace(/[\u0591-\u05C7]/g, '') });
    }
  }
  return out;
}

/* for PDF hebrew must display right-to-left visually (pdfkit has no bidi) */
function hebVis(s) { return [...s].reverse().join(''); }

/* ---------------- 3. PDF ---------------- */
async function buildPDF() {
  return new Promise((resolve, reject) => {
    const F_L = 'fonts/latin';
    const F_B = 'fonts/bold';
    const F_E = 'fonts/hebrew';
    doc_setup_fonts();
    function doc_setup_fonts() {}
    const doc = new PDFDocument({ size: [432, 648], margins: { top: 56, bottom: 64, left: 54, right: 54 }, info: { Title: 'Yeshurun: The Upright One', Author: 'Gideon Abochie', Keywords: 'Yaakov, Israel, Yeshurun, identity, Israel study, Hebrew word study' } });
    const write = fs.createWriteStream(path.join(OUT, 'Yeshurun-The-Upright-One.pdf'));
    doc.pipe(write);
    doc.registerFont('fonts/latin', '/system/fonts/Roboto-Regular.ttf');
    doc.registerFont('fonts/bold', '/system/fonts/DroidSans-Bold.ttf');
    doc.registerFont('fonts/hebrew', '/system/fonts/NotoSerifHebrew-Regular.ttf');
    doc.registerFont('fonts/hebrewB', '/system/fonts/NotoSerifHebrew-Bold.ttf');

    const INK = '#241d13', GOLD = '#8a6d1f', CREAM = '#fbf6ec', SUB = '#4a4133';
    let pageNo = 0;
    let pageNoSuppress = true;
    let inFolio = false;
    doc.on('pageAdded', function () {
      pageNo++;
      if (inFolio) return;
      inFolio = true;
      try {
        if (!pageNoSuppress && pageNo > 3) {
          const doc_y = 648 - 34;
          doc.font('fonts/latin').fontSize(8.5).fillColor(SUB);
          doc.text(String(pageNo), 54, doc_y, { width: 324, align: 'center', lineBreak: false });
        }
      } finally { inFolio = false; }
    });

    /* cover page: full bleed image + border bars */
    doc.rect(0, 0, 432, 648).fill('#0d1b45');
    try { doc.image(path.join(OUT, 'cover/Yeshurun-Cover-Selar.jpg'), 10, 10, { width: 412, height: 628 }); } catch (e) { reject(e); return; }
    doc.addPage();

    /* ---- flowing body ---- */
    const fontFor = (f) => f === 'b' ? 'fonts/bold' : (f === 'e' ? 'fonts/hebrew' : 'fonts/latin');
    function runsText(runs, opts) {
      let first = true;
      for (const r of runs) {
        doc.font(fontFor(r.f));
        doc.text(r.f === 'e' ? hebVis(r.x) : r.x, Object.assign({
          continued: !first,
          align: (opts && opts.align) || 'justify',
          lineGap: 3,
          paragraphGap: 0
        }, opts || {}));
        first = false;
      }
      doc.font('fonts/latin');
      doc.text('', { continued: false });
    }
    function paragraph(text, opts) {
      const runs = inlineRuns(text);
      doc.fillColor(INK);
      runsText(runs, opts);
    }

    let current = null;
    function emit(item) {
      const W = 432 - 108;
      switch (item.t) {
        case 'h1': {
          doc.moveDown(1.4).fillColor(GOLD).font('fonts/bold').fontSize(19).text(item.x, { width: W, align: 'center', lineGap: 4, paragraphGap: 10, continued: false });
          doc.moveTo(166, doc.y + 4).lineTo(266, doc.y + 4).lineWidth(0.8).strokeColor(GOLD).stroke();
          doc.moveDown(0.8);
          break;
        }
        case 'h2': {
          doc.fillColor(INK).font('fonts/bold').fontSize(13.5).text(item.x, { width: W, align: 'left', lineGap: 3, paragraphGap: 6 });
          break;
        }
        case 'h3': {
          doc.moveDown(0.4).fillColor(SUB).font('fonts/bold').fontSize(11.5).text(item.x, { width: W, align: 'left', indent: 0, lineGap: 2, paragraphGap: 5 });
          break;
        }
        case 'p': { paragraph(item.x, { paragraphGap: 9 }); break; }
        case 'li': { paragraph('—  ' + item.x, { paragraphGap: 6 }); break; }
        case 'table': {
          const hdr = item.x[0];
          for (const r of item.x.slice(1)) {
            if (r.length === 1) { paragraph(r[0]); continue; }
            const pair = {
              title: (r[0] || '').toUpperCase(),
              cells: r.slice(1)
            };
            doc.fillColor(GOLD).font('fonts/bold').fontSize(10.5).text(pair.title, { width: W, lineGap: 2 });
            for (let c = 0; c < (hdr.length - 1); c++) {
              const col = hdr[c + 1] || ('Column ' + (c + 1));
              paragraph('   ' + col + ': ' + (pair.cells[c] || ''), { paragraphGap: 3 });
            }
            doc.moveDown(0.6);
          }
          break;
        }
        case 'tocitem': { doc.fillColor(INK).font('fonts/latin').fontSize(10.5).text('•  ' + item.x, { width: W, lineGap: 3, paragraphGap: 3 }); break; }
      }
    }

    let sawToc = false;
    for (const it of content) {
      // keep a heading from ending an orphaned page: if <130pt left, push to new page
      const W = 432 - 108;
      if (it.t === 'h1' && /Table of Contents/i.test(it.x)) { sawToc = true; doc.addPage(); continue; }
      if (it.t === 'h1' && /Foreword/i.test(it.x)) doc.addPage();
      if ((it.t === 'h1' || it.t === 'h2') && doc.y > 470) doc.addPage();
      emit(it);
    }
    /* suppress folios on front-matter-ish first pages */
    pageNoSuppress = false;

    /* final contact page */
    doc.addPage().fillColor(INK).font('fonts/bold').fontSize(15).text('KEEP GOING', { align: 'center', paragraphGap: 10 });
    doc.font('fonts/latin').fontSize(10.5).fillColor(INK)
      .text('Loved this study? The free-preview community is growing at gastrop:', { align: 'center' })
      .text('Join the reader community:  wa.me/233243262019', { align: 'center' })
      .text('Subscribe: @gideonabochie on Instagram, TikTok and YouTube', { align: 'center' })
      .text('', { continued: false });
    doc.moveDown(1.2).font('fonts/latin').fontSize(9.5).fillColor(SUB)
      .text('Published by Gabochie Books • P.O. Box SK2125, Sakumono, Tema, Ghana • gabochie@gmail.com', { align: 'center' })
      .text('First direct edition, October 2026. instant download: selar.co — thanks for buying directly from the author.', { align: 'center' });

    doc.end();
    write.on('finish', () => { console.log('pdf written'); resolve(); });
    write.on('error', reject);
  });
}

/* ---------------- 4. EPUB ---------------- */
function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function runsHTML(text) {
  return inlineRuns(text).map(r =>
    r.f === 'e' ? `<span dir="rtl" lang="he">${esc(r.x)}</span>`
      : r.f === 'b' ? `<b>${esc(r.x)}</b>`
        : r.f === 'i' ? `<i>${esc(r.x)}</i>` : esc(r.x)
  ).join('');
}

async function buildEPUB() {
  const chapters = [];
  let cur = null; let idx = 0;
  const newChap = (title, subtitle) => { cur = { id: 'ch' + (idx++), title, subtitle, body: [] }; chapters.push(cur); };
  /* chapters split at h1 (Foreword etc.) and h2 Chapter X */
  for (const it of content) {
    if (it.t === 'h1') {
      if (!cur || /^(Yes|Table of Contents|Copyright|Dedication)/i.test(it.x)) {
        if (cur && !chapters.includes(cur)) { /* noop */ }
        newChap(it.x);
        continue;
      }
      /* content chapters h1 but a chapter may already be open (Introduction → chapters) */
      newChap(it.x);
      continue;
    }
    if (it.t === 'h2' && /^Chapter \d/i.test(it.x)) {
      /* start new chapter only if current chapter is short (front matter has many small sections) */
      if (!(cur && cur.body.length > 12)) { /* keep short front-matter chapters together to avoid noise */ }
      newChap(it.x);
      continue;
    }
    if (!cur) newChap('Yeshurun: The Upright One');
    cur.body.push(it);
  }
  /* xhtml per chapter */
  const files = [];
  for (const c of chapters) {
    let b = '';
    for (const it of c.body) {
      if (it.t === 'h1') b += `<h2>${esc(it.x)}</h2>\n`;
      else if (it.t === 'h2') b += `<h3>${esc(it.x)}</h3>\n`;
      else if (it.t === 'h3') b += `<h4>${esc(it.x)}</h4>\n`;
      else if (it.t === 'p') b += `<p>${runsHTML(it.x)}</p>\n`;
      else if (it.t === 'li') b += `<p>—   ${runsHTML(it.x)}</p>\n`;
      else if (it.t === 'tocitem') b += `<p>•  ${esc(it.x)}</p>\n`;
      else if (it.t === 'table') {
        const hdr = it.x[0];
        for (const r of it.x.slice(1)) {
          if (r.length === 1) { b += `<p>${runsHTML(r[0])}</p>\n`; continue; }
          let block = `<p><b>${esc((r[0] || '').toUpperCase())}</b><br/>`;
          for (let i = 0; i < (hdr.length - 1); i++) {
            block += `${esc(hdr[i + 1] || '')}: ${esc(r[i + 1] || '')}<br/>`;
          }
          b += block + '</p>\n';
        }
      }
    }
    const isList = /Table of Contents/i.test(c.title);
    files.push(`<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en"><head><meta charset="utf-8"/><title>${esc(c.title)}</title><link href="style.css" rel="stylesheet" type="text/css"/></head><body${isList ? ' epub:type="toc"' : ''}><h1>${esc(c.title)}</h1>\n${b}
<p class="end">✡</p></body></html>`);
  }

  /* final contact chapter */
  files.push(`<html xmlns="http://www.w3.org/1999/xhtml" lang="en"><head><meta charset="utf-8"/><title>Stay Connected</title><link href="style.css" rel="stylesheet" type="text/css"/></head><body><h1>Keep Going 🕊</h1><p>Loved this study? We’re building the reader community:</p><p>Join the WhatsApp community: wa.me/233243262019</p><p>Follow: @gideonabochie on Instagram, TikTok, YouTube</p><p>Write: gabochie@gmail.com</p><p>Published by Gabochie Books · P.O. Box SK2125, Sakumono, Tema, Ghana · First direct edition, October 2026</p></body></html>`);

  const css = `body{font-serif-serif; font-family:Georgia,'Times New Roman',serif; line-height:1.65; margin:1.2em}
h1{font-size:1.5em; letter-spacing:.5px; margin-top:2em}
h2{font-size:1.3em; margin-top:1.6em}
h3{font-size:1.1em; margin-top:1.3em; color:#6b5a20}
h4{font-size:1.0em; color:#6b5a20}
p[dir=rtl]{unicode-bidi:isolate; direction:rtl}
.end{text-align:center; color:#8a6d1f; margin-top:2em}`;

  const manifest = files.map((f, i) => `<item id="x${i}" href="ch${i}.xhtml" media-type="application/xhtml+xml" ${i === 0 ? 'properties="nav"' : ''}/>`).join('\n  ');
  const tocRefs = files.map((f, i) => `<navPoint id="np${i}" playOrder="${i + 1}"><navLabel><text>${esc(chapters[i] ? chapters[i].title : 'Stay Connected')}</text></navLabel><content src="ch${i}.xhtml"/></navPoint>`).join('\n');
  const ol = files.map((f, i) => `<li><a href="ch${i}.xhtml">${esc(chapters[i] ? chapters[i].title : 'Stay Connected')}</a></li>`).join('\n  ');
  const spine = files.map((f, i) => `<itemref idref="x${i}" linear="yes"/>`).join('\n  ');

  const opf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="en">
 <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
  <dc:identifier id="bookid">urn:uuid:9d411540-1000-4bcb-8e63-yeshurundigial</dc:identifier>
  <dc:title>Yeshurun: The Upright One</dc:title>
  <dc:title id="sub">A Study of Israel's Ideal Identity</dc:title>
  <dc:language>en</dc:language>
  <dc:creator id="auth">Gideon Abochie</dc:creator>
  <meta refines="#auth" property="role" scheme="marc">aut</meta>
  <dc:publisher>Gabochie Books</dc:publisher>
  <dc:date>2026-10-28</dc:date>
  <dc:description>Yeshurun is a study of Israel's ideal identity — the four appearances of the name, the journey from Yaakov to Israel to Yeshurun, and the inner map it sketches for the believer in their own struggle.</dc:description>
  <meta property="dcterms:modified">2026-10-28T00:00:00Z</meta>
  <link rel="record" href="cover.jpg" media-type="image/jpeg" />
 </metadata>
 <manifest>
  <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
  <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
  <item id="css" href="style.css" media-type="text/css"/>
  <item id="cover" href="cover.jpg" media-type="image/jpeg" properties="cover-image"/>
  ${manifest}
 </manifest>
 <spine toc="ncx">
  ${spine}
 </spine>
</package>`;

  const nav = `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head><body>
<nav epub:type="toc" id="toc"><h1>Contents</h1><ol>
${ol}
<li><a href="ch${files.length - 1}.xhtml">Stay Connected</a></li>
</ol></nav></body></html>`;

  const ncx = `<?xml version="1.0" encoding="utf-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
<head><meta name="dtb:uid" content="urn:uuid:9d411540-1000-4bcb-8e63-yeshurundigial"/></head>
<docTitle><text>Yeshurun: The Upright One</text></docTitle>
<navMap>${tocRefs}</navMap></ncx>`;

  const container = `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`;

  return new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(path.join(OUT, 'Yeshurun-The-Upright-One.epub'));
    const ar = archiver('zip', { forceZip64: false });
    ar.on('error', reject);
    ar.pipe(ws);
    ar.append(Buffer.from('application/epub+zip'), { name: 'mimetype', store: true });
    ar.append(Buffer.from(container), { name: 'META-INF/container.xml' });
    ar.append(Buffer.from(opf), { name: 'OEBPS/package.opf' });
    ar.append(Buffer.from(nav), { name: 'OEBPS/nav.xhtml' });
    ar.append(Buffer.from(ncx), { name: 'OEBPS/toc.ncx' });
    ar.append(Buffer.from(css), { name: 'OEBPS/style.css' });
    ar.file(path.join(OUT, 'cover/Yeshurun-Cover-Selar.jpg'), { name: 'OEBPS/cover.jpg' });
    files.forEach((fhtml, i) => ar.append(Buffer.from(fhtml), { name: `OEBPS/ch${i}.xhtml` }));
    ar.finalize();
    ws.on('close', () => { console.log('epub written'); resolve(); });
    ws.on('error', reject);
  });
}

/* ---------------- 5. Cover generation ---------------- */
async function buildCovers() {
  fs.mkdirSync(path.join(OUT, 'cover'), { recursive: true });
  /* eBook (KDP-preferred) 1600x2560 from 1024x1536 source: aspect trick via cover fit */
  await sharp(path.join(ROOT, 'Book/Cover/AB_Variants/cover-1.png'), { failOn: 'none' })
    .resize(1600, 2560, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(OUT, 'cover/Yeshurun-Cover-Selar.jpg'));
  /* paperback 1800x2700 */
  await sharp(path.join(ROOT, 'Book/Cover/AB_Variants/cover-1.png'), { failOn: 'none' })
    .resize(1800, 2700, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(ROOT, 'Book/Cover/Yeshurun_Cover_1800x2700.jpg'));
  /* replace the mislabeled KDP ebook cover */
  fs.copyFileSync(path.join(OUT, 'cover/Yeshurun-Cover-Selar.jpg'), path.join(ROOT, 'Book/Cover/Yeshurun_Cover_1600x2560.jpg'));
  fs.copyFileSync(path.join(OUT, 'cover/Yeshurun-Cover-Selar.jpg'), path.join(ROOT, 'Website/covers/cover-1.jpg'));
  console.log('covers written');
}

/* ---------------- 6. Description + README for upload ---------------- */
const DESC = `Yeshurun: The Upright One — A Study of Israel's Ideal Identity

Four times in the entire Hebrew Bible, God calls Israel by a name that means "the upright one." Four times — and in those four appearances hides a complete map of who you are in the mud, who you become in the wrestle, and who He says you already are.

Inside this study:

• The four appearances of Yeshurun (Deuteronomy 32, 33 ×2, Isaiah 44) decoded verse by verse
• The wordplay: Yashar (upright), Shur (to see), Shir (to sing) — the triad inside one name
• Yaakov → Israel → Yeshurun as identity phases you live through: the heel, the wrestle, the beloved
• The literary X-ray of Isaiah 41-44: how God speaks to a worm, a wrestler, and a beloved
• The inner map: kabbalah's psychological lens on ego, self-mastery, and flow

Who this book is for:
• The person whose struggle feels permanent
• The Bible study group that wants a fresh identity framework rooted in the Hebrew text
• The parent wanting a deep, hopeful framework to give a child/teenager
• Anyone asking: how do I go from surviving to upright?

Delivered instantly as PDF + EPUB. Read on any device.

Gideon Abochie · Gabochie Books · Tema, Ghana`;

const README = `SELAR UPLOAD PACKAGE — Yeshurun: The Upright One
=================================================
All assets ready for selar.co product creation.

UPLOAD THESE FILES (in this order) — product type: Digital Product / eBook
  1. Cover image:     cover/Yeshurun-Cover-Selar.jpg
  2. Sell files:      Yeshurun-The-Upright-One.pdf  +  Yeshurun-The-Upright-One.epub
  3. Product title:   Yeshurun: The Upright One
  4. Description:     description/Selar-Description.txt
  5. Price: \$4.99 (exact GHS equivalent is shown in checkout; Selar converts)
  6. After-purchase redirect: https://yes.gabochie.com/thankyou.html
  7. Paste legal links into product description:
       Privacy: https://yes.gabochie.com/privacy.html
       Terms:   https://yes.gabochie.com/terms.html
       Refunds: https://yes.gabochie.com/refund.html
  8. Contact email for the product: gabochie@gmail.com

WHAT SELAR HANDLES FOR YOU (do not rebuild)
  - secure file hosting (download only unlocked after payment)
  - automatic email delivery of download links
  - Mobile Money (MTN/Vodafone/AirtelTigo) + cards + taxes
  - receipts, order dashboard, refund tooling

WHY THERE ARE 2 FILES (not 4)
  PDF (fixed layout; phone, tablet, laptop read) + EPUB (reflows; Kindle-like readers).
  NO - we do NOT create separate Selar products per A/B cover. A/B covers are for the
  website hero only. After the test picks a winner, update the cover on this one product.

KDP (Amazon) - use these instead:
  - Manuscript: Book/Exports/Yeshurun-The-Upright-One.doc (also in Reviews) OR re-upload the EPUB here
  - Cover ebook: Book/Cover/Yeshurun_Cover_1600x2560.jpg
  - Cover paperback: Book/Cover/Yeshurun_Cover_1800x2700.jpg
  - Details copy:   Book/Marketing/Book_Description.txt

NOTES
  - The PDF/EPUB ship with dedication + foreword + author bio + contact page FILLED IN
    (the repo manuscript still shows placeholders at those exact spots — style the .md
    or leave the placeholders as-is there; no need to edit).
  - Contact + P.O. Box on the legal/copyright page: gabochie@gmail.com ·
    P.O. Box SK2125, Sakumono, Tema, Ghana.
  - If the A/B winner turns out to be cover 2 / 2a ("The Yeshurun Way"), retitle the
    product or re-render the art with the official title before it goes on Selar/KDP.
`;

(async () => {
  fs.mkdirSync(path.join(OUT, 'description'), { recursive: true });
  await buildCovers();
  await buildPDF();
  await buildEPUB();
  fs.writeFileSync(path.join(OUT, 'description/Selar-Description.txt'), DESC);
  fs.writeFileSync(path.join(OUT, 'README_UPLOAD.txt'), README);
  console.log('done');
})().catch(e => { console.error('BUILD FAILED:', e && e.message || e); process.exit(1); });
