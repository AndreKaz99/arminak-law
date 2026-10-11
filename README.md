# Arminak Law, APC — website

Marketing site for **Arminak Law, APC**, a boutique litigation firm in Glendale, California.

Single-page site with an accessibility statement page, built with:

- **Vite** (static build, no framework)
- **GSAP** + **ScrollTrigger** + **SplitText** for reveals, parallax, pinning and counters
- **Lenis** for inertia scrolling
- Self-hosted fonts via Fontsource: *Cormorant Garamond* (headlines) and *Manrope* (body)

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # outputs static files to dist/
npm run preview   # serve the production build
```

Deploy `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, S3, etc.). The build uses relative paths, so it works at a domain
root or under a sub-path.

**Preview:** `.github/workflows/pages.yml` builds and deploys to GitHub Pages on every push to `claude/vibrant-ride-crkb8q`:
https://andrekaz99.github.io/arminak-law/

## Structure

```
index.html            All page content and SEO metadata (JSON-LD LegalService + Person)
accessibility.html    Accessibility statement (linked from the footer)
src/main.js           Motion, navigation, accordion, timeline, marquees, form
src/page.js           Entry for secondary pages
src/styles.css        Design tokens and all styles
public/               favicon, OG image, robots.txt, sitemap.xml, images/
```

## Content still needed from the firm

The live arminaklaw.com could not be reached while this was built. All copy comes from the project brief. Before launch:

1. **Photography.** Portraits are in place for Tamar G. Arminak, Helen Zardaryan, Arpi N. Gevorgyan, Andre Kazarian, Caroline Kazarian
   and Mary Bejanyan (`public/images/team/*.webp`, cropped to 4:5). Still needed; each card shows a monogram until its file exists:
   - `public/images/team/<first>-<last>.jpg`, portrait 4:5: `nelly-ispiryan`, `pat-harris`, `anaeis-adjemian`, `emily-bejanyan`.
   - `public/images/hero.jpg` (optional): cinematic LA skyline, at least 2400px wide, layered over the SVG illustration.
2. **Press links.** The original article URLs could not be confirmed, so each press card in the `#media` section of `index.html` links to a web
   search for that story. Replace each `href` with the exact article URL from the current *In the News* page.
3. **Logo.** `public/logo.svg` is a vector trace of the firm's swoosh mark in the site's gold. `public/favicon.svg` is the same mark on ink.
   The page uses an inline `<symbol id="logo-mark">` so the gold can shift darker on light backgrounds.
4. **Form backend.** With no endpoint set, the consultation form validates and then opens the visitor's email client with a pre-filled message
   to info@arminaklaw.com. To submit directly instead, set `data-endpoint` on `<form id="consult-form">` to a JSON-accepting endpoint
   (e.g. Formspree, Basin, or your own API).
5. **Copy review.** Have an attorney review all practice-area descriptions, results wording and the advertising disclaimer for
   California Rules of Professional Conduct (rule 7.1 et seq.) compliance.

## Style rules

- No em dashes, en dashes or hyphenated words in site copy (the phone number and proper names like Cedars-Sinai excepted).

## Motion & accessibility notes

- With `prefers-reduced-motion: reduce`, Lenis, parallax, reveals, marquees, pinning and the intro curtain are all switched off, and everything is
  visible immediately. The marquees become scrollable strips.
- If the JS bundle fails to load, an inline guard removes the hidden start states after 4s so content is never stuck invisible.
- Colors meet WCAG AA contrast. The bronze accent is darkened on light sections (`#7d5f34`, 5.2:1).
- Keyboard: skip link, visible focus rings, focus-trapped mobile menu (Esc closes it), and accordion buttons with `aria-expanded`.
  Focusing a press card scrolls the pinned rail to it.
