import type { ProviderData } from '../../calculator/src/data/types';

/**
 * Most recent `accessed_date` across a provider's source list.
 * Returns null if no dates are present.
 */
export function lastUpdated(p: ProviderData): string | null {
  const dates = (p.sources ?? [])
    .map((s) => s.accessed_date)
    .filter((d): d is string => typeof d === 'string' && d.length > 0)
    .sort();
  return dates.length === 0 ? null : dates[dates.length - 1];
}

export function lastUpdatedAcross(providers: ProviderData[]): string | null {
  const dates = providers
    .map(lastUpdated)
    .filter((d): d is string => d !== null)
    .sort();
  return dates.length === 0 ? null : dates[dates.length - 1];
}

export function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
