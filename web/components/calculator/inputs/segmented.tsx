'use client';

import { cn } from '@/lib/utils';

interface SegmentedProps<T extends string> {
  label: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
}

export function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <div>
      <label className="small-caps text-xs text-ink-subtle block mb-2">{label}</label>
      <div className="inline-flex border border-rule overflow-hidden bg-paper-raised">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                'px-3 py-1.5 text-sm transition-colors',
                active ? 'bg-ink text-paper' : 'text-ink-muted hover:bg-paper-sunken',
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
