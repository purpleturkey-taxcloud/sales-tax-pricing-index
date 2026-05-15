'use client';

import * as Switch from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

export function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer group">
      <span className="text-sm text-ink-muted group-hover:text-ink">{label}</span>
      <Switch.Root
        checked={value}
        onCheckedChange={onChange}
        className={cn(
          'w-9 h-5 rounded-full transition-colors relative',
          value ? 'bg-accent' : 'bg-rule',
        )}
      >
        <Switch.Thumb className="block w-4 h-4 bg-paper rounded-full shadow-sm transition-transform translate-x-0.5 data-[state=checked]:translate-x-[18px]" />
      </Switch.Root>
    </label>
  );
}
