import { getProviderObservations, type ObservationSource } from '@/lib/buyer-observations';

export function BuyerObservations({ slug }: { slug: string }) {
  const data = getProviderObservations(slug);
  if (!data) return null;

  // Build a deduplicated source list and a lookup from URL → citation index.
  const seen = new Map<string, number>();
  const sources: ObservationSource[] = [];
  for (const obs of data.observations) {
    for (const s of obs.sources) {
      if (!seen.has(s.url)) {
        seen.set(s.url, sources.length + 1);
        sources.push(s);
      }
    }
  }
  const citeNum = (url: string) => seen.get(url)!;

  return (
    <section className="my-12">
      <h2 className="text-subhed mb-3">What real contracts include</h2>
      <p className="text-ink-muted text-sm max-w-prose mb-6">{data.intro}</p>

      <ul className="space-y-6 max-w-prose">
        {data.observations.map((obs, i) => (
          <li key={i} className="leading-relaxed">
            <p>
              <strong className="text-ink">{obs.title}</strong>{' '}
              <span className="text-ink-muted">{obs.body}</span>
              {obs.sources.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[10px] font-mono no-underline text-accent ml-1 align-super hover:underline"
                  title={s.label}
                  aria-label={`Source: ${s.label}`}
                >
                  [{citeNum(s.url)}]
                </a>
              ))}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-7 pt-5 rule-top">
        <p className="small-caps text-xs text-ink-subtle mb-3">Sources cited</p>
        <ol className="space-y-1.5 text-xs text-ink-muted">
          {sources.map((s, i) => (
            <li key={s.url} className="grid grid-cols-[1.75rem_1fr] gap-2 items-baseline">
              <span className="font-mono text-accent">[{i + 1}]</span>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline hover:text-accent"
              >
                {s.label} ↗
              </a>
            </li>
          ))}
        </ol>
        <p className="text-[11px] text-ink-subtle mt-4 italic">
          Synthesized from public buyer reviews, third-party aggregator data, and vendor knowledge-center
          documentation. We do not cite our own pipeline or affiliated TaxCloud content as a source.
        </p>
      </div>
    </section>
  );
}
