# Yeshurun - Deployable Website (PWA)

Self-contained, mobile-first direct-response landing page. Zero external asset dependencies except Google Fonts (graceful fallback to system fonts).

## Deploy (Zero Cost, 2 minutes)
1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag the entire `Website/` folder onto the page
3. Get an instant HTTPS URL (e.g. `https://yeshurun.netlify.app`)
4. (Optional) Connect a custom domain like `yeshurun.gabochie.com`

## Installable as an App (PWA)
- `manifest.json` + `sw.js` + `icon.svg` make it installable ("Add to Home Screen") and offline-capable
- Service worker caches the page, cover, and icon for repeat visits

## Files
- `index.html` - Landing/sales page
- `preview.html` - Full free preview (reader)
- `thankyou.html` - Post-purchase page (set as Selar purchase redirect; fires GA `purchase`)
- `privacy.html` / `terms.html` / `refund.html` - Legal pages (contact email is wired: gabochie@gmail.com)
- `cover.jpg` - Book cover (default/OG, 1200x630)
- `covers/cover-1.jpg` … `cover-3.jpg` - A/B test cover variants (compressed for web)
- `icon.svg` - App icon (vector, font-free)
- `icon-192.png` / `icon-512.png` / `maskable-512.png` / `apple-touch-icon.png` - PWA/iOS icon PNGs (generated from icon.svg via `sharp`)
- `manifest.json` - PWA manifest
- `sw.js` - Service worker (offline cache)
- `robots.txt` / `sitemap.xml` - SEO essentials
- `AUDIT_FINDINGS.md` - Full 2026-10-28 e2e audit: findings + agent/manual work split

## Cover A/B Test (built in)
`index.html` randomly serves one of 4 hero covers per visitor and logs
`variant_view`, `preview_open`, `lead_submit`, `buy_click` events with the
variant. Variant persists in `localStorage`; a visitor can be forced with
`?v=cover1|cover2|cover2a|cover3` (also accepts `utm_content` for social posts
so each ad/post link can pin its cover).

1. Set your GA4 Measurement ID in place of `INSERT_GA_ID` in `index.html`
2. Deploy, share links, watch GA4 `DebugView`/`Reports > Events`
3. Metric to crown a winner: `preview_open` rate per `variant`
   (secondary: `lead_submit`, `buy_click`)

Variants (`Book/Cover/AB_Variants/` holds the full-res PNGs):
| Variant | File | Position tested |
|---|---|---|
| cover1 | covers/cover-1.jpg | classic-study (adults) |
| cover2 | covers/cover-2.jpg | genz-way ("The Yeshurun Way") |
| cover2a | covers/cover-2a.jpg | teen-faith |
| cover3 | covers/cover-3.jpg | kids-parents (kids art, parent buyer) |

## A/B Test Status
GA4 Measurement ID is already set (`G-R93YEWBBFH`) in `index.html`, `preview.html`, `thankyou.html`.
Selar link is live: `https://selar.com/2q14gn631u`.
Events logged per variant: `variant_view`, `preview_open` (modal open), `lead_submit`, `buy_click` (Selar CTA on **both** landing + preview), `purchase` (thankyou redirect).
Metric to crown a winner: `preview_open` rate per `variant` (secondary: `lead_submit`, `buy_click`).
Privacy-friendly: GA is skipped when `?noanalytics=1` is present, `navigator.doNotTrack = 1`, or `localStorage.yeshurun_noanalytics = '1'` — share such links on request.

1. Deploy, share links, watch GA4 `DebugView`/`Reports > Events`
2. If either `cover2`/`cover2a` wins the test, retitle/re-render before using on Selar or KDP (those covers say "The Yeshurun Way")

Variants (`Book/Cover/AB_Variants/` holds the full-res PNGs):
| Variant | File | Position tested |
|---|---|---|
| cover1 | covers/cover-1.jpg | classic-study (adults) |
| cover2 | covers/cover-2.jpg | genz-way ("The Yeshurun Way") |
| cover2a | covers/cover-2a.jpg | teen-faith |
| cover3 | covers/cover-3.jpg | kids-parents (kids art, parent buyer) |

## Social Proof
`#reviews` section in `index.html` ships hidden with `REVIEW_QUOTE_*`/`REVIEW_NAME_*` placeholders. Once the first 3 short reviews exist, fill them and remove the `hidden` attribute on the section.

## Before Going Live (manual, remaining)
1. Verify Netlify env vars: `BREVO_API_KEY`, `BREVO_LIST_ID`, `BREVO_TEMPLATE_ID`, `SELAR_LINK` (optional), `URL` — otherwise leads persist in Blobs/logs but no welcome email is sent
2. Set Selar product post-purchase redirect to `https://yes.gabochie.com/thankyou.html`
3. Fix Selar listing title typo ("Yeshurun :The" → "Yeshurun: The")
4. Only remaining link placeholder in code is `INSERT_KDP_LINK` — fill after KDP publish
5. Deploy with Netlify (repo connected or CLI) — Drop won't serve `/.netlify/functions/lead`

See `AUDIT_FINDINGS.md` for the full agent-vs-manual split.

## Test Locally
Run a tiny local server (service workers need http, not file://):
```
cd Website && node -e "require('http').createServer((q,s)=>{const fs=require('fs');const p='.'+(q.url==='/'?'/index.html':q.url);fs.readFile(p,(e,d)=>{if(e){s.writeHead(404);return s.end('nf');}s.end(d);})}).listen(8080)"
```
Then open http://localhost:8080
