/**
 * Client-safe wrapper around the calculator. Imports only the math functions —
 * NOT the YAML loader, validator, ajv, or js-yaml. Keeps the client bundle
 * lean and avoids `fs` / Node-only modules leaking into the browser.
 *
 * Provider data is pre-loaded server-side and passed in as a Map.
 */
import type { ProviderEstimate, UserInputs } from '../../calculator/src/types';
import type { ProviderData } from '../../calculator/src/data/types';
import { calculateAnrok } from '../../calculator/src/calculators/anrok';
import { calculateAvalara } from '../../calculator/src/calculators/avalara';
import { calculateKintsugi } from '../../calculator/src/calculators/kintsugi';
import { calculateNumeral } from '../../calculator/src/calculators/numeral';
import { calculateSphere } from '../../calculator/src/calculators/sphere';
import { calculateTaxcloud } from '../../calculator/src/calculators/taxcloud';
import { calculateTaxjar } from '../../calculator/src/calculators/taxjar';
import { calculateZamp } from '../../calculator/src/calculators/zamp';

const REGISTRY: Array<{ slug: string; fn: (i: UserInputs, d: ProviderData) => ProviderEstimate }> = [
  { slug: 'taxcloud', fn: calculateTaxcloud },
  { slug: 'taxjar', fn: calculateTaxjar },
  { slug: 'numeral', fn: calculateNumeral },
  { slug: 'kintsugi', fn: calculateKintsugi },
  { slug: 'avalara', fn: calculateAvalara },
  { slug: 'sphere', fn: calculateSphere },
  { slug: 'anrok', fn: calculateAnrok },
  { slug: 'zamp', fn: calculateZamp },
];

function sortableCost(e: ProviderEstimate['estimate']): number {
  switch (e.type) {
    case 'exact':
    case 'starting_at':
      return e.annualCostUSD;
    case 'range':
      return (e.annualCostMinUSD + e.annualCostMaxUSD) / 2;
    case 'quote_required':
      return e.startingAtUSD ?? Number.POSITIVE_INFINITY;
  }
}

export function calculate(inputs: UserInputs, providers: Map<string, ProviderData>): ProviderEstimate[] {
  const out = REGISTRY.map(({ slug, fn }) => {
    const data = providers.get(slug);
    if (!data) throw new Error(`Missing provider data for '${slug}'`);
    return fn(inputs, data);
  });
  return out.sort((a, b) => sortableCost(a.estimate) - sortableCost(b.estimate));
}
