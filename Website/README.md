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
- `cover.jpg` - Book cover
- `icon.svg` - App icon
- `manifest.json` - PWA manifest
- `sw.js` - Service worker (offline cache)

## Before Going Live
Replace `INSERT_SELAR_LINK` in `index.html` with your Selar product URL.

## Test Locally
Run a tiny local server (service workers need http, not file://):
```
cd Website && node -e "require('http').createServer((q,s)=>{const fs=require('fs');const p='.'+(q.url==='/'?'/index.html':q.url);fs.readFile(p,(e,d)=>{if(e){s.writeHead(404);return s.end('nf');}s.end(d);})}).listen(8080)"
```
Then open http://localhost:8080
