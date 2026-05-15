import type { ProviderData } from '../../../calculator/src/data/types';
import { faqEntries } from '@/lib/jsonld/faq';

export function FaqSection({ provider }: { provider: ProviderData }) {
  const entries = faqEntries(provider);
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
