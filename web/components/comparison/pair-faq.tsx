import type { ProviderData } from '../../../calculator/src/data/types';
import { pairFaqEntries } from '@/lib/jsonld/comparison';

export function PairFaq({ a, b }: { a: ProviderData; b: ProviderData }) {
  const entries = pairFaqEntries(a, b);
  return (
    <section className="my-12">
      <h2 className="text-subhed mb-6">Frequently asked questions</h2>
      <dl className="space-y-7">
        {entries.map((e, i) => (
          <div key={i}>
            <dt className="font-semibold text-ink font-serif">{e.q}</dt>
            <dd className="text-ink-muted mt-2 max-w-prose">{e.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
