# Yeshurun Project

## Goal
Publish "Yeshurun: The Upright One" (KDP ebook + paperback) plus direct digital sales for Ghana and the global African diaspora, via a mobile-first zero-cost funnel.

## Author
Pen name: **Gideon Abochie**

## Status
Assets complete (manuscript, cover, exports, landing page, preview). Execution pending - KDP publish + Selar launch + marketing.

## Current Focus
- Phase 1 (KDP): finish cover at exact dimensions, export DOCX, publish to KDP (1.5-1.6)
- Zero-cost GTM: launch Selar + Gen Z landing page + free preview lead magnet
- Mobile-first traffic: TikTok / WhatsApp / IG Reels

## Project Structure
- `Book/` - Publication package
  - `Manuscript/Yeshurun-Final-Manuscript.md` - Final manuscript
  - `Manuscript/archive/` - Old booklet drafts
  - `Cover/` - Cover image + Cover_Specs.txt
  - `Exports/` - DOCX/interior exports
  - `Marketing/Book_Description.txt` - KDP copy, keywords, categories
  - `README_PUBLISH.txt` - Publishing guide
- `GoToMarket/` - Strategy & plans
  - `TodoList/EXECUTION_TODO.md` - Phased execution plan
  - `Funnel/CHANNELS_PAYMENT_STRATEGY.md` - Channels + payment gateways
  - `Analytics/GAP_ANALYSIS.md`
  - `LeadMagnet/` - Preview source, exports, and how-to docs
- `Website/` - Deployable PWA direct-response landing page
  - `index.html` - Sales/landing page
  - `preview.html` - Free preview reader
  - `cover.jpg`, `icon.svg`, `manifest.json`, `sw.js` - PWA assets
  - `README.md` - Deploy instructions (Netlify Drop)
- `PRE_GTM_TODOS.md` - Condensed pre-GTM checklist + gateway comparison

## Key Decisions
- **Author pen name:** Gideon Abochie
- **Direct sales (fastest):** Selar.co (Ghana mobile money + diaspora cards, instant delivery)
- **Own-site gateway (later):** Paystack
- **Backup:** Hubtel; also compared Flutterwave, Stripe
- **Marketing:** Mobile-first (TikTok/WhatsApp) targeting 18-35 Ghana + African diaspora
- **Lead magnet:** Gen Z hook-driven free preview ("Are you still in your Yaakov season?")

## Notes
- Prefer direct sales for better margins; also publish on KDP for discovery
- Update todo lists as items are completed
- Cover image current file is 1200x630 (landscape OG ratio); KDP needs 1600x2560 (eBook) and 1800x2700 (paperback) portrait
- ~2026-10-28: Covers A/B test live in Website: 4 variants (covers/cover-1..3.jpg), GA4 events variant_view/preview_open/lead_submit/buy_click, `?v=coverX` + utm_content override. Source PNGs in Book/Cover/AB_Variants/
- ~2026-10-28: Positioning insight - covers split into 3 audiences (adult study / Gen Z "The Yeshurun Way" / kids-with-parents-buyer, Cover 3 style). Parent confirmed as buyer for kids angle
- Title conflict: Cover 2/2a say "The Yeshurun Way" vs ebook listing "Yeshurun: The Upright One" - if used on KDP/Selar must retitle product or re-render cover with official title
