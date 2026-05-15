import type { ProviderData } from '../../../calculator/src/data/types';

/**
 * Schema.org Table describing the pricing comparison table on the page.
 * Lightweight — Google primarily reads table content from the HTML itself,
 * but emitting the Table type gives LLMs a structural hint that the table
 * is the canonical pricing reference.
 */
export function tableJsonLd(p: ProviderData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Table',
    about: {
      '@type': 'Product',
      name: p.provider.name,
    },
    name: `${p.provider.name} pricing plans`,
    description: `Published plan tiers, monthly prices, what each plan includes, and the cost of filings, registrations, and transactions for ${p.provider.name}.`,
  };
}
