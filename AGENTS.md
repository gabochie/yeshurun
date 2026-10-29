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
- ~2026-10-28: Selar package built in Book/Selar/ (PDF+EPUB from build-package.js, covers portrait 1600x2560/1800x2700, upload README). Contacts wired: gabochie@gmail.com, wa.me/233243262019, IG/TikTok/YT @gideonabochie, P.O.Box SK2125 Sakumono Tema. Style guide: Website/STYLE_GUIDE.md. Only remaining placeholders: INSERT_KDP_LINK (parked until KDP publish; Selar link selar.com/2q14gn631u and GA ID G-R93YEWBBFH are live)
- ~2026-10-28: Full website e2e audit done → findings + agent/manual split in Website/AUDIT_FINDINGS.md. Agent fixes ALL DONE: preview buy_click tracking, variant_view fire-on-load fix, Netlify form variant/path/honeypot declared+submitted, PNG PWA icons (font-free vector icon.svg reworked, sharp-rendered 192/512/maskable/apple), robots.txt+sitemap.xml+canonical+Book JSON-LD, OG image dims, security headers+CSP in netlify.toml, TTS resume fix, GA noanalytics/DNT guard, sw v9 (covers+icons cached), README refreshed, hidden #reviews social-proof placeholder
- ~2026-10-28: REMAINING MANUAL (user): B1 verify Brevo env vars in Netlify (email delivery!), B2 Selar redirect→thankyou.html, B3 Selar title typo "Yeshurun :The", B4 deploy via repo-connected Netlify (not Drop) + test funnel + GA4 DebugView, B5 DNS yes.gabochie.com, B6 approve privacy §5 rewrite, B7 collect 3 reviews → unhide #reviews, B8 KDP publish → fill INSERT_KDP_LINK, B9 A/B winner adjudication (cover2/2a need retitle if win)
- ~2026-10-28: Audit round 2 (QA/UI-UX/copy senior-dev pass) ALL DONE, details in Website/AUDIT_FINDINGS.md §D/E/F: hero frame aspect fixed to 2/3 for portrait covers (cover-1 was cropping 10%), default hero src → cover-1 portrait, thankyou GA consent guard + fake "START READING NOW" alert-button → real Selar link, modal skip link → real preview, bottombar primary "Free Book" (bait) → 🛒 "Get Book"→Selar, WhatsApp share URL fixed for pretty URLs, WA community label truthful, "book drops" outdated launch copy removed, buy-CTA subtext de-memoed ($4.99 • MoMo & card), SEO title includes book name, .gitignore fixed, sw dead code removed, reduced-motion + footer contrast fixes. Remaining optional backlog: modal focus trap, borrow 2 Selar description bullets into landing copy later
- ~2026-10-29: Audit round 3 (layout-stability "wobble" pass) ALL DONE — details in Website/AUDIT_FINDINGS.md Round-3. Fonts self-hosted (Website/fonts/, `font-display: optional` + preload, Google Fonts CSS removed from index/preview/thankyou → zero font reflow), hero cover A/B now single-download (srcless img + noscript cover-1 fallback, AB resolver moved to <head>), CSP font-src 'self', woff2 immutable cache, sw v10 precaches fonts. Verified: inline JS vm-clean, JSON-LD ok, woff2 magic ok, 1 AB def. No new manual items
- ~2026-10-29: Audit round 4 (interaction-wobble + scroll-axis, critical pass) ALL DONE + verified in real headless Chromium — details in Website/AUDIT_FINDINGS.md Round-4. Fixes: .speaking TTS highlight made geometry-neutral (was border-left+padding → re-wrap wobble), scrollbar-gutter: stable (desktop scrollbar-removal shift), overflow-x clip guard html+body on all 3 pages (vertical-only scroll enforced), overflow-wrap: break-word, bottombar unified to preview's flat solid slab (user-flagged: landing pill look → flush, no radius, no desktop detach). Measured: CLS 0.0000 everywhere, ≤0.0014 after interactions, hScroll NO in all states/viewports. Headless-Chrome infra note: musl/arm env → use apk chromium + manual spawn + puppeteer.connect(browserURL) (Chrome-for-Testing binary won't exec, --single-process breaks CDP)
