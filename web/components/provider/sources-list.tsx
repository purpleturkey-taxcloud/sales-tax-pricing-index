import type { ProviderData } from '../../../calculator/src/data/types';
import { formatDate } from '@/lib/last-updated';

export function SourcesList({ provider }: { provider: ProviderData }) {
  const sources = provider.sources ?? [];
  if (sources.length === 0) return null;
  return (
    <section className="my-12">
      <h2 className="text-subhed mb-4">Sources</h2>
      <p className="text-ink-muted text-sm max-w-prose mb-6">
        Every dollar figure on this page traces back to one of the sources below.
        Confidence ratings are explained on the{' '}
        <a href="/methodology" className="no-underline hover:text-accent">methodology page</a>.
      </p>
      <ol className="space-y-3 text-sm">
        {sources.map((s, i) => (
          <li key={i} className="grid grid-cols-[2rem_3rem_1fr] gap-3 items-baseline">
            <span className="text-ink-subtle text-xs">[{i + 1}]</span>
            <span className="font-mono text-xs font-semibold text-accent">{s.confidence}</span>
            <div>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-ink no-underline hover:text-accent">
                {s.title || s.url}
              </a>
              {s.accessed_date && (
                <span className="block text-xs text-ink-subtle mt-0.5">
                  Accessed {formatDate(s.accessed_date)}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
