# Sales Tax Pricing Index — web

Independent, sourced comparison of sales tax compliance pricing. Built on top of
the `../calculator/` package; do not duplicate pricing math here.

## Architecture

```
web/
├── scripts/build-data.ts     # prebuild: YAML → lib/data/providers.json
├── scripts/check-aeo.ts      # postbuild: assert JSON-LD on every public page
├── lib/                      # client/server-safe helpers (no YAML at runtime)
│   ├── data/providers.ts     # imports providers.json, exposes typed Map
│   ├── jsonld/               # Product, FAQPage, Table builders
│   ├── summary.ts            # YAML → "How much does X cost?" prose
│   └── comparison-summary.ts # YAML → "How does X compare to Y?" prose
├── components/
│   ├── calculator/           # client island — only `'use client'` here
│   ├── provider/             # single-provider page sections
│   ├── comparison/           # pairwise page sections
│   └── site/                 # shell (header, footer, updated badge)
└── app/                      # Next 15 App Router
    ├── p/[slug]/             # ← rewrite from /{slug}-pricing
    ├── c/[pair]/             # ← rewrite from /{a}-vs-{b}-pricing
    ├── calculator/           # interactive ranking, one client island
    ├── methodology/          # AEO trust surface, ownership disclosure
    ├── changelog/            # aggregated YAML change_log entries
    ├── sitemap.ts            # 40 static routes
    └── robots.ts             # crawler rules + sitemap pointer
```

## Build & deploy

```bash
npm install            # also runs in ../calculator/ on first setup
npm run dev            # localhost:3000 (or :3100 if 3000 is taken)
npm run build          # prebuild + next build + AEO postbuild
npm run start          # serve the production build
```

### Required env var

`NEXT_PUBLIC_SITE_URL` — the canonical domain (e.g. `https://salestaxpricingindex.org`).
Used for `metadataBase`, every JSON-LD `url`/`canonical` field, OG card URLs, and
the sitemap. Defaults to `http://localhost:3000` for local dev.

Set it in Vercel project settings (or the deploy platform of your choice) before
running `npm run build` in production. Build output bakes the URL into static
HTML; rebuild after changing it.

### Data flow

1. `npm run build` triggers `prebuild`, which runs `scripts/build-data.ts`.
2. That script calls `loadProviders()` from `../calculator/src/data/loader.ts`,
   validates each YAML via the Ajv schema, and writes `lib/data/providers.json`.
3. All app routes import the JSON statically. **No YAML or `fs` calls reach the
   client bundle.**
4. The `/calculator` page passes the providers map to a `'use client'`
   component, which calls `calculate()` via `lib/calc-client.ts` (a wrapper
   that imports only the math functions, not the loader).
5. `postbuild` runs `scripts/check-aeo.ts`, which asserts every
   `/{slug}-pricing` and `/{a}-vs-{b}-pricing` page emits Product + FAQPage
   (≥5 Q&As) + Table JSON-LD and a visible "Last updated" string. CI red on
   any miss.

### URL rewrites

Public URLs are keyword-loaded (`/anrok-pricing`, `/anrok-vs-taxjar-pricing`).
Internal route files live at `app/p/[slug]/` and `app/c/[pair]/`. The mapping
is in `next.config.ts`:

- Rewrite: `/:slug-pricing` → `/p/:slug`
- Rewrite: `/:pair-pricing` → `/c/:pair`
- Redirect: `/p/:slug` → `/:slug-pricing` (308, prevents duplicate-content)
- Redirect: `/c/:pair` → `/:pair-pricing` (308)

## Adding a new provider

The web app picks up new providers automatically once they're in `../calculator/`:

1. Add `providers/<slug>.yaml` per the schema.
2. Add `src/calculators/<slug>.ts` and register it in `src/index.ts`.
3. From `web/`, run `npm run dev` — the prebuild picks up the new YAML, the new
   slug auto-appears in `PROVIDER_SLUGS`, and Next regenerates:
   - `/<slug>-pricing` provider page
   - 7 new pair pages (one for each existing provider)
   - new entries in the sitemap, homepage grid, and "vs other providers" links

## Branding

This site does **not** brand as TaxCloud. TaxCloud's ownership is disclosed on
`/methodology#ownership` and in the footer of every page — that's the
credibility marker — but the visual identity, tone, and product framing are
neutral. All 8 providers render with equal weight. No TaxCloud color, no
TaxCloud logo, no TaxCloud-as-anchor framing on comparison pages.

## Deferred (not built in v1)

Out of scope for the initial launch. Each is independent and addable later:

- Authentication / user accounts
- Saved calculator inputs / shareable URLs
- Analytics integration (PostHog, GA)
- A/B testing infrastructure
- Animation flourishes
- More than the 8 currently-populated providers
- Per-page OG card images (currently a single shared default)
- Automated weekly provider-pricing diff workflow (see `../calculator/README.md`)
