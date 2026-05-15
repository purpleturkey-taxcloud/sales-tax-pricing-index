'use client';

import { cn } from '@/lib/utils';

// 24 SST member states as of 2026 — mirror of calculator/src/helpers.ts
// SST_MEMBER_STATES. Kept inline here to avoid pulling the helpers module
// into the client bundle just for a string array.
export const SST_MEMBER_STATES = [
  'AR', 'GA', 'IN', 'IA', 'KS', 'KY', 'MI', 'MN',
  'NE', 'NV', 'NJ', 'NC', 'ND', 'OH', 'OK', 'RI',
  'SD', 'TN', 'UT', 'VT', 'WA', 'WV', 'WI', 'WY',
] as const;

interface SstStateGridProps {
  label: string;
  /** State codes (uppercase, two-letter) currently selected. */
  selected: ReadonlySet<string>;
  onChange: (next: Set<string>) => void;
  /** When the user has fewer total filings than selected SST states, warn. */
  filingCap?: number;
}

export function SstStateGrid({ label, selected, onChange, filingCap }: SstStateGridProps) {
  const toggle = (state: string) => {
    const next = new Set(selected);
    if (next.has(state)) next.delete(state);
    else next.add(state);
    onChange(next);
  };

  const allSelected = selected.size === SST_MEMBER_STATES.length;
  const setAll = (on: boolean) => {
    onChange(on ? new Set(SST_MEMBER_STATES) : new Set());
  };

  const overCap = typeof filingCap === 'number' && selected.size > filingCap;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="small-caps text-xs text-ink-subtle">{label}</label>
        <span className="font-mono text-xs text-ink">
          {selected.size} of {SST_MEMBER_STATES.length}
        </span>
      </div>
      <p className="text-[11px] text-ink-subtle mb-2 leading-snug">
        Pick the SST states where you have <em>economic</em> nexus only (no warehouse, office,
        or staff there). TaxCloud and Avalara are SST Certified Service Providers; filings in
        these states cost $0 under the program.
      </p>
      <div className="grid grid-cols-6 gap-1.5">
        {SST_MEMBER_STATES.map((s) => {
          const on = selected.has(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => toggle(s)}
              aria-pressed={on}
              className={cn(
                'h-8 text-xs font-mono font-semibold transition-colors border',
                on
                  ? 'bg-ink text-paper border-ink hover:bg-accent hover:border-accent'
                  : 'bg-paper-raised text-ink-muted border-rule hover:border-accent hover:text-accent',
              )}
            >
              {s}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <button
          type="button"
          className="text-ink-subtle hover:text-accent"
          onClick={() => setAll(!allSelected)}
        >
          {allSelected ? 'Clear all' : 'Select all 24'}
        </button>
        {overCap && (
          <span className="text-accent">
            More SST states selected than your total filing states ({filingCap}). The calculator caps the discount at your filing count.
          </span>
        )}
      </div>
    </div>
  );
}
