# Yeshurun Brand Style Guide & Design Tokens

Global source of truth for the *Yeshurun: The Upright One* ecosystem:
`yes.gabochie.com`, `studio.gabochie.com` pages, Selar listing, email/newsletters,
WhatsApp assets, future books.

Use values exactly as written. When in doubt, less color, more space.

---

## 1. Brand essence
- **One-line brand:** "Still in your Yaakov season?"
- **Voice:** intimate, scripture-anchored, direct second person, hopeful not preachy.
- **Tone by surface:** TikTok/Reels = raw & encouraging · Landing page = cinematic/emotive ·
  Legal/founder = clear and honest · Email = warm, short, no hype.
- **Never:** clickbait that misrepresents, promises of deliverance, guilt-inducing framings.

## 2. Color tokens (CSS custom props on all pages)
| Token | Value | Use |
|---|---|---|
| `--bg` | `#050510` | page background (dark) |
| hero glow | `radial-gradient, #1a0b2e → #050510 → #000000` | body background |
| `--gold` | `#FFD93B` | primary accent, CTA gradients, headings |
| `--gold-soft` | `#FFB13B` | CTA gradient end |
| `--pink` | `#FF6B9D` | gradient middle stop, highlight accents |
| `--purple` | `#A855F7` | gradient end, glow orbs |
| `--text` | `#FFFFFF` | body text |
| `--text-sub` | `rgba(255,255,255,0.85)` | secondary text |
| rule/underline dim | `rgba(255,255,217,0.55)` | ghost buttons on gold |
| surfaces | `rgba(255,255,255,0.06–0.08)` + border `rgba(255,255,255,0.08–0.25)` | cards, modals |

**Signature gradient** (headings, hero words): `linear-gradient(135deg, #FFD93B 0%, #FF6B9D 48%, #A855F7 100%)`

## 3. Typography
- Display/headings: **Space Grotesk** (700) — landing hero, chapter numerals.
- UI/body: **Poppins** (400, 600–900) — everything else; system-ui fallback always declared.
- Web font URI: `https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&family=Space+Grotesk:wght@400;600;700&display=swap`
- Scale (mobile-first):
  - hero h1: `clamp(34px, 9vw, 92px)` / line-height 0.98 / letter-spacing −0.03em
  - section h2: `clamp(26px, 6vw, 48px)`
  - body lead `clamp(16px, 3.8vw, 24px)`, body `14.5–16px/1.7`
  - bottom bar/bottom caps: `11px`, uppercase, `letter-spacing 0.2–0.32em`
- Book interiors (PDF/EPUB): serif stack `Georgia, 'Times New Roman', serif`; ink `#241D13`
  on cream `#FBF6EC`; accent gold (print-safe) `#8A6D1F`; Hebrew `dir="rtl" lang="he"`,
  Noto Serif Hebrew (reader-side font).

## 4. Shape & texture
- radii: pills 999px · buttons/cards 14–28px
- borders: 1px gold for accents, else rgba-white 1px
- glow orbs: radial purple/gold at 0.12–0.35 alpha, positioned behind headings
- CTA primary: gradient gold→amber, dark ink text `#1a1206`, padding `16px 34px`,
  hover `translateY(-3px) scale(1.02)`, shadow `0 16px 44px rgba(0,0,0,0.55), 0 0 60px rgba(255,217,59,0.35)`
- ghost CTA: `rgba(255,255,255,0.08)` bg + gold 1px border + white text

## 5. Iconography & glyphs
- Emoji allowed sparingly in marketing copy — keep to 🔥 📖 👀 → 🙌 ⚡ 🕊 ✡
- SVG inline (WhatsApp icon, close ✕, arrows) preferred over icon fonts.
- Hebrew text always rendered correctly (`utf-8`, `dir="rtl"` spans in EPUB/web); in PDF builds niqqud is stripped and order reversed visually — never paste raw reversed Hebrew.

## 6. Assets
- Covers: `Book/Cover/AB_Variants/cover-{1,2,2a,3}.png` (1024×1536 sources)
- Web: `Website/covers/cover-*.jpg` (900×1350 ≤200KB)
- Selar/KDP: `Book/Selar/cover/Yeshurun-Cover-Selar.jpg` (1600×2560) ·
  `Book/Cover/Yeshurun_Cover_1800x2700.jpg` (paperback)
- OG/social: `Website/cover.jpg` (brand cover 1 image)
- Favicons: `Website/icon.svg`
- A/B mapping: cover1 = classic-study · cover2 = genz-way · cover2a = teen-faith · cover3 = kids-parents

## 7. Links & routing (single source of truth)
- Selar product: `INSERT_SELAR_LINK` (index.html) → replace with real URL after upload
- Post-purchase: `https://yes.gabochie.com/thankyou.html` (set in Selar dashboard)
- WhatsApp/community: `https://wa.me/233243262019`
- Socials: IG/TikTok/YouTube — `@gideonabochie`
- Contact email: **gabochie@gmail.com**
- Postal: P.O. Box SK2125, Sakumono, Tema, Ghana
- Legal pages: `/privacy.html` · `/terms.html` · `/refund.html`
