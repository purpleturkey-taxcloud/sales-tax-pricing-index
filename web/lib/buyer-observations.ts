/**
 * Curated, source-cited observations about what real customer contracts include
 * beyond the headline pricing each vendor publishes.
 *
 * Editorial bar:
 *   - Every observation cites at least one public, non-TaxCloud source.
 *   - Buyer-reported numbers are flagged as such, not presented as the
 *     vendor's "standard" pricing.
 *   - Themes that exist only in TaxCloud sales-call data (Sybill) without
 *     public corroboration do NOT appear here. The point is to surface
 *     things buyers can independently verify.
 */

export interface ObservationSource {
  label: string;
  url: string;
}

export interface BuyerObservation {
  /** Bold lead phrase that begins the bullet. */
  title: string;
  /** 1–3 sentence detail. May reference dollar figures explicitly. */
  body: string;
  /** Public, non-TaxCloud-owned sources that support the claim. */
  sources: ObservationSource[];
}

export interface ProviderObservations {
  /** Section intro paragraph. */
  intro: string;
  /** The bullets, in display order. */
  observations: BuyerObservation[];
}

const OBSERVATIONS: Record<string, ProviderObservations> = {
  taxjar: {
    intro:
      "TaxJar publishes its pricing page in full, which is unusual in this category. The patterns worth knowing aren't hidden in contracts. They're in how the product has changed since Stripe acquired it in 2021, and in how buyers describe the experience today:",
    observations: [
      {
        title: 'Entry-tier subscription doubled and AutoFile fees climbed materially in February 2026.',
        body:
          "TaxJar's first price increase in 6+ years lifted the Starter base from $19/mo to $39/mo and moved AutoFile per-return fees from the $30–35 range into the $50–55 range. Buyers up for renewal in 2026 see step-changes rather than the gradual increases typical of the category, which is the most frequently cited trigger for re-evaluating sales tax software this year.",
        sources: [
          {
            label: 'TaxJar Pricing',
            url: 'https://www.taxjar.com/pricing',
          },
          {
            label: 'How much does TaxJar cost? · TaxJar Support',
            url: 'https://support.taxjar.com/article/139-how-much-does-taxjar-cost',
          },
        ],
      },
      {
        title: 'Support quality and responsiveness are the most consistent complaint in 2026 reviews.',
        body:
          "Public reviews on the Shopify App Store and G2 reference slow response times, escalation gaps, and US-based support being substantially reduced. The pattern is commonly attributed to the post-Stripe-acquisition restructure. TaxJar holds a 3.5-star rating on the Shopify App Store at time of writing.",
        sources: [
          {
            label: 'TaxJar · Sales Tax Automation on Shopify App Store',
            url: 'https://apps.shopify.com/taxjar',
          },
          {
            label: 'TaxJar Reviews · G2',
            url: 'https://www.g2.com/products/taxjar/reviews',
          },
        ],
      },
      {
        title: 'Some integrations have stalled in maintenance, QuickBooks Online especially.',
        body:
          "Public reviews repeatedly mention sync failures, missing fields, and unresolved tickets on the QuickBooks Online integration. WooCommerce coverage and the broader partner-platform program have not expanded since acquisition. Marketplace integrations (Amazon, eBay) remain a genuine strength, which matters if your revenue mix is marketplace-heavy.",
        sources: [
          {
            label: 'TaxJar Reviews · G2',
            url: 'https://www.g2.com/products/taxjar/reviews',
          },
          {
            label: 'TaxJar · Sales Tax Automation on Shopify App Store',
            url: 'https://apps.shopify.com/taxjar',
          },
        ],
      },
      {
        title: 'TaxJar is not an SST Certified Service Provider.',
        body:
          "Filings in the 24 SST member states are billed at the standard $50–55 per-return rate. Sellers with broad multi-state nexus miss the structural savings available through CSP-certified vendors, where SST filings are free under the program.",
        sources: [
          {
            label: 'Certified Service Providers · Streamlined Sales Tax Governing Board',
            url: 'https://www.streamlinedsalestax.org/certified-service-providers/certified-service-providers',
          },
          {
            label: 'TaxJar Pricing',
            url: 'https://www.taxjar.com/pricing',
          },
        ],
      },
    ],
  },
  numeral: {
    intro:
      "Numeral publishes its core pricing on its site, and the per-filing rate is one of the most transparent in the category. The patterns worth knowing are about how that model scales, and about reliability themes that surface consistently in public reviews:",
    observations: [
      {
        title: "Per-filing pricing scales linearly, with no volume discount.",
        body:
          "At $75 per filing on monthly cadence, a typical state runs $900/year before the $150 one-time registration. A seller filing in 20 states is at roughly $20,000/year on filings alone. The math is easy to do mentally (multiply state count by $1,000 for a working estimate), but it also means cost rises step-for-step with footprint, with no scale economics.",
        sources: [
          {
            label: 'Numeral Pricing',
            url: 'https://www.numeral.com/pricing',
          },
        ],
      },
      {
        title: 'Filing reliability complaints are the most consistent buyer pain in public reviews.',
        body:
          "G2 and TrustRadius reviews reference late filings, filings completed incorrectly, and registrations created in states without economic nexus. The AI-automated workflow is positioned as a strength, but operational edge cases (state notice handling, complex jurisdictions, mid-cycle corrections) show up as recurring failure modes in buyer feedback.",
        sources: [
          {
            label: 'Numeral Reviews · G2',
            url: 'https://www.g2.com/products/numeral-tax/reviews',
          },
        ],
      },
      {
        title: 'Numeral is not an SST Certified Service Provider.',
        body:
          "Filings in the 24 SST member states are billed at the full $75 per-return rate. For mid-market sellers with broad multi-state nexus, this can mean paying for hundreds of filings annually that would be covered free under a CSP-certified vendor.",
        sources: [
          {
            label: 'Certified Service Providers · Streamlined Sales Tax Governing Board',
            url: 'https://www.streamlinedsalestax.org/certified-service-providers/certified-service-providers',
          },
          {
            label: 'Numeral Pricing',
            url: 'https://www.numeral.com/pricing',
          },
        ],
      },
      {
        title: 'Product roadmap is oriented toward SaaS and global expansion.',
        body:
          "Numeral's integration set and product positioning have moved toward AI-native SaaS buyers. NetSuite, Salesforce Commerce Cloud, and international VAT/GST coverage are prominent. Coverage of mid-market ecommerce-specific platforms like BigCommerce and WooCommerce is comparatively thin. Worth understanding if your business is core-ecom and you're evaluating long-term roadmap alignment.",
        sources: [
          {
            label: 'Numeral Integrations',
            url: 'https://www.numeral.com/integrations',
          },
        ],
      },
    ],
  },
  kintsugi: {
    intro:
      "Kintsugi's per-filing pricing is published and clean. The patterns worth knowing are about the model's economics at scale, and about a distinctive reliability concern that shows up consistently in public reviews:",
    observations: [
      {
        title: 'Per-filing pricing follows the same $75/return model as Numeral.',
        body:
          "No subscription tier discounts, no volume breaks. For a multi-state seller, the working math is similar to Numeral's: about $900/state/year on monthly cadence, before the $75 one-time registration fee per state. Transparent and easy to model, but cost scales linearly with footprint.",
        sources: [
          {
            label: 'Kintsugi Pricing',
            url: 'https://www.trykintsugi.com/pricing',
          },
        ],
      },
      {
        title: 'Auto-registration in states without economic nexus is a flagged failure pattern.',
        body:
          "Public reviews on G2 and TrustRadius describe the AI initiating state registrations on behalf of customers in jurisdictions where the seller had not yet crossed economic nexus thresholds. Once a state registration exists, it carries ongoing filing obligations that aren't easily unwound, making this the most distinctive reliability concern in public Kintsugi feedback.",
        sources: [
          {
            label: 'Kintsugi Reviews · G2',
            url: 'https://www.g2.com/products/kintsugi/reviews',
          },
        ],
      },
      {
        title: 'Kintsugi is not an SST Certified Service Provider.',
        body:
          "Filings in the 24 SST member states are billed at the same $75 per-return rate as any other state. Buyers with broad multi-state footprints miss the structural saving available through CSP-certified vendors, where SST filings are covered free under the program.",
        sources: [
          {
            label: 'Certified Service Providers · Streamlined Sales Tax Governing Board',
            url: 'https://www.streamlinedsalestax.org/certified-service-providers/certified-service-providers',
          },
          {
            label: 'Kintsugi Pricing',
            url: 'https://www.trykintsugi.com/pricing',
          },
        ],
      },
    ],
  },
  avalara: {
    intro:
      "The pricing table above is the AvaTax base. Real contracts almost always include additional line items that aren't in any quote summary. These are the patterns that appear most consistently in public buyer reviews and third-party aggregator commentary:",
    observations: [
      {
        title: 'The platform connector is a separate line item, typically $5,000–$15,000/year.',
        body:
          'AvaTax does not include the integration to Shopify, NetSuite, BigCommerce, or your ERP. That is a separate purchase. One buyer-reported Shopify connector quote was $7,400/year for 15,000 transactions, distinct from filing fees. ERP connectors (SAP, Oracle, Dynamics) routinely run higher.',
        sources: [
          {
            label: 'Avalara Pricing 2026: Plans, Costs & Hidden Fees · CheckThat.ai',
            url: 'https://checkthat.ai/brands/avalara/pricing',
          },
          {
            label: 'How Much Does Avalara Cost? Full Pricing Breakdown · Sphere',
            url: 'https://www.getsphere.com/blog/how-much-does-avalara-cost',
          },
        ],
      },
      {
        title: 'Calculation-only is a real, smaller tier, typically $4,000–$7,000/year.',
        body:
          'If you only need Avalara to calculate tax (not file returns), the contract is materially smaller, usually the connector plus standard support and no Returns module. Worth knowing because aggregator headline ranges quote AvaTax + Returns bundles, which is a different product mix from calculation-only.',
        sources: [
          {
            label: 'Avalara Pricing 2026: Plans, Costs & Hidden Fees · CheckThat.ai',
            url: 'https://checkthat.ai/brands/avalara/pricing',
          },
          {
            label: 'Avalara Software Pricing & Plans · Vendr',
            url: 'https://www.vendr.com/marketplace/avalara',
          },
        ],
      },
      {
        title: 'Home-rule states are billed as multiple filings, not one.',
        body:
          'Colorado has 70+ self-collecting home-rule cities (Denver, Boulder, Aurora, Lakewood, and dozens more) that each require their own return. Avalara bills each one separately. A seller filing in Colorado and Alaska may see their effective filing count run 3–5× their state count. Avalara documents this in its own knowledge center.',
        sources: [
          {
            label: 'Home rule jurisdictions in Colorado and compliance · Avalara Knowledge Center',
            url: 'https://knowledge.avalara.com/bundle/lic1739761223162_lic1739761223162/page/rzx1739761235176.html',
          },
          {
            label: 'What Colorado home rule cities are and how their taxes work · Stripe',
            url: 'https://stripe.com/resources/more/colorados-home-rule-cities',
          },
        ],
      },
      {
        title: 'Renewal increases of 2–3× year-over-year are widely reported.',
        body:
          'Public reviews on G2 and TrustRadius consistently flag steep renewal hikes, often communicated through the renewal invoice rather than a planning conversation. Budget accordingly when modeling year-2 cost.',
        sources: [
          {
            label: 'Avalara Reviews 2026 · G2',
            url: 'https://www.g2.com/products/avalara/reviews',
          },
          {
            label: 'Avalara Pricing 2026 · TrustRadius',
            url: 'https://www.trustradius.com/products/avalara/pricing',
          },
        ],
      },
    ],
  },
};

export function getProviderObservations(slug: string): ProviderObservations | null {
  return OBSERVATIONS[slug] ?? null;
}
