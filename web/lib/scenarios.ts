/**
 * Buyer-profile scenarios used to compute "typical pricing" cards on provider
 * pages and pairwise comparison pages. Two profiles — SMB and Mid-Market —
 * both assuming Shopify integration since that's the dominant mid-market
 * ecommerce stack we're targeting.
 *
 * Both single-provider and pairwise versions of the scenarios component read
 * from this file so the buyer profiles stay in lockstep across the site.
 */
import type { UserInputs } from '../../calculator/src/types';
import { getAssumptions } from './integration-assumptions';

export interface ScenarioProfile {
  name: string;
  description: string;
  annualOrders: number;
  annualFilings: number;
  annualRevenueUSD: number;
  statesFiling: number;
  sstEligibleStates: number;
  integration: UserInputs['integrationType'];
}

export const SCENARIOS: ScenarioProfile[] = [
  {
    name: 'SMB',
    description: '50K orders · 120 filings · 10 states · 5 SST · Shopify',
    annualOrders: 50_000,
    annualFilings: 120,
    annualRevenueUSD: 6_000_000, // 50K × $120 Shopify AOV
    statesFiling: 10,
    sstEligibleStates: 5,
    integration: 'shopify',
  },
  {
    name: 'Mid-Market',
    description: '250K orders · 200 filings · 20 states · 10 SST · Shopify',
    annualOrders: 250_000,
    annualFilings: 200,
    annualRevenueUSD: 30_000_000, // 250K × $120 Shopify AOV
    statesFiling: 20,
    sstEligibleStates: 10,
    integration: 'shopify',
  },
];

export function buildScenarioInputs(s: ScenarioProfile): UserInputs {
  const { taxableShare } = getAssumptions(s.integration);
  return {
    monthlyOrders: Math.round(s.annualOrders / 12),
    monthlyTransactionVolumeUSD: Math.round((s.annualRevenueUSD * taxableShare) / 12),
    annualRevenueUSD: s.annualRevenueUSD,
    statesFiling: s.statesFiling,
    statesPhysicalNexus: 0,
    filingFrequency: 'monthly',
    registrationBacklog: 0,
    integrationType: s.integration,
    requiresApiAccess: false,
    requiresExemptionCertificateMgmt: false,
    requiresInternationalVatGst: false,
    requiresVdaSupport: false,
    billingCadence: 'annual',
    annualFilings: s.annualFilings,
    sstEligibleStates: s.sstEligibleStates,
  };
}
