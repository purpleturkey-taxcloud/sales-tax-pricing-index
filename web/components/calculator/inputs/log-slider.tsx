'use client';

import * as Slider from '@radix-ui/react-slider';

interface LogSliderProps {
  label: string;
  stops: number[];
  value: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}

/**
 * A slider that snaps to a fixed set of stops, used for the log-scale
 * quantity inputs (orders, transaction volume, revenue). The slider's actual
 * position is an integer index into `stops`; the underlying value is the
 * stop at that index.
 */
export function LogSlider({ label, stops, value, onChange, format }: LogSliderProps) {
  const index = closestIndex(stops, value);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="small-caps text-xs text-ink-subtle">{label}</label>
        <span className="font-mono text-sm font-semibold text-ink">{format(stops[index])}</span>
      </div>
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        min={0}
        max={stops.length - 1}
        step={1}
        value={[index]}
        onValueChange={([i]) => onChange(stops[i])}
      >
        <Slider.Track className="bg-rule relative grow rounded-full h-1">
          <Slider.Range className="absolute bg-accent rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-4 h-4 bg-ink rounded-full hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
          aria-label={label}
        />
      </Slider.Root>
      <div className="flex justify-between text-[10px] text-ink-subtle mt-1.5 font-mono">
        <span>{format(stops[0])}</span>
        <span>{format(stops[stops.length - 1])}</span>
      </div>
    </div>
  );
}

function closestIndex(stops: number[], v: number): number {
  let best = 0;
  let bestDiff = Math.abs(stops[0] - v);
  for (let i = 1; i < stops.length; i++) {
    const d = Math.abs(stops[i] - v);
    if (d < bestDiff) {
      best = i;
      bestDiff = d;
    }
  }
  return best;
}
