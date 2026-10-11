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

1. **Photography.** Portraits are in place for every team member except Emily Bejanyan, whose card shows her initials
   (`public/images/team/*.webp`, cropped to 4:5). To add hers, save a 4:5 portrait to `public/images/team/` and add
   `<img src="images/team/<file>" width="560" height="700" alt="" loading="lazy" decoding="async" />` after her card's `member__mono` span.
   - Pat Harris's source photo is small (417x448), so his crop is upscaled; a higher resolution headshot would look sharper.
   - Hero photo (optional): save a cinematic LA skyline (2400px+ wide) as `public/images/hero.jpg` and add
     `<img class="hero__photo" src="images/hero.jpg" alt="" fetchpriority="high" decoding="async" />` inside `.hero__media`, before
     `.hero__veil`. It picks up the same parallax and overlay.
2. **Press links.** All press cards link to the original articles.
3. **Logo.** `public/logo.svg` is a vector trace of the firm's swoosh mark in the site's gold. `public/favicon.svg` is the same mark on ink.
   The page uses an inline `<symbol id="logo-mark">` so the gold can shift darker on light backgrounds.
4. **Form backend.** With no endpoint set, the consultation form validates and then opens the visitor's email client with a pre-filled message
   to info@arminaklaw.com. To submit directly instead, set `data-endpoint` on `<form id="consult-form">` to a JSON-accepting endpoint
   (e.g. Formspree, Basin, or your own API).
5. **Copy review.** Have an attorney review all practice-area descriptions, results wording and the advertising disclaimer for
   California Rules of Professional Conduct (rule 7.1 et seq.) compliance.

## Style rules

- No em dashes, en dashes or hyphenated words in site copy (the phone number and proper names like Cedars-Sinai excepted).

## Accessibility (WCAG 2.2 AA)

The site is built and tested to WCAG 2.2 Level AA, the standard used for ADA web compliance. Verified with axe-core (zero
violations on both pages, desktop and phone, with and without reduced motion) plus scripted manual checks:

- **Keyboard:** every control is reachable in order with a visible focus ring. Because smooth scrolling replaces the
  browser's scroll-into-view, a `focusin` handler in `src/main.js` jumps the page so the focused control is never off screen,
  still fading in, or hidden under the sticky header or phone contact bar (2.4.7, 2.4.11).
- **Motion:** the scrolling strips have a **Pause motion** button that pauses all automatic movement site-wide and is remembered
  per visitor (2.2.2). Other decorative loops stop within five seconds. `prefers-reduced-motion` turns off smooth scrolling,
  parallax, reveals, pinning and the intro.
- **Screen readers:** headline line splitting keeps the real text exposed; animated counters announce their final values;
  the mobile menu is a focus-trapped dialog with the rest of the page made `inert`; links that open a new tab say so.
- **Forms:** persistent labels, optional field marked, errors tied to each field with `aria-invalid`/`aria-describedby`, and
  a single polite status summary. Field underlines meet 3:1 non-text contrast (1.4.11).
- **Reflow and text spacing:** no horizontal scrolling at 320px or at 200% zoom, including with WCAG text-spacing
  overrides applied (1.4.10, 1.4.12).
- If the JS bundle fails to load, an inline guard removes the hidden start states after 4s so content is never stuck invisible.

Automated and scripted testing cannot cover everything; a periodic check with a real screen reader (VoiceOver, NVDA) is
recommended, and the statement at `accessibility.html` gives visitors a way to report barriers.
