KoreaSathi is a free and open-source Student Hub platform designed to centralize essential information for Nepali students living in South Korea.

The purpose of the project is to reduce confusion, misinformation, and stress by organizing important student resources into one trusted and easy-to-navigate platform.

The website provides practical guides covering the entire student journey — from preparing to arrive in Korea, settling in, finding jobs, managing visas, sending money home, and handling emergencies.

The platform also connects students with verified organizations, embassy resources, labor rights support, immigration information, community groups, and curated educational videos.

This project is built:
- by students
- for students

Main Goals:
- Centralize scattered information
- Help new students adapt faster
- Improve student safety and awareness
- Reduce exploitation and misinformation
- Provide trusted emergency resources
- Build an open community-driven knowledge base

The project is completely free, community-focused, and open-source so contributors can continuously improve guides, translations, and resources for future students.

---

## Tech Stack

- **Static site**: HTML + Tailwind CSS (CLI) + vanilla JavaScript (ES modules bundled with esbuild)
- **Hosting**: Vercel (serverless functions for API proxies)
- **Content**: Guides authored on a WordPress site (`koreasathi.wordpress.com`) and pulled at runtime via the public WordPress REST API
- **Media**: TikTok videos embedded via direct iframe; YouTube videos pulled via a serverless RSS proxy

## Project Structure

```
src/                  # Source files (edit these)
  index.html          # Home page
  pages/              # Other pages (about, guides, guide, videos, organization, contact)
  partials/           # navbar.html, footer.html (injected at runtime)
  assets/             # images, fonts
  css/input.css       # Tailwind source + custom CSS
  js/                 # main.js + modules (api, youtube, analytics, ads, pages/*, components/*, utils/*)
  data/               # tiktok-videos.js (manually curated TikTok IDs)
api/                  # Vercel serverless functions (tiktok-oembed, youtube-feed)
scripts/              # build-sitemap.js (generates robots.txt + sitemap.xml)
dist/                 # Build output (generated, gitignored) — this is what Vercel serves
```

> **Note:** `dist/` is the web root on Vercel. Never edit files in `dist/` directly — edit `src/` and rebuild.

## Build & Deploy

```bash
npm install          # install dependencies
npm run build        # build CSS + JS + copy assets + generate sitemap/robots
npm run dev          # optional: serve dist/ locally to preview (e.g. npx serve dist -p 3000)
```

`package.json` scripts:
- `build:css` — Tailwind CLI compiles `src/css/input.css` → `dist/css/styles.css`
- `build:js` — esbuild bundles `src/js/main.js` → `dist/js/main.js`
- `copy:assets` — copies `src/assets`, `src/partials`, `src/pages`, `src/index.html` → `dist/`
- `build:sitemap` — generates `dist/robots.txt` and `dist/sitemap.xml`
- `build` — runs all of the above

**Vercel config** (`vercel.json`): `buildCommand: "npm run build"`, `outputDirectory: "dist"`, `cleanUrls: true`. URL rewrites map clean paths (`/about`, `/guides`, etc.) to the built HTML files.

## Updating Content

### Guides (WordPress)
Guides are written as WordPress posts. The site fetches them at runtime, so **no rebuild is needed** to publish a new guide — just publish the post on WordPress. The sitemap is regenerated at build time and includes live guide posts.

### TikTok Videos
TikTok videos are **manually curated** (not auto-fetched) to keep the site reliable and free of API dependencies. To add a video:

1. Open `src/data/tiktok-videos.js`
2. Add an entry with the TikTok video ID (the number from the share URL, e.g. `https://www.tiktok.com/@user/video/1234567890` → `1234567890`):
   ```js
   { id: '1234567890', title: 'How to open a bank account', category: 'banking', date: '2026-07-01' }
   ```
3. Rebuild (`npm run build`) and deploy.

The video is embedded via a direct `https://www.tiktok.com/embed/v2/{id}` iframe.

### YouTube Videos
YouTube videos are fetched automatically from the configured channel via `api/youtube-feed.js` (a CORS proxy for the YouTube RSS feed). No manual updates needed — just publish on YouTube.

## Analytics

Analytics are **opt-in and disabled by default** (zero tracking until you enable it):

- **Google Analytics 4**: set `GA_MEASUREMENT_ID` in `src/js/analytics.js` to your `G-XXXX` ID. The gtag script only loads when the ID starts with `G-`.
- **Vercel Web Analytics**: enable from the Vercel dashboard (no code change needed).
- **Google Search Console**: add your property and verify using the meta tag (add it to `src/index.html` and page `<head>` sections).

## Advertisement & Sponsorship (Future Monetization)

The site is **ad-free today**. The architecture is prepared so monetization can be enabled later with minimal changes:

- `src/js/ads.js` exports `AD_SLOTS` (top / sidebar / in-article / footer) and `SPONSORS`. All slots are `enabled: false` by default.
- Placeholder containers already exist in the HTML: `data-ad-slot="top|sidebar|inarticle|footer"` and `data-sponsor-slot="footer"`.
- CSS in `src/css/input.css` hides empty slots (`.ad-slot { display: none }`) until `.is-active`, so there is **no visible whitespace** while disabled.
- To enable later: set the relevant slot `enabled: true` in `ads.js` and populate `SPONSORS` / ad code. No HTML or layout changes required.

## License

Free & open-source. See `LICENSE` for details.
