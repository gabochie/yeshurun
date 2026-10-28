# LAUNCH TODOS — Manual Steps (print or check off)

Last updated: 2026-10-28. Site code is DONE & pushed. Everything below is done *outside* this repo.
Work through Top→Bottom. Boxes marked 💰 = takes money; 🔗 = needs info from you.

## 1. Google Analytics (10 min) — see README_ABN guide in Website/README.md
- [ ] Create GA4 property (GMT/Accra) for https://yes.gabochie.com
- [ ] Copy Measurement ID (G-...)
- [ ] 🔗 Paste ID into `Website/index.html` and `Website/thankyou.html` (replace INSERT_GA_ID)
- [ ] Create custom dimensions: `variant`, `position` (Admin → Custom definitions → Event scope)
- [ ] Test with `https://yes.gabochie.com/?ga_debug=1` in DebugView
- [ ] Mark `purchase` as key event (History: Admin → Events)

## 2. Selar Product (30–45 min) 🔗
- [ ] Log into selar.co → studio.gabochie.com store
- [ ] Create product "Yeshurun: The Upright One" (use Book/Marketing/Book_Description.txt copy)
- [ ] 💰 Upload the SELL FILES: `Book/Exports/Yeshurun-PDF` + EPUB (see §5 below)
- [ ] Upload cover: `Book/Cover/Yeshurun_Cover_1600x2560.jpg` (or the A/B winner later)
- [ ] Price: $4.99 / GHS equivalent
- [ ] Set **redirect after purchase** → `https://yes.gabochie.com/thankyou.html`
- [ ] Add legal links into product description: /privacy.html /terms.html /refund.html
- [ ] Test-buy yourself with mobile money 💰 (small amount)
- [ ] 🔗 Copy product URL → replace INSERT_SELAR_LINK in `index.html` (2 places)

## 3. Legal contact (5 min) 🔗
- [ ] Replace `INSERT_CONTACT_EMAIL` (privacy, terms, refund pages — 3 pages, 1 email each; use an email you check DAILY)

## 4. Publishing to KDP (45 min, Amazon reviews 24–72 h)
- [ ] Create kdp.amazon.com account (use real name + tax info + bank)
- [ ] Create Kindle eBook: upload `Book/Exports/Yeshurun-The-Upright-One.doc` (or new EPUB after §5)
- [ ] Upload cover `Book/Cover/Yeshurun_Cover_1600x2560.jpg`
- [ ] Details: `Book/Marketing/Book_Description.txt`
- [ ] Price $2.99–$4.99, select 70% royalty, KDP Select (optional)
- [ ] Publish. Repeat for Paperback later (1800x2700 cover + same doc)

## 5. CREATE THE SELL FILES (breaking task — do first!)
The manuscript (`Book/Manuscript/Yeshurun-Final-Manuscript.md`) only exists as Markdown.
Currently exported only .doc (KDP-acceptable). For Selar you need reader-ready files:
- [ ] Convert to PDF (Pandoc/Word export/Canva) → `Book/Exports/Yeshurun.pdf`
- [ ] Convert to EPUB (Pandoc or Scrivener/Atticus) → `Book/Exports/Yeshurun-epub`
- [ ] Put both in Book/Exports/
- [ ] Optional: add a "thank-you" first page & review-ask last page into the *direct edition*

## 6. Host files securely? — NO self-hosting needed
- Do NOT put sell files on Netlify (no access control there).
- 💰 Selar hosts the PDF/EPUB behind the checkout: buyer pays → instant download link
  + email delivery. That IS your secure automated delivery.
- KDP hosts the Kindle/paperback on Amazon with their own DRM-ish protections.

## 7. Traffic launch (day of going live)
- [ ] Replace INSERT_WHATSAPP_CONTACT in index.html + thankyou.html (wa.me/<number>?text=...)
- [ ] Post the 4 variant-tagged links (see chat guide): WhatsApp status, WhatsApp groups (adult/parents),
      IG bio, TikTok bio, first Reels/TikToks
- [ ] Ask 5 friends to test-buy / preview for social proof
- [ ] Check GA realtime + Selar dashboard that evening

## 8. Support & automation (30 min, optional but recommended)
- [ ] Create free Brevo account (brevo.com) — contact email exists there too
- [ ] (Optional) Add Brevo Conversations chat widget to index.html + thankyou.html
- [ ] (Optional later) Auto-reply template in WhatsApp Business: "Buy/delivery issue? Send
      your Selar order reference. Info: yes.gabochie.com/refund.html"
- [ ] (Optional) Selar auto-email thanks buyer with download — verify it works after test-buy

## Sell-ready definition (do not tweet until all true)
✓ GA4 live  ✓ Selar product + test-buy works  ✓ thank-you redirect works
✓ legal pages have real email  ✓ WhatsApp link live  ✓ first traffic posts sent
