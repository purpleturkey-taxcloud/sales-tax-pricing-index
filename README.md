# Sales Tax Pricing Index

A sourced comparison of sales tax compliance pricing across the major US providers — TaxCloud, Avalara, TaxJar, Numeral, Kintsugi, Anrok, Sphere, and Zamp.

Live: https://salestaxpricingindex.org

## Disclosure

Operated by TaxCloud, Inc., a sales tax compliance provider included in the comparisons. Disclosure on every page and at [/methodology#ownership](https://salestaxpricingindex.org/methodology#ownership).

Despite the publisher relationship, every published price traces to a public source: vendor pricing pages, help-center articles, buyer-review platforms (G2, TrustRadius, Shopify App Store), or aggregator buyer data (Vendr, checkthat.ai). No price is invented. Quote-only vendors are shown as ranges from public buyer reports, not point estimates.

## Repo layout

```
calculator/   TypeScript pricing-math package; YAML-driven, one calculator per provider
  providers/  Per-provider YAML files with full plan, order-tier, filings-tier data
  src/        Math + types + YAML loader and validator

web/          Next.js 15 site
  app/        Routes: home, /{slug}-pricing, /{a}-vs-{b}-pricing, /calculator, /methodology, /changelog
  components/ Provider page, comparison page, calculator UI
  lib/        Summary prose, JSON-LD builders, buyer observations, scenarios
  public/     Static assets including llms.txt
  scripts/    build-data.ts (regenerates providers.json from YAML), check-aeo.ts (postbuild schema audit)
```

The site is statically generated. Provider data flows from `calculator/providers/*.yaml` through `web/scripts/build-data.ts` into `web/lib/data/providers.json`, which the pages read.

## Local development

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000.

The `predev` and `prebuild` hooks regenerate `web/lib/data/providers.json` from the YAML files automatically.

## Editing pricing

All prices live in `calculator/providers/{slug}.yaml`. Each numeric field carries a confidence rating (A–G) and a source URL. After editing, run `npm run dev` in `web/` and the site rebuilds the JSON data automatically.

## Build

```bash
cd web
npm run build
```

Postbuild runs `scripts/check-aeo.ts` which asserts every provider and pair page contains the required JSON-LD schemas. CI fails if a schema is missing.

## Deployment

Deployed via Vercel with `web` as the Root Directory. Required env var:

- `NEXT_PUBLIC_SITE_URL` — canonical site URL (e.g. `https://salestaxpricingindex.org`)
