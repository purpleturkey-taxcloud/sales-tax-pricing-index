# Build Instructions — Sales Tax Pricing Calculator Web App

You are Claude Code, working inside a TaxCloud monorepo. The goal is to build a public-facing Next.js website that turns the existing TypeScript calculator into a customer-facing artifact at `taxcloud.com/pricing-calculator` (and `/vs/<competitor>` landing pages).

## What you have to work with

`./calculator/` — a complete, working data layer and math engine. Do NOT modify it. Build on top.

- `providers/*.yaml` — 8 provider pricing files, schema-validated
- `src/data/` — YAML loader (`loadProviders()`), Ajv validator, TypeScript types matching the YAML schema
- `src/calculators/*.ts` — 8 data-driven calculator functions, one per provider
- `src/index.ts` — exports `calculate(inputs: UserInputs): ProviderEstimate[]`
- `src/types.ts` — `UserInputs`, `ProviderEstimate`, `CostEstimate` (discriminated union for transparent vs. opaque pricing)
- `scripts/validate.ts` and `scripts/confidence-report.ts` — CLI tools, hook into CI

**Read these files first to understand the data model:**
1. `./calculator/schema.yaml` — annotated provider data schema
2. `./calculator/src/types.ts` — calculator input/output types
3. `./calculator/src/index.ts` — main entry point and provider registry
4. `./calculator/providers/taxcloud.yaml` — first-party YAML, cleanest example

## What you're building

A separate Next.js 15 project at `./web/` that depends on `../calculator`.

### Routes

| Route | Type | Purpose |
|---|---|---|
| `/` | SSG | Landing page. Hero, value prop, CTA to `/calculator` |
| `/calculator` | Client component | Interactive form. Real-time ranking of all 8 providers as inputs change |
| `/vs/[competitor]` | SSG, one per competitor | Comparison landing page. Critical AEO surface |
| `/methodology` | SSG | Confidence rating system, source priority, how the data is maintained |
| `/changelog` | SSG | Public log of pricing changes pulled from each provider's `change_log` field |

### Build-time data loading

Load YAML once at build time using `loadProviders()`. Serialize to JSON. Pass to client components as static props. **Do not parse YAML at runtime in the browser.**

```typescript
// app/lib/load-providers-server.ts
import 'server-only';
import { loadProviders } from '../../../calculator/src/data/loader';
export const providerData = loadProviders();

// app/calculator/page.tsx
import { providerData } from '../lib/load-providers-server';
const serialized = Object.fromEntries(providerData);
// pass to client as JSON via React Server Component → client boundary
```

## AEO requirements (non-negotiable on `/vs/[competitor]` pages)

These are what makes the pages LLM-citable. Skip none of them.

1. **Prose summary at the top** answering the literal query "How much does {Competitor} cost?" in 2-3 sentences. This is what gets quoted by LLMs. Generate it from the YAML data, not hand-written.

2. **JSON-LD on every comparison page**, generated server-side:
   - `Product` schema for the competitor with `Offer` for each plan
   - `Product` schema for TaxCloud as the comparison anchor
   - `FAQPage` schema with at least 5 literal-query Q&As ("How much does X cost?", "Is X SST certified?", "What's the cheapest X plan?", "Does X charge per filing?", "How does X compare to TaxCloud?")
   - `Table` schema for the pricing comparison table

3. **HTML tables, never images.** LLMs can't reliably parse pricing from images.

4. **"Last updated" prominently displayed** at top of each page. Read from the YAML's `sources[].accessed_date` — use the most recent.

5. **Inline source citations** with hyperlinks. Every dollar figure on the page should be traceable to a source URL from the YAML.

6. **A "Why trust this data?" link** in the footer of every comparison page, deep-linking to `/methodology`.

### Comparison page content structure (per `/vs/[competitor]`)

```
<h1>TaxCloud vs {Competitor} pricing comparison</h1>
<p class="updated">Last updated {date}</p>

<section class="summary">
  <p>How much does {Competitor} cost? {generated summary from YAML}</p>
</section>

<section class="cost-comparison-calculator">
  <!-- Embedded mini-calculator scoped to TaxCloud + this competitor -->
</section>

<section class="pricing-table">
  <!-- Detailed HTML table: plans, monthly price, per-filing, per-registration, transaction fees -->
</section>

<section class="transparency-comparison">
  <!-- Visual: TaxCloud transparency tier vs competitor's, with rationale from YAML -->
</section>

<section class="hidden-fees">
  <!-- Pulled from `add_ons.other_fees` and YAML `notes` -->
</section>

<section class="faq">
  <!-- FAQPage schema source - 5+ Q&As -->
</section>

<section class="sources">
  <!-- All sources from competitor's YAML, hyperlinked -->
</section>
```

