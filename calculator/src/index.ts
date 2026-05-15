// =============================================================================
// index.ts — Main entry point for the sales tax pricing calculator
//
// Usage:
//   import { calculate } from './index';
//   const results = calculate(userInputs);
//   // results is ProviderEstimate[] sorted by lowest estimated cost
//
// Data flow:
//   providers/*.yaml → loadProviders() → ProviderData (typed)
//   UserInputs + ProviderData → calculator function → ProviderEstimate
// =============================================================================

import { loadProviders } from './data/loader';
import type { ProviderData } from './data/types';
import { calculateAnrok } from './calculators/anrok';
import { calculateAvalara } from './calculators/avalara';
import { calculateKintsugi } from './calculators/kintsugi';
import { calculateNumeral } from './calculators/numeral';
import { calculateSphere } from './calculators/sphere';
import { calculateTaxcloud } from './calculators/taxcloud';
import { calculateTaxjar } from './calculators/taxjar';
import { calculateZamp } from './calculators/zamp';
import type { CalculatorFn, ProviderEstimate, UserInputs } from './types';

interface CalculatorRegistration {
  slug: string;
  fn: CalculatorFn;
  dataDriven: boolean;
}

const CALCULATORS: readonly CalculatorRegistration[] = [
  { slug: 'taxcloud', fn: calculateTaxcloud as CalculatorFn, dataDriven: true },
  { slug: 'taxjar', fn: calculateTaxjar as CalculatorFn, dataDriven: true },
  { slug: 'numeral', fn: calculateNumeral as CalculatorFn, dataDriven: true },
  { slug: 'kintsugi', fn: calculateKintsugi as CalculatorFn, dataDriven: true },
  { slug: 'avalara', fn: calculateAvalara as CalculatorFn, dataDriven: true },
  { slug: 'sphere', fn: calculateSphere as CalculatorFn, dataDriven: true },
  { slug: 'anrok', fn: calculateAnrok as CalculatorFn, dataDriven: true },
  { slug: 'zamp', fn: calculateZamp as CalculatorFn, dataDriven: true },
];

function sortableCost(estimate: ProviderEstimate['estimate']): number {
  switch (estimate.type) {
    case 'exact':
    case 'starting_at':
      return estimate.annualCostUSD;
    case 'range':
      return (estimate.annualCostMinUSD + estimate.annualCostMaxUSD) / 2;
    case 'quote_required':
      return estimate.startingAtUSD ?? Number.POSITIVE_INFINITY;
  }
}

let cachedProviderData: Map<string, ProviderData> | null = null;

function getProviderData(): Map<string, ProviderData> {
  if (cachedProviderData) return cachedProviderData;
  cachedProviderData = loadProviders();
  return cachedProviderData;
}

export function calculate(inputs: UserInputs, providerData?: Map<string, ProviderData>): ProviderEstimate[] {
  const data = providerData ?? getProviderData();
  const results = CALCULATORS.map((entry) => {
    if (entry.dataDriven) {
      const providerYaml = data.get(entry.slug);
      if (!providerYaml) {
        throw new Error(
          `Calculator '${entry.slug}' is data-driven but no YAML data was loaded. ` +
            `Verify providers/${entry.slug}.yaml exists and passes validation.`,
        );
      }
      return entry.fn(inputs, providerYaml);
    }
    return entry.fn(inputs);
  });
  return results.sort((a, b) => sortableCost(a.estimate) - sortableCost(b.estimate));
}

export * from './types';
export { CALCULATORS };
