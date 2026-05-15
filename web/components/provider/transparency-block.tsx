import type { ProviderData } from '../../../calculator/src/data/types';

const TIER_LABEL: Record<string, string> = {
  transparent: 'Transparent',
  partial: 'Partial',
  opaque: 'Opaque',
};

const TIER_DESC: Record<string, string> = {
  transparent: 'Full plan pricing is on the website. You can budget without talking to sales.',
  partial: 'Some plans are public, others are quote-only. You can budget the bottom tier; everything else takes a call.',
  opaque: 'No published list pricing on the core product. Every real number comes from a sales call.',
};

export function TransparencyBlock({ provider }: { provider: ProviderData }) {
  const t = provider.transparency;
  return (
    <section className="my-12 max-w-prose">
      <h2 className="text-subhed mb-4">Pricing transparency</h2>
      <div className="bg-paper-sunken border-l-2 border-accent pl-5 py-4 pr-4">
        <p className="font-semibold text-ink small-caps text-sm">{TIER_LABEL[t.tier]}</p>
        <p className="text-ink mt-1.5">{TIER_DESC[t.tier]}</p>
        {t.rationale && (
          <p className="text-ink-muted text-sm mt-3">{t.rationale}</p>
        )}
      </div>
      <ul className="text-sm text-ink-muted mt-5 space-y-1.5">
        <CheckRow on={t.pricing_page_has_dollar_amounts}>Dollar amounts published on pricing page</CheckRow>
        <CheckRow on={t.publishes_filing_fees}>Filing fees published</CheckRow>
        <CheckRow on={t.publishes_registration_fees}>Registration fees published</CheckRow>
        <CheckRow on={t.publishes_overage_rates}>Overage rates published</CheckRow>
        <CheckRow on={t.publishes_implementation_fees}>Implementation fees published</CheckRow>
      </ul>
    </section>
  );
}

function CheckRow({ on, children }: { on: boolean | undefined; children: React.ReactNode }) {
  return (
    <li className="flex items-baseline gap-2">
      <span className={on ? 'text-accent' : 'text-ink-subtle'} aria-hidden>{on ? '●' : '○'}</span>
      <span className={on ? 'text-ink' : 'text-ink-subtle'}>{children}</span>
    </li>
  );
}
