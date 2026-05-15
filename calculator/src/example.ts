// =============================================================================
// example.ts — Three customer profiles demonstrating the calculator
//
// Run with: npx ts-node src/example.ts
//
// These three profiles correspond to TaxCloud's primary ICP segments and let
// you sanity-check that the math produces reasonable results before wiring
// the calculator to a UI.
// =============================================================================

import { calculate, type UserInputs } from './index';

// -----------------------------------------------------------------------------
// Profile 1: Mid-market Shopify brand
// $25M revenue, 50K orders/month, filing in 15 states, no physical nexus
// outside home state, no international.
// -----------------------------------------------------------------------------
const MID_MARKET_ECOMMERCE: UserInputs = {
  monthlyOrders: 50_000,
  monthlyTransactionVolumeUSD: 2_500_000,
  annualRevenueUSD: 25_000_000,
  statesFiling: 15,
  statesPhysicalNexus: 1,
  filingFrequency: 'monthly',
  registrationBacklog: 0,
  integrationType: 'shopify',
  requiresApiAccess: false,
  requiresExemptionCertificateMgmt: false,
  requiresInternationalVatGst: false,
  requiresVdaSupport: false,
  billingCadence: 'annual',
};

// -----------------------------------------------------------------------------
// Profile 2: Early-stage SaaS company
// $3M ARR, 500 monthly subscriptions, filing in 5 states, needs API + ECM,
// some international expansion planned.
// -----------------------------------------------------------------------------
const EARLY_STAGE_SAAS: UserInputs = {
  monthlyOrders: 500,
  monthlyTransactionVolumeUSD: 250_000,
  annualRevenueUSD: 3_000_000,
  statesFiling: 5,
  statesPhysicalNexus: 1,
  filingFrequency: 'monthly',
  registrationBacklog: 3,
  integrationType: 'stripe',
  requiresApiAccess: true,
  requiresExemptionCertificateMgmt: true,
  requiresInternationalVatGst: false,
  requiresVdaSupport: false,
  billingCadence: 'annual',
  internationalCountries: 0,
};

// -----------------------------------------------------------------------------
// Profile 3: Enterprise multi-channel retailer
// $150M revenue, 200K orders/month, NetSuite ERP, filing in 35 states,
// physical nexus in 8 states (warehouses), needs VDA support for backfile.
// -----------------------------------------------------------------------------
const ENTERPRISE_RETAILER: UserInputs = {
  monthlyOrders: 200_000,
  monthlyTransactionVolumeUSD: 12_000_000,
  annualRevenueUSD: 150_000_000,
  statesFiling: 35,
  statesPhysicalNexus: 8,
  filingFrequency: 'monthly',
  registrationBacklog: 5,
  integrationType: 'netsuite',
  requiresApiAccess: true,
  requiresExemptionCertificateMgmt: true,
  requiresInternationalVatGst: false,
  requiresVdaSupport: true,
  billingCadence: 'annual',
};

// -----------------------------------------------------------------------------
// Render helpers
// -----------------------------------------------------------------------------
function formatEstimate(estimate: ReturnType<typeof calculate>[0]['estimate']): string {
  switch (estimate.type) {
    case 'exact':
      return `$${estimate.annualCostUSD.toLocaleString()}/yr`;
    case 'starting_at':
      return `$${estimate.annualCostUSD.toLocaleString()}/yr (starting at)`;
    case 'range':
      return `$${estimate.annualCostMinUSD.toLocaleString()}–$${estimate.annualCostMaxUSD.toLocaleString()}/yr (range)`;
    case 'quote_required':
      return estimate.startingAtUSD !== undefined
        ? `Quote required (starting at $${estimate.startingAtUSD.toLocaleString()}/yr)`
        : 'Quote required';
  }
}

function printProfile(label: string, inputs: UserInputs): void {
  console.log('\n' + '='.repeat(78));
  console.log(label);
  console.log('='.repeat(78));
  console.log(`Revenue: $${inputs.annualRevenueUSD.toLocaleString()}/yr · Orders: ${inputs.monthlyOrders.toLocaleString()}/mo`);
  console.log(`States: ${inputs.statesFiling} filing (${inputs.statesPhysicalNexus} physical nexus) · ${inputs.filingFrequency} filings`);
  console.log(`Integration: ${inputs.integrationType} · Registrations needed: ${inputs.registrationBacklog}`);
  if (inputs.requiresApiAccess) console.log('Requires: API access');
  if (inputs.requiresExemptionCertificateMgmt) console.log('Requires: Exemption certificate management');
  if (inputs.requiresVdaSupport) console.log('Requires: VDA support');
  console.log('');

  const results = calculate(inputs);
  for (const r of results) {
    const cost = formatEstimate(r.estimate).padEnd(36);
    const tier = `[${r.transparencyTier}]`.padEnd(13);
    console.log(`${r.provider.padEnd(14)} ${tier} ${cost} → ${r.recommendedPlan}`);
  }
  console.log('');
  console.log('Top result detail:');
  const top = results[0];
  console.log(`  Provider: ${top.provider} (${top.recommendedPlan})`);
  console.log('  Assumptions:');
  top.assumptions.forEach((a) => console.log(`    - ${a}`));
  if (top.caveats.length > 0) {
    console.log('  Caveats:');
    top.caveats.forEach((c) => console.log(`    - ${c}`));
  }
}

// -----------------------------------------------------------------------------
// Run
// -----------------------------------------------------------------------------
printProfile('Profile 1 — Mid-market Shopify brand ($25M revenue, 15 states)', MID_MARKET_ECOMMERCE);
printProfile('Profile 2 — Early-stage SaaS ($3M ARR, 5 states, needs API + ECM)', EARLY_STAGE_SAAS);
printProfile('Profile 3 — Enterprise NetSuite retailer ($150M, 35 states, VDA)', ENTERPRISE_RETAILER);
