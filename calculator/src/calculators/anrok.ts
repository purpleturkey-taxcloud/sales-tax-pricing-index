// =============================================================================
// anrok.ts — Anrok cost estimator (data-driven)
// Source: providers/anrok.yaml
//
// Pricing primitive: hybrid — subscription + bps per taxable transaction.
// Math kept in TS:
//   - Plan selection by annual revenue (Starter <$2M / Core $2M-$50M / Growth >$50M)
//     $2M matches Anrok's published Starter ICP. $50M is our heuristic — Anrok
//     does not publish ARR boundaries for Core or Growth.
//   - Subscription + bps math
//
// Data sourced from YAML:
//   - Plan list with monthly_price
//   - transaction_fee_rate_override per plan (40 bps Starter, 30 bps Core)
//   - is_quote_only for Growth tier
// =============================================================================

import type { ProviderData } from '../data/types';
import type { ProviderEstimate, UserInputs } from '../types';
import { roundDollars } from '../helpers';

const ANROK_CORE_REVENUE_THRESHOLD = 2_000_000;
const ANROK_GROWTH_REVENUE_THRESHOLD = 50_000_000;

function pickPlanSlug(inputs: UserInputs): 'starter' | 'core' | 'growth' {
  if (inputs.annualRevenueUSD < ANROK_CORE_REVENUE_THRESHOLD) return 'starter';
  if (inputs.annualRevenueUSD < ANROK_GROWTH_REVENUE_THRESHOLD) return 'core';
  return 'growth';
}

export function calculateAnrok(inputs: UserInputs, data?: ProviderData): ProviderEstimate {
  if (!data) {
    throw new Error('calculateAnrok requires ProviderData loaded from providers/anrok.yaml');
  }

  const planSlug = pickPlanSlug(inputs);
  const plan = data.plans.find((p) => p.slug === planSlug);
  if (!plan) throw new Error(`Anrok plan '${planSlug}' not found in YAML data.`);

  if (plan.is_quote_only) {
    return {
      provider: data.provider.name,
      slug: data.provider.slug,
      transparencyTier: data.transparency.tier,
      recommendedPlan: plan.name,
      estimate: {
        type: 'quote_required',
        message: 'Growth plan is custom-quoted. Anrok does not publish an ARR threshold; this tier adds unlimited historical filings, reconciliation, SSO, MSA, and dedicated onboarding.',
      },
      assumptions: [`Annual revenue ($${inputs.annualRevenueUSD.toLocaleString()}) maps to ${plan.name} per our heuristic.`],
      caveats: ['Anrok is SaaS-focused; ecommerce customers should consider other providers.'],
      sources: data.sources.map((s) => s.url),
    };
  }

  const monthlyPrice = plan.monthly_price.amount ?? 0;
  const bps = plan.transaction_fee_rate_override ?? data.transaction_fees.rate ?? 0;
  const subscription = monthlyPrice * 12;
  const annualTaxableTxnUSD = inputs.monthlyTransactionVolumeUSD * 12;
  const transactionFees = annualTaxableTxnUSD * (bps / 10_000);
  const annualCost = subscription + transactionFees;

  return {
    provider: data.provider.name,
    slug: data.provider.slug,
    transparencyTier: data.transparency.tier,
    recommendedPlan: plan.name,
    estimate: { type: 'exact', annualCostUSD: roundDollars(annualCost) },
    breakdown: {
      subscription: roundDollars(subscription),
      filings: 0,
      registrations: 0,
      transactions: roundDollars(transactionFees),
      addOns: 0,
      implementation: 0,
    },
    assumptions: [
      `Plan: ${plan.name} ($${monthlyPrice}/mo + ${bps} bps)`,
      `Annual subscription: $${subscription.toLocaleString()}`,
      `Transaction fees: $${annualTaxableTxnUSD.toLocaleString()} × ${bps} bps = $${roundDollars(transactionFees).toLocaleString()}`,
    ],
    caveats: [
      'Anrok is SaaS-focused; bps applies to taxable transactions only.',
      !data.sst.is_csp ? `${data.provider.name} is not an SST CSP.` : '',
      planSlug === 'starter' ? 'Anrok lists Starter as best for <$2M ARR; you may outgrow it as you scale.' : '',
    ].filter(Boolean),
    sources: data.sources.map((s) => s.url),
  };
}
