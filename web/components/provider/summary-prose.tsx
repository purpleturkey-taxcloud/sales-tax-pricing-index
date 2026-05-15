import type { ProviderData } from '../../../calculator/src/data/types';
import { howMuchDoesXCost } from '@/lib/summary';

/**
 * The AEO-critical answer paragraph. Sits directly under the H1 and answers
 * "How much does {X} cost?" in 2-3 sentences derived from YAML.
 */
export function SummaryProse({ provider }: { provider: ProviderData }) {
  return (
    <section className="my-8 max-w-prose">
      <p className="text-lg leading-relaxed text-ink">
        {howMuchDoesXCost(provider)}
      </p>
    </section>
  );
}
