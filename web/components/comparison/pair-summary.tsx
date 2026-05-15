import type { ProviderData } from '../../../calculator/src/data/types';
import { pairSummary } from '@/lib/comparison-summary';

export function PairSummary({ a, b }: { a: ProviderData; b: ProviderData }) {
  return (
    <section className="my-8 max-w-prose">
      <p className="text-lg leading-relaxed text-ink">{pairSummary(a, b)}</p>
    </section>
  );
}
