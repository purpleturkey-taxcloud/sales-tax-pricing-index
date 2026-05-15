'use client';

interface NumberStepperProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

export function NumberStepper({ label, value, onChange, min = 0, max = 50, step = 1, suffix }: NumberStepperProps) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  return (
    <div>
      <label className="small-caps text-xs text-ink-subtle block mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="w-9 h-9 border border-rule text-ink hover:border-accent hover:text-accent disabled:opacity-30"
          onClick={() => onChange(clamp(value - step))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >−</button>
        <input
          type="number"
          className="w-16 h-9 text-center font-mono text-sm bg-paper-raised border border-rule focus:border-accent focus:outline-none"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!Number.isNaN(v)) onChange(clamp(v));
          }}
        />
        <button
          type="button"
          className="w-9 h-9 border border-rule text-ink hover:border-accent hover:text-accent disabled:opacity-30"
          onClick={() => onChange(clamp(value + step))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
        >+</button>
        {suffix && <span className="text-xs text-ink-subtle ml-1">{suffix}</span>}
      </div>
    </div>
  );
}
