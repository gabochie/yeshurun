# Website E2E Audit — Findings & Work Split

**Date:** 2026-10-28
**Scope:** `Website/` (7 HTML pages, sw.js, manifest.json, 5 cover images) + `netlify/functions/lead.js` + `netlify.toml`
**Verified live:** Selar product `selar.com/2q14gn631u` — GH¢58.13 (= $4.99), PDF+EPUB, delivery instant
**Overall verdict:** Deployable today. Funnel closes e2e. Only true placeholder left is `INSERT_KDP_LINK` (parked until KDP publish). All other placeholders (GA, Selar, WhatsApp) are resolved or have runtime fallbacks.

---

## A. MY PART (code fixes — ✅ ALL DONE 2026-10-28)

### P0 — before any more traffic
| # | Finding | File (line) | Fix |
|---|---|---|---|
| A1 | `buy_click` GA event missing on preview page's Selar buy CTA — purchases from the highest-intent page are unattributed | Website/preview.html:362 | Add GA `buy_click` event with variant dim + localStorage buy-click stamp (mirror index.html:828 `trackBuy()`) |
| A2 | `variant_view` fires unconditionally right after setting `img.src`, before load/error resolves — the load/error listeners are dead code; metric slightly inflated | Website/index.html:657-673 | Fire only on `load`/`error` after fallback; keep the guard |
| A3 | Netlify Forms hidden form declares only `name/email/whatsapp/source` — extra `variant`/`path` fields in the POST body are dropped from Netlify's form CSV (data survives only in Blobs) | Website/index.html:521-526 | Add hidden `variant` + `path` inputs to the declared form |
| A4 | Honeypot declared (`netlify-honeypot="bot-field"`) but no `bot-field` input exists → zero spam protection; function endpoint has CORS `*` and no rate limit | Website/index.html:521, netlify/functions/lead.js | Add real honeypot input; reject submissions containing it |

### P1
| # | Finding | File (line) | Fix |
|---|---|---|---|
| A5 | PWA icons are SVG-only: iOS ignores SVG `apple-touch-icon` → broken Add-to-Home-Screen icon on iPhone; manifest icon also SVG-only (some Android browsers want PNG) | Website/index.html:22, manifest.json:11-24 | Generate 192px + 512px PNGs (any + maskable) and a 180×180 Apple PNG; update manifest + all HTML pages |
| A6 | No robots.txt, no sitemap.xml, no `<link rel=canonical>`, no structured data (Product/Book schema with price) — SEO signature gaps | new files + index/preview heads | Add `robots.txt`, `sitemap.xml`, canonical links, `SoftwareApplication` JSON-LD ($4.99, Gideon Abochie) |
| A7 | OG images lack `og:image:width`/`og:image:height` → WhatsApp/Twitter sometimes renders no preview card; TikTok bio links benefit from explicit dims | index.html:15, preview.html:32 | Add width/height + type meta on both pages |
| A8 | No security headers in netlify.toml (CSP-lite, frame-ancestors, HSTS, Referrer-Policy) | netlify.toml | Add `[[headers]]` block |
| A9 | TTS pause/resume unreachable on index — after tab-hide auto-pause, next tap on Listen hits the "playing → cancel" branch and resets to start instead of resuming | Website/index.html:740-754 | Check `speechSynthesis.paused` before the playing-cancel branch; same review on preview.html:443-451 |
| A10 | README.md stale — instructs user to set GA/Selar/CONTACT placeholders that are already resolved; INSERT_CONTACT_EMAIL / INSERT_SELAR_LINK no longer exist in files | Website/README.md | Rewrite "Before Going Live" + Files sections to current reality |
| A11 | Social-proof slot: no testimonial/review block on landing (Selar shows 0 ratings) | index.html | Leave a placeholder quote row wired to be filled once first 5 reviews land (content from user, see B) |

### P2 (cheap polish, can batch with P1)
| # | Finding | File (line) | Fix |
|---|---|---|---|
| A12 | GA4 fires on page load with no consent gate — matters only if EU/UK diaspora traffic becomes significant | index.html, preview.html | Add minimal EU-consent gate (respect `?noanalytics=1` deep link already promised in privacy policy) |
| A13 | sw.js ASSETS cache list doesn't prefetch covers/ variants (runtime-cached, so offline-first visit of a variant may flash) | sw.js:2-8 | Add the 4 cover files to the install cache |