## Calculator UX (the `/calculator` page)

Inputs from `UserInputs`. Map each to the right control:

| Input | Control |
|---|---|
| `monthlyOrders` | Slider with logarithmic scale, snap to common values (100, 500, 1K, 5K, 10K, 50K, 100K, 500K+) |
| `monthlyTransactionVolumeUSD` | Slider with log scale, snap to ($10K, $100K, $1M, $10M, $100M+) |
| `annualRevenueUSD` | Slider with log scale, snap to ($500K, $1M, $5M, $25M, $100M, $500M+) |
| `statesFiling` | Number stepper (0-50) |
| `statesPhysicalNexus` | Number stepper, capped at `statesFiling` |
| `filingFrequency` | Segmented control: Monthly / Quarterly / Annual |
| `registrationBacklog` | Number stepper (0-50) |
| `integrationType` | Dropdown |
| `requiresApiAccess` etc. | Toggle switches |
| `billingCadence` | Segmented: Monthly / Annual |

**Results display** below the form:
- Stacked card list, sorted by sortableCost (which `calculate()` returns sorted)
- Each card shows: provider name, transparency tier badge, estimate (with range or "Quote required" rendering as appropriate), recommended plan, top 2 assumptions, top 1 caveat, "See full comparison →" link to `/vs/<slug>`
- TaxCloud's card gets a subtle highlight (border or badge), no need to be heavy-handed about it
- Expandable section per card showing full assumptions and caveats

## Design and styling

- **Tailwind CSS** for everything. No CSS modules, no styled-components.
- **shadcn/ui** for primitives (button, card, slider, switch, dropdown). `npx shadcn-ui@latest init` early.
- **Mobile-first.** Most prospects will hit this from LinkedIn on phones.
- Match TaxCloud brand: clean, professional, dark text on light backgrounds, accent green for CTAs and TaxCloud-specific elements. Do not use heavy gradients or playful illustrations — finance buyers want sober.
- Use the **frontend-design skill** at `/mnt/skills/public/frontend-design/SKILL.md` if available for design tokens.

## Tech stack and conventions

- **Next.js 15** with App Router
- **TypeScript strict mode**
- **Tailwind CSS** + **shadcn/ui**
- **Vercel** deployment target (include `vercel.json` if needed)
- **TypeScript path aliases**: `@calculator/*` → `../calculator/src/*`
- **No new dependencies** beyond Next.js, Tailwind, shadcn/ui, and the existing calculator package
- **Static generation** wherever possible. Calculator page is the only one that's client-interactive.

## Build order

1. **Read context**: schema.yaml, src/types.ts, src/index.ts, providers/taxcloud.yaml
2. **Propose file structure** before writing code. Wait for confirmation.
3. **Scaffold Next.js app** at `./web/` with Tailwind and shadcn/ui
4. **Wire the data layer**: server-side YAML loading, JSON serialization for client
5. **Build `/calculator`** first — most complex page, validates the data flow
6. **Build `/vs/[competitor]`** template, generate static pages for all 7 competitors
7. **Build `/methodology`** and `/changelog` (mostly static content from YAMLs)
8. **Build `/`** landing page last (depends on knowing what the rest looks like)
9. **Add JSON-LD generation** as a server-side utility, render in `<head>` per page
10. **Validate**: `npm run build` clean, no TypeScript errors, all routes render

## Definition of done

- `npm run build` completes with no errors
- All 8 routes render correctly (1 landing + 1 calculator + 7 vs/comparisons + methodology + changelog = 11 pages)
- Calculator updates results in <100ms as inputs change
- Every `/vs/<competitor>` page has valid JSON-LD (test with Google's Rich Results test tool)
- Every page has a "Last updated" date sourced from YAML
- Mobile layout works at 375px width minimum
- Lighthouse score >90 on performance, accessibility, SEO
- No client-side YAML parsing

## What NOT to build in this pass

Defer the following — add a TODO in the README:

- Authentication / user accounts
- Saved calculator inputs / shareable URLs (nice-to-have, but not v1)
- Analytics integration (PostHog/GA — add after launch)
- A/B testing infrastructure
- Animation flourishes or interactive illustrations
- More than the 8 currently-populated providers

## Questions to ask before starting

If you're unsure about any of these, ask the human before building:
1. Domain / subdomain (taxcloud.com/pricing-calculator vs. pricing.taxcloud.com)?
2. Existing TaxCloud design system or component library to reuse?
3. Analytics / pixel requirements before launch?
4. Legal review needed before publishing competitor comparisons?

When in doubt, build the minimum, ship behind a preview URL, iterate.
