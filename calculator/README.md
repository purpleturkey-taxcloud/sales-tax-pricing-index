# Sales Tax Pricing Calculator

Data layer and math engine for a public sales tax software pricing comparison calculator. Built for TaxCloud GTM.

## Quick start

```bash
npm install
npm run validate          # Validate all 8 provider YAMLs against the JSON schema
npm run confidence-report # Audit data quality by provider
npm run example           # Run the calculator against 3 sample customer profiles
```

## What's here

```
.
├── schema.yaml                       # Annotated canonical schema (human-readable docs)
├── providers/                        # 8 provider pricing files
│   ├── taxcloud.yaml                 #   first-party data (cleanest example)
│   ├── taxjar.yaml
│   ├── numeral.yaml
│   ├── kintsugi.yaml
│   ├── avalara.yaml                  #   opaque vendor, range-based estimation
│   ├── sphere.yaml
│   ├── anrok.yaml
│   └── stripe-tax.yaml
├── src/
│   ├── types.ts                      # UserInputs, ProviderEstimate, CostEstimate
│   ├── helpers.ts                    # Shared math: filings, SST eligibility, segments
│   ├── index.ts                      # Main entry point: calculate(inputs) -> ProviderEstimate[]
│   ├── example.ts                    # 3 sample customer profiles
│   ├── calculators/                  # 8 data-driven calculator functions
│   │   ├── taxcloud.ts
│   │   ├── taxjar.ts
│   │   ├── numeral.ts
│   │   ├── kintsugi.ts
│   │   ├── avalara.ts
│   │   ├── sphere.ts
│   │   ├── anrok.ts
│   │   └── stripe-tax.ts
│   └── data/                         # YAML loader + JSON Schema validator
│       ├── provider-schema.json      #   Ajv JSON Schema
│       ├── types.ts                  #   TS types matching the YAML schema
│       ├── loader.ts                 #   loadProviders() — reads + validates YAML
│       └── validator.ts              #   Ajv wrapper
├── scripts/
│   ├── validate.ts                   # CLI: validate all YAMLs (use in CI)
│   └── confidence-report.ts          # CLI: data quality report per provider
├── package.json
├── tsconfig.json
└── CLAUDE_CODE_INSTRUCTIONS.md       # Handoff doc for building the Next.js web app
```

## Status

All 8 providers are data-driven (calculator reads from YAML, not hardcoded constants). Schema-validated. Type-checked. Runnable end-to-end.

Confidence quality at last run:
- TaxCloud, Stripe Tax: 100% Primary sources
- Anrok: 92% · Sphere: 89% · TaxJar: 88% · Numeral: 86% · Kintsugi: 80%
- Avalara: 14% Primary (correctly flagged — opaque vendor; estimates come from aggregator buyer data)

## Building on top

If you're building the public-facing Next.js web app: read `CLAUDE_CODE_INSTRUCTIONS.md`. It has the full handoff brief including routes, AEO requirements, calculator UX, design constraints, and build order.

Do NOT modify `src/`, `providers/`, or the schema. Build the web app at a sibling directory (`../web/`) that imports from this package.

## Adding a new provider

1. Create `providers/<slug>.yaml` following the structure of `providers/taxcloud.yaml`
2. Create `src/calculators/<slug>.ts` following the data-driven pattern in `src/calculators/taxcloud.ts`
3. Register in `src/index.ts` CALCULATORS array with `dataDriven: true`
4. Run `npm run validate` to verify the YAML conforms to schema
5. Run `npm run confidence-report` to verify data quality
6. Run `npm run example` to verify the calculator works

## Maintenance

Pricing changes. Set up a weekly (or monthly) workflow that:
1. Refetches each provider's pricing page
2. Diffs against current YAML data
3. Drafts a `change_log` entry for material changes
4. Opens a PR for review

This is a good fit for Cowork rather than Claude Code — it's structured orchestration across web pages and file edits, not coding.
