import { formatDate } from '@/lib/last-updated';

export function UpdatedBadge({ date }: { date: string | null }) {
  if (!date) return null;
  return (
    <p className="text-xs small-caps text-ink-subtle">
      Last updated <time dateTime={date}>{formatDate(date)}</time>
    </p>
  );
}
