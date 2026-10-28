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
- `privacy.html` / `terms.html` / `refund.html` - Legal pages (put a real contact email in `INSERT_CONTACT_EMAIL`)
- `cover.jpg` - Book cover (default/OG)
- `covers/cover-1.jpg` … `cover-3.jpg` - A/B test cover variants (compressed for web)
- `icon.svg` - App icon
- `manifest.json` - PWA manifest
- `sw.js` - Service worker (offline cache)

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

## Before Going Live
Replace `INSERT_SELAR_LINK`, `INSERT_GA_ID` and `INSERT_CONTACT_EMAIL` in `index.html` + `thankyou.html` + the legal pages with your Selar product URL, GA4 measurement ID, and contact email. In Selar dashboard, set the product's redirect URL after purchase to `https://yes.gabochie.com/thankyou.html`.

## Test Locally
Run a tiny local server (service workers need http, not file://):
```
cd Website && node -e "require('http').createServer((q,s)=>{const fs=require('fs');const p='.'+(q.url==='/'?'/index.html':q.url);fs.readFile(p,(e,d)=>{if(e){s.writeHead(404);return s.end('nf');}s.end(d);})}).listen(8080)"
```
Then open http://localhost:8080
