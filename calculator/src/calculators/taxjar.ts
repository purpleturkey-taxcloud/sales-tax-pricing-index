// =============================================================================
// taxjar.ts — TaxJar cost estimator (data-driven)
// Source: providers/taxjar.yaml
//
// Math kept in TS:
//   - Plan selection (which features push to Professional)
//   - Order tier selection (with API call inflation rule)
//   - Annual discount math
//
// Data sourced from YAML:
//   - Plan list, monthly prices, order tier ladders
//   - per_filing_cost_override per plan (Starter $50, Professional $55)
//   - per_registration_cost_override per plan
//   - Included filings per plan
//   - Annual discount %
// =============================================================================

import type { OrderTier, Plan, ProviderData } from '../data/types';
import type { ProviderEstimate, UserInputs } from '../types';
import { applyAnnualDiscount, roundDollars, totalFilingsPerYear } from '../helpers';

function pickPlanSlug(inputs: UserInputs): 'starter' | 'professional' {
  if (
    inputs.requiresApiAccess ||
    inputs.requiresExemptionCertificateMgmt ||
    inputs.statesFiling >= 5
  ) {
    return 'professional';
  }
  return 'starter';
}

function findPlan(data: ProviderData, slug: string): Plan {
  const plan = data.plans.find((p) => p.slug === slug);
  if (!plan) throw new Error(`TaxJar plan '${slug}' not found in YAML data.`);
  return plan;
}

function pickOrderTier(plan: Plan, monthlyOrders: number, monthlyApiCalls?: number): OrderTier {
  if (!plan.order_tiers || plan.order_tiers.length === 0) {
    throw new Error(`TaxJar plan '${plan.slug}' has no order_tiers configured.`);
  }
  // 1 API call = 1/10 of an order for tier purposes on Professional
  const apiOrderEquivalent = Math.floor((monthlyApiCalls ?? 0) / 10);
  const effectiveOrders = monthlyOrders + apiOrderEquivalent;
  for (const tier of plan.order_tiers) {
    if (effectiveOrders <= tier.included_orders) return tier;
  }
  return plan.order_tiers[plan.order_tiers.length - 1];
}

export function calculateTaxjar(inputs: UserInputs, data?: ProviderData): ProviderEstimate {
  if (!data) {
    throw new Error('calculateTaxjar requires ProviderData loaded from providers/taxjar.yaml');
  }

  const planSlug = pickPlanSlug(inputs);
  const plan = findPlan(data, planSlug);
  const orderTier = pickOrderTier(plan, inputs.monthlyOrders, inputs.monthlyApiCalls);

  const annualDiscountPct = plan.annual_price.discount_pct_vs_monthly ?? 0;
  const perFilingCost = plan.per_filing_cost_override ?? data.filings.base_cost.amount ?? 0;
  const perRegistrationCost = plan.per_registration_cost_override ?? data.registrations.base_cost.amount ?? 0;
  const includedFilings = plan.included_filings_per_period?.count ?? 0;

  // Prefer the tier's explicit annual_price when annual billing is selected —
  // TaxJar's effective annual discount is non-uniform across tiers (~10% at
  // the entry tier, ~16-18% at higher tiers), so a flat percentage misses it.
  const subscription =
    inputs.billingCadence === 'annual' && typeof orderTier.annual_price === 'number'
      ? orderTier.annual_price
      : applyAnnualDiscount(orderTier.monthly_price, annualDiscountPct, inputs.billingCadence);

  const totalFilings = totalFilingsPerYear(inputs);
  const billableFilings = Math.max(0, totalFilings - includedFilings);
  const filings = billableFilings * perFilingCost;

  const registrations = inputs.registrationBacklog * perRegistrationCost;

  const annualCost = subscription + filings + registrations;

  const assumptions = [
    `Plan: ${plan.name}`,
    `Order tier: up to ${orderTier.included_orders} orders/mo at $${orderTier.monthly_price}/mo`,
    `Annual billing: ${inputs.billingCadence === 'annual' ? `${annualDiscountPct}% discount applied` : 'No annual discount'}`,
    `${billableFilings} billable filings/year at $${perFilingCost} after ${includedFilings} included credits`,
    `Registrations: ${inputs.registrationBacklog} × $${perRegistrationCost}`,
  ];

  const caveats: string[] = [];
  if (planSlug === 'professional' && (inputs.monthlyApiCalls ?? 0) > 0) {
    const apiOrderEquivalent = Math.floor((inputs.monthlyApiCalls ?? 0) / 10);
    caveats.push(
      `API calls count as 1/10 of an order toward your tier. ${inputs.monthlyApiCalls} API calls/mo = +${apiOrderEquivalent} effective orders.`,
    );
  }
  const tiers = plan.order_tiers ?? [];
  if (tiers.length > 0 && orderTier === tiers[tiers.length - 1] && inputs.monthlyOrders > orderTier.included_orders) {
    caveats.push(
      `Order volume (${inputs.monthlyOrders}/mo) exceeds modeled tier. Higher tiers exist but ladder not yet fully captured — verify on TaxJar pricing page.`,
    );
  }
  caveats.push('Flex fees apply on high-volume months; not modeled in base estimate.');
  if (!data.sst.is_csp && totalFilings > 60) {
    caveats.push('TaxJar is not an SST CSP. no free filings available even in SST member states.');
  }

  return {
    provider: data.provider.name,
    slug: data.provider.slug,
    transparencyTier: data.transparency.tier,
    recommendedPlan: plan.name,
    estimate: { type: 'exact', annualCostUSD: roundDollars(annualCost) },
    breakdown: {
      subscription: roundDollars(subscription),
      filings,
      registrations,
      transactions: 0,
      addOns: 0,
      implementation: 0,
    },
    assumptions,
    caveats,
    sources: data.sources.map((s) => s.url),
  };
}
