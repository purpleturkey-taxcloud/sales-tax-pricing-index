import type { IntegrationType } from '../../calculator/src/types';

/**
 * Per-integration assumptions used to derive transaction volume and order
 * count from the buyer's annual revenue.
 *
 * Two values per integration:
 *   - averageOrderValue: typical AOV for customers on this integration.
 *     Used by order-tier-priced providers (TaxJar) to estimate monthly orders.
 *   - taxableShare: typical share of annual revenue subject to sales tax.
 *     Used by basis-points-priced providers (Anrok) to estimate taxable
 *     transaction volume.
 *
 * These are coarse defaults. Real businesses vary materially within an
 * integration category. The methodology page should note that the calculator
 * makes integration-specific assumptions; buyers with non-typical profiles
 * (e.g., a B2B-heavy Shopify brand with mostly resale-exempt orders) should
 * read the output as directional rather than exact.
 */
export interface IntegrationAssumptions {
  averageOrderValue: number;
  taxableShare: number;
}

export const INTEGRATION_ASSUMPTIONS: Record<IntegrationType, IntegrationAssumptions> = {
  // DTC ecommerce — typical AOVs in the $80–$200 band, most revenue taxable
  shopify:     { averageOrderValue: 120, taxableShare: 0.85 },
  bigcommerce: { averageOrderValue: 150, taxableShare: 0.85 },
  woocommerce: { averageOrderValue: 100, taxableShare: 0.85 },

  // Payment processors / SaaS subscription billing — higher per-transaction
  // values, lower taxable share because SaaS isn't taxable in every state
  stripe:      { averageOrderValue: 200, taxableShare: 0.70 },
  chargebee:   { averageOrderValue: 250, taxableShare: 0.50 },

  // SMB accounting — mixed customer base, mid-range assumptions
  quickbooks:  { averageOrderValue: 200, taxableShare: 0.70 },

  // ERP — B2B-heavy with larger invoices and more reseller exemptions,
  // pulling effective taxable share down
  netsuite:    { averageOrderValue: 500, taxableShare: 0.60 },
  sap:         { averageOrderValue: 750, taxableShare: 0.50 },
  oracle:      { averageOrderValue: 750, taxableShare: 0.50 },
  dynamics:    { averageOrderValue: 750, taxableShare: 0.50 },

  // Other
  custom_api:  { averageOrderValue: 200, taxableShare: 0.70 },
  csv_only:    { averageOrderValue: 100, taxableShare: 0.85 },
};

export function getAssumptions(integration: IntegrationType): IntegrationAssumptions {
  return INTEGRATION_ASSUMPTIONS[integration];
}