### Known non-blockers (documented, no action)
- `.gitignore` first line `.PHONY: cache\n` is corrupted Makefile syntax — harmless, cosmetic.
- Than you page fires GA `purchase` on every load; acceptable for a redirect target, GA4 dedupes lightly. Not fixing pre-launch.
- Privacy §5 garbled sentence ("clear your browser notifications…") — **needs user review** before rewrite since it's a legal claim; see B6.

### Implementation notes (2026-10-28)
- PWA icons rendered from a **reworked `icon.svg`** (original used `<text>` glyphs; this environment has no fonts, so PNGs rendered tofu — icon is now pure vector paths, a stylized gold yod י, no font dependency). PNGs: icon-192, icon-512, maskable-512 (padded), apple-touch-icon (180).
- Social proof: `#reviews` section added **hidden** with `REVIEW_QUOTE_*`/`REVIEW_NAME_*` placeholders — fill quotes, remove `hidden` (see B7).
- CSP added in netlify.toml covers GA pixel beacons (`google-analytics.com` in img-src + connect-src). `frame-ancestors 'none'`.
- GA consent guard: skipped when `?noanalytics=1`, DNT=1, or `localStorage.yeshurun_noanalytics='1'` (matches the no-analytics link promised in the privacy policy).
- sw cache bumped v8 → **v9** with covers + icon PNGs.
- Sitemap: 5 URLs (/, /preview, 3 legal pages; thankyou excluded and also Disallow'd in robots.txt).

---

# AUDIT ROUND 2 — QA / UI-UX / Copy (senior-dev pass, 2026-10-28)

## D. QA findings (code correctness after round 1)

| # | Finding | Severity | Status |
|---|---|---|---|
| D1 | **Hero frame aspect-ratio mismatch**: frame was `437/630` (tuned for the old 1200×630 landscape OG `cover.jpg`) but all A/B covers are portrait (cover-1 = 1600×2560 r=0.625, cover-2/2a/3 = 900×1350 r=0.667) → object-fit cropped ~10% of cover-1's height (risk of clipping cover art) | HIGH | ✅ Fixed: frame → `aspect-ratio: 2/3`, `object-position: 50% 50%` |
| D2 | Default hero `<img src>` was the landscape OG cover (heavy crop before JS ran) | MED | ✅ Fixed: default src → `covers/cover-1.jpg` (portrait, valid fallback) |
| D3 | `thankyou.html` fired GA `purchase` with no DNT/noanalytics guard — inconsistent with index/preview | MED | ✅ Fixed: same `GA_CONSENT_OK` guard added |
| D4 | WhatsApp share fallback in `finishLead` did `pathname.replace('index.html','preview.html')` — no-op on pretty URL `/` → shared the landing page while the message says "here's the free preview" | MED | ✅ Fixed: robust path builder (both cases) |
| D5 | `.gitignore` was one corrupted line (`Makefile` syntax inside gitignore; literal `\n` not newlines) | LOW | ✅ Fixed: real newlines, `node_modules/`, `.DS_Store`, `*.log` |
| D6 | `sw.js` had unused `HTML_PAGES` const (dead code) | LOW | ✅ Removed |
| D7 | `preview.html` cover `<img>` (that page's LCP) had no `fetchpriority` | LOW | ✅ Added `fetchpriority="high"` |
| D8 | Index had no `prefers-reduced-motion` handling (pulse animation + smooth scroll) while preview did — inconsistent a11y | LOW | ✅ Added media query (kills pulse, smooth scroll, transitions) |
| D9 | Footer/accessibility: `opacity: 0.4` small caps text = ~3.5:1 contrast, below WCAG AA | LOW | ✅ Bumped to 0.55 |
| D10 | Netlify.toml two `[[headers]] for="/*"` blocks — intentional (both apply), fine | INFO | ✅ Verified OK |
| D11 | `LINKS.website`'s `INSERT_WEBSITE_LINK` selector never matches any element (dead config) | INFO | Documented, harmless |
| D12 | Verified: no duplicate IDs, no broken `onclick` refs, selar hrefs consistent (4× index, 3× preview), preview `?v=` propagation works via applyLinks to ALL preview links incl. new modal skip link | PASS | — |

**Verification:** all inline JS syntax-checked (vm.Script), JSON-LD parses, manifest valid, sw.js + lead.js `node --check` clean.

## E. UI/UX findings

| # | Finding | Status |
|---|---|---|
| E1 | **Modal skip link was a dead close** ("No thanks, just show me the preview" only closed the modal — anti-pattern: user asked for the preview and got nothing). | ✅ Fixed: now navigates to `preview.html` (variant-tagged via applyLinks) |
| E2 | **Bottombar primary CTA lied**: 🎁 "Free Book" opened the preview lead modal — no free book exists → feels like bait, erodes trust with exactly the Gen Z audience targeted | ✅ Fixed: primary CTA is now 🛒 "Get Book" → Selar with `buy_click` tracking; the preview path stays with the 👀 Preview item + hero/not-ready sections |
| E3 | **Thankyou "START READING NOW" was a fake button** (alert: "check your email") — post-purchase page's top CTA doing nothing is the worst possible confirm-shock moment | ✅ Fixed: real link "OPEN YOUR BOOK & LINKS" → Selar product page (`thankyou_return_click` event added) |
| E4 | "JOIN THE WHATSAPP COMMUNITY" actually opened a 1:1 chat with the author | ✅ Renamed "💬 MESSAGE GIDEON ON WHATSAPP" (matches reality) |
| E5 | Success modal copy is state-aware (emailed vs unlock + name personalization) — good, kept | ✓ kept |
| E6 | Bottom sheet modal, 16px inputs (no iOS zoom), safe-area padding, tap-highlight suppression — solid mobile craft | ✓ kept |
| E7 | Focus trap in modal absent (TAB can escape behind backdrop) | Documented, fine for v1 |
| E8 | Legal-page incident round-trip (privacy §5 garbled) still awaits user approval (B6) | ⏳ manual |

## F. Copy / rhetoric audit (public-facing)

Voice IS right: prophetic, direct, Rwanda-notebook energy, Scripture-anchored, short punch lines. No rewrite needed — surgical fixes only:

| # | Finding | Fix |
|---|---|---|
| F1 | **Outdated launch rhetoric**: modal said "be first to know when the full book drops" — but the book is already live on Selar. Selling anticipation of an available product loses the close | ✅ "Read it in under 5 minutes — and join the Yeshurun reader community." |
| F2 | **Audience note leaked into public copy**: "Best for Ghana & African Diaspora" on the buy CTA reads like an internal targeting memo | ✅ "$4.99 • Mobile money & card accepted • Instant download" — payment-method copy converts better than demographics |
| F3 | **SEO title had no product name**: "Are You Still In Your Yaakov Season? \| Free Preview" — hero hook but unsearchable | ✅ "… \| Yeshurun: The Upright One — Free Preview" |
| F4 | Thankyou sub said "Downloads folder" (ambiguous — nothing was downloaded to the device) | ✅ "check your email from Selar for the PDF & EPUB download links" |
| F5 | preview.html ending heading "Your Journey Is Theirs" (grammatically confusing) | ✅ "From Striver to Beloved" (echoes its own closing line "from striver to beloved") |
| F6 | "Sound familiar?" / "limping, He's leading you" triads — rhetorically strong, KEEP as-is | kept |
| F7 | Hook→promise→proof→CTA arc on landing is coherent (Yaakov season → rename promise → Genesis 32:28 → free preview CTA), funnel sequencing in success modal (Full Book → Preview → WhatsApp) is correct order | kept |
| F8 | Optional later (not streaming-worthy): consider adding one concrete reader-outcome line on landing ("learn the Hebrew wordplay behind your name") — Selar description has richer bullets than the landing; borrow 2 of them when doing a copy iteration | backlog |

## G. Round-2 status roll-up
- Code: ✅ everything agent-side is fixed & verified (rounds 1 + 2)
- The remaining work is 100% in the manual B-list (B1–B9), unchanged
- Net new manual item: none (E7 modal focus-trap + F8 are optional backlogs)

---

# AUDIT ROUND 3 — Layout-stability / "wobble" pass (2026-10-29)

**Root causes of the wobble (2):**

| # | Cause | Fix |
|---|---|---|
| W1 | **Font swap reflow (the main wobble)**: Google Fonts CSS loaded via async `media="print"→all` hack → first paint in system fallback font, then whole page re-flowed to Poppins/Space Grotesk ~1s later when the cross-origin CSS + woff2 landed (DNS to googleapis + gstatic + download). Every visitor saw text re-fit. | ✅ **Self-hosted fonts** (`Website/fonts/`: latin-subset static Poppins 400/i400/600/700/800/900 + variable Space Grotesk 300–700, ~66KB total, OFL) + `fonts/fonts.css` with **`font-display: optional`** (zero reflow, guaranteed — late fonts never swap in) + 2-3 preload hints (SG-var, poppins-400/800). Google Fonts dep removed from index/preview/thankyou. CSP `font-src 'self'` added; `netlify.toml` serves woff2 immutable 1y; sw.js v10 precaches fonts (offline = instant, no wobble ever). Trade-off: on a very slow first uncached load, page renders once in system font (stable, converts fine); brand font guaranteed on all repeat/faster loads. |
| W2 | **Cover A/B double-download**: hero `<img>` was hardcoded `cover-1.jpg` (356KB) at parse, then JS swapped src → 75% of visitors downloaded 2 covers (cover-1 wasted) and could flash cover-1 before the variant arrived on slow networks. | ✅ Hero `<img>` now ships **srcless** (no download) + `<noscript>` cover-1 fallback for JS-less users; bottom `applyAB()` sets exactly ONE cover (the resolved variant) during parse via the AB resolver moved to `<head>` (single definition; localStorage write happens once). Same `variant_view`/error-fallback → `./cover.jpg` tracking preserved. |

**Self-hosted font manifest:** `fonts/spacegrotesk-var.woff2` (variable, one file covers SG 300–700), `fonts/poppins-{400,italic-400,600,700,800,900}.woff2`.

**Verification (automated, 2026-10-29):** all inline JS vm-compiled clean (index/preview/thankyou), JSON-LD parses, sw.js `vm.Script` clean, all 9 woff2 files valid (`wOF2` magic), all `fonts/` hrefs resolve to existing files, exactly 1 `AB` definition in index, noscript fallback present, zero googleapis.com references left. Final visual re-check rides along with B4 (Netlify + GA4 DebugView) — CLS expectation ≈ 0 now.

---

# AUDIT ROUND 4 — critical interaction-wobble + scroll-axis pass (2026-10-29)

Agent fixes (ALL DONE + verified with a real headless Chromium):

| # | Finding | Severity | Fix |
|---|---|---|---|
| X1 | `.speaking` TTS highlight on index added `border-left:3px + padding-left:12px` → live geometry change; every Listen highlight re-wrapped text and shifted all content below (the interaction wobble) | HIGH | ✅ Geometry-neutral: background tint + `outline` (no layout impact), same for h1/h2. preview.html already was layout-neutral (background-only) |
| X2 | Modal open sets `body.overflow:hidden` → on desktop the scrollbar disappears → page content re-centers horizontally (classic CLS offender) | MED | ✅ `scrollbar-gutter: stable` on html (index/preview/thankyou) — gutter reserved permanently, zero reflow |
| X3 | Horizontal-scroll guard missing entirely on preview/thankyou; index guarded on html only (iOS edge panning) | MED | ✅ `html,body { overflow-x: clip }` (with `hidden` fallback) on all 3 pages → horizontal pan/scroll impossible; vertical-only scrolling enforced |
| X4 | No `overflow-wrap: break-word` → long tokens (emails, pasted text) could force horizontal scroll | LOW | ✅ Added on all 3 pages |
| X5 | Bottom bar inconsistency the user flagged: landing bar was a floating rounded pill (18px radius, gold-glow border, desktop detached via margin-bottom) vs preview's flat solid bottom-anchored slab | UX | ✅ Unified to preview recipe: flush bottom, no radius, hairline top border, same blur 14px/opacity .92, same item metrics (10px/19px icons), desktop detach rule removed |

**Verification (headless Chromium 136, Alpine, 2026-10-29):** measured on file:// with CLS PerformanceObserver + scrollWidth checks at mobile-390 (DPR3), small-320 (DPR2), desktop-1440, CPU-rich pages loaded with fonts (self-hosted ok). Results: **CLS = 0.0000 on all page/viewport combos; after interactions (modal open/close, smooth anchor scroll, TTS toggle) CLS ≤ 0.0014, horizontal scroll = NO in every state** (`CLEAN: no hScroll, CLS<=0.02 everywhere`). Thankyou shows fonts="pending" only for the unused Space Grotesk probe — its Poppins loads, CLS stays 0.



---

## B. MANUAL PART (needs the human — accounts, money, physical/external)

### P0 — launch-critical
| # | Task | Where |
|---|---|---|
| B1 | **Verify Brevo env vars are set in Netlify** (site → Settings → Environment variables): `BREVO_API_KEY`, `BREVO_LIST_ID`, `BREVO_TEMPLATE_ID`, `SELAR_LINK` (optional), `URL`. The success message promises "a copy is on its way to your email" — if `BREVO_TEMPLATE_ID` is unset, no email is sent and the UI silently softens. If not configured: create Brevo account, import/build the 5-minute-preview email template, get API key. | Netlify dashboard + Brevo |
| B2 | **Set Selar post-purchase redirect URL** to `https://yes.gabochie.com/thankyou.html` (Needed for the GA `purchase` event to fire). | Selar dashboard → product → checkout settings |
| B3 | **Fix Selar listing title typo**: "Yeshurun :The Upright One" → "Yeshurun: The Upright One" (stray space before colon). | Selar dashboard |
| B4 | **Deploy & verify**: use Netlify **not** Drop for functions to run — needs connected repo or CLI; Drop has no build. Then (a) test lead modal submission, (b) confirm test lead appears in Brevo contacts, (c) confirm welcome email lands, (d) check GA4 DebugView for `variant_view/preview_open/lead_submit/buy_click/purchase`. | Netlify + browser |
| B5 | **Domain DNS**: confirm `yes.gabochie.com` is pointed at the Netlify site (OG tags, SW scope, and privacy policy all reference it). | DNS for gabochie.com |

### P1
| # | Task | Where |
|---|---|---|
| B6 | **Review the Privacy §5 rewrite** and any legal copy changes before re-publishing (the agent proposes cleaner wording; human approves). | Website/privacy.html |
| B7 | **Social proof pipeline**: collect first reviews (warm audience / ARC copy from Book/Selar package), pick ≤3 short quotes for a new teaser block; send to agent to paste. | WhatsApp/IG/email |
| B8 | **KDP publish** → then give agent the live link to fill INSERT_KDP_LINK (this also unblocks cover variants for KDP if cover2/2a wins — see B9). | kdp.amazon.com |
| B9 | **Watch the A/B test** in GA4 (Events: `preview_open` rate per variant) and adjudicate one winner. **Caution: cover2/cover2a say "The Yeshurun Way"** — if either wins, product copy and cover title conflict; re-render with official title before pushing that cover to Selar/KDP. | GA4 reports |

### Ongoing / reminders
- Wire `wa.me` WhatsApp community/community devo list hygiene as list grows (Brevo list id already attached in lead.js).
- Don't enroll KDP Select (blocks direct Selar sales) — per GoToMarket/Analytics/GAP_ANALYSIS.md prescient guidance.
- After launch, phase-length review of A/B group: cover2 refs "The Yeshurun Way" — do NOT deadline it into Selar/KDP until retitled.

---

## C. Possibility Snapshot (reference)
- ✅ Landing funnel: hero → modal (name+email+WhatsApp) → Blobs+Brevo → success → Selar → thankyou GA purchase
- ✅ A/B built-in: 4 cover variants, `?v=`/`utm_content` force, localStorage persistence, `preview.html?v=` continuity
- ✅ PWA: installable, offline-capable (network-first HTML; assets cache-first)
- ✅ Legal: privacy/terms/refund (Ghana Act 843, EU/UK covered, cooling-off waiver)
- ✅ Lead function: validated email, Brevo contact + welcome email, Blobs persistence, graceful degradation
- ✅ Selar: live, price-consistent ($4.99 ≈ GH¢58.13), PDF+EPUB instant delivery, WhatsApp mum contact
- ⚠️ KDP: pending (INSERT_KDP_LINK parked)
- ⚠️ Email delivery: depends on B1
- ⚠️ Analytics: code ready, depends on B4-D6
