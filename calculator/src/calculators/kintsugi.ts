// =============================================================================
// kintsugi.ts — Kintsugi cost estimator (data-driven)
// Source: providers/kintsugi.yaml
//
// Math kept in TS:
//   - Plan selection (Free/Starter/Premium based on features)
//   - Premium custom-quote handling with Starter-equivalent floor
//
// Data sourced from YAML:
//   - Plan list and is_quote_only flags
//   - filings.base_cost ($75)
//   - registrations.base_cost ($75 — half of Numeral)
//   - SST CSP status (false)
// =============================================================================

import type { ProviderData } from '../data/types';
import type { ProviderEstimate, UserInputs } from '../types';
import { roundDollars, totalFilingsPerYear } from '../helpers';

function pickPlanSlug(inputs: UserInputs): 'free' | 'starter' | 'premium' {
  if (
    inputs.requiresApiAccess ||
    inputs.requiresInternationalVatGst ||
    inputs.requiresVdaSupport
  ) {
    return 'premium';
  }
  if (inputs.statesFiling === 0 && inputs.registrationBacklog === 0) {
    return 'free';
  }
  return 'starter';
}

export function calculateKintsugi(inputs: UserInputs, data?: ProviderData): ProviderEstimate {
  if (!data) {
    throw new Error('calculateKintsugi requires ProviderData loaded from providers/kintsugi.yaml');
  }

  const planSlug = pickPlanSlug(inputs);
  const plan = data.plans.find((p) => p.slug === planSlug);
  if (!plan) throw new Error(`Kintsugi plan '${planSlug}' not found in YAML data.`);

  const perFilingCost = data.filings.base_cost.amount ?? 0;
  const perRegistrationCost = data.registrations.base_cost.amount ?? 0;
  const baseSources = data.sources.map((s) => s.url);

  if (planSlug === 'free') {
    return {
      provider: data.provider.name,
      slug: data.provider.slug,
      transparencyTier: data.transparency.tier,
      recommendedPlan: plan.name,
      estimate: { type: 'exact', annualCostUSD: 0 },
      breakdown: { subscription: 0, filings: 0, registrations: 0, transactions: 0, addOns: 0, implementation: 0 },
      assumptions: ['No filings or registrations required — Free monitoring tier sufficient'],
      caveats: [`Once you need to file, you move to Starter at $${perFilingCost}/filing.`],
      sources: baseSources,
    };
  }

  const totalFilings = totalFilingsPerYear(inputs);

  if (planSlug === 'starter') {
    const filings = totalFilings * perFilingCost;
    const registrations = inputs.registrationBacklog * perRegistrationCost;
    const annualCost = filings + registrations;

    const assumptions = [
      'Plan: Starter (no subscription fee, no implementation fee)',
      `${totalFilings} filings/year × $${perFilingCost}`,
      `${inputs.registrationBacklog} registrations × $${perRegistrationCost}`,
      `Per-registration rate $${perRegistrationCost} is notably half of Numeral's $150`,
    ];

    const caveats: string[] = [];
    if (!data.sst.is_csp) {
      caveats.push(`${data.provider.name} is not an SST CSP. full $${perFilingCost}/return applies in all states including SST members.`);
    }
    if (totalFilings >= 60) {
      caveats.push(
        `At ${totalFilings} filings/year, per-filing cost compounds. SST-certified providers eliminate filing fees in up to 24 states for eligible customers.`,
      );
    }

    return {
      provider: data.provider.name,
      slug: data.provider.slug,
      transparencyTier: data.transparency.tier,
      recommendedPlan: plan.name,
      estimate: { type: 'exact', annualCostUSD: roundDollars(annualCost) },
      breakdown: { subscription: 0, filings, registrations, transactions: 0, addOns: 0, implementation: 0 },
      assumptions,
      caveats,
      sources: baseSources,
    };
  }

  // Premium — quote required with Starter-equivalent floor
  const starterFloor = totalFilings * perFilingCost + inputs.registrationBacklog * perRegistrationCost;

  const caveats: string[] = [
    'Premium custom pricing structure not publicly disclosed.',
    `${data.provider.name} is not an SST CSP.`,
  ];
  if (data.provider.parent_company === null && data.notes?.includes('Vertex')) {
    caveats.push('Vertex Inc. holds a reported 10% strategic stake — consider for multi-year compliance partnerships.');
  }

  return {
    provider: data.provider.name,
    slug: data.provider.slug,
    transparencyTier: data.transparency.tier,
    recommendedPlan: plan.name,
    estimate: {
      type: 'quote_required',
      startingAtUSD: roundDollars(starterFloor),
      message:
        'Premium plan is custom-quoted with flat-rate pricing + volume discount. Floor shown is Starter-plan equivalent before Premium feature uplift.',
    },
    assumptions: [
      'Premium plan required by your selected features (API / international / VDA).',
      `Starter-plan equivalent floor: ${totalFilings} filings × $${perFilingCost} + ${inputs.registrationBacklog} registrations × $${perRegistrationCost}`,
    ],
    caveats,
    sources: baseSources,
  };
}
