import type { ProviderData } from '../../../calculator/src/data/types';
import { money } from '@/lib/format';

interface FeeRow {
  label: string;
  value: string;
  note?: string;
  source?: string;
}

function collectFees(p: ProviderData): FeeRow[] {
  const rows: FeeRow[] = [];

  if (p.filings?.has_per_filing_fee) {
    const amt = p.filings.base_cost?.amount;
    rows.push({
      label: 'Per state filing',
      value: amt != null ? `${money(amt)} / filing` : 'Charged, amount not published',
      note: p.filings.notes,
      source: p.filings.base_cost?.source,
    });
  }

  if (p.registrations?.has_per_registration_fee) {
    const amt = p.registrations.base_cost?.amount;
    rows.push({
      label: 'Per state registration',
      value: amt != null ? `${money(amt)} / registration` : 'Charged, amount not published',
      note: p.registrations.notes,
      source: p.registrations.base_cost?.source,
    });
  }

  if (p.transaction_fees?.has_transaction_fee && p.transaction_fees.rate != null) {
    const u = p.transaction_fees.rate_unit;
    const display = u === 'percent' ? `${p.transaction_fees.rate}%` : `${p.transaction_fees.rate} ${u}`;
    rows.push({
      label: 'Transaction fee',
      value: `${display} ${p.transaction_fees.applies_to === 'taxable_only' ? 'on taxable transactions' : 'on all transactions'}`,
      note: p.transaction_fees.notes,
    });
  }

  const addons = (p.add_ons ?? {}) as Record<string, any>;

  if (addons.implementation_fee?.has_fee) {
    const amt = addons.implementation_fee.amount;
    const lo = addons.implementation_fee.range_min;
    const hi = addons.implementation_fee.range_max;
    let value = 'Charged, amount not published';
    if (typeof amt === 'number' && amt > 0) value = `${money(amt)} one-time`;
    else if (typeof lo === 'number' && typeof hi === 'number') value = `${money(lo)}–${money(hi)} one-time`;
    rows.push({ label: 'Implementation', value, source: addons.implementation_fee.source });
  }

  if (typeof addons.payment_method_fees?.credit_card_surcharge_pct === 'number' && addons.payment_method_fees.credit_card_surcharge_pct > 0) {
    rows.push({
      label: 'Credit card surcharge',
      value: `${addons.payment_method_fees.credit_card_surcharge_pct}% on credit card payments (ACH avoids the fee)`,
      source: addons.payment_method_fees.source,
    });
  }

  if (Array.isArray(addons.other_fees)) {
    for (const f of addons.other_fees) {
      if (!f?.name) continue;
      rows.push({
        label: f.name,
        value: typeof f.cost === 'number' ? money(f.cost) : f.description || 'Variable',
        note: typeof f.cost === 'number' ? f.description : undefined,
        source: f.source,
      });
    }
  }

  if (Array.isArray(p.filings?.state_upcharges) && p.filings.state_upcharges.length > 0) {
    const states = p.filings.state_upcharges.map((s) => s.state).join(', ');
    rows.push({
      label: 'State upcharges',
      value: `Additional cost in: ${states}`,
      note: p.filings.state_upcharges.map((s) => `${s.state}: ${s.reason}`).join('. '),
    });
  }

  return rows;
}

export function FeesSection({ provider }: { provider: ProviderData }) {
  const rows = collectFees(provider);
  if (rows.length === 0) return null;

  return (
    <section className="my-12">
      <h2 className="text-subhed mb-2">Where the bill grows beyond the headline</h2>
      <p className="text-ink-muted text-sm max-w-prose mb-6">
        Costs that aren&apos;t in the plan price. The calculator factors these in where the provider
        publishes them; where they don&apos;t, we say so.
      </p>
      <dl className="space-y-5">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-[14rem_1fr] gap-2 md:gap-6 rule-bottom pb-5">
            <dt className="font-semibold text-ink small-caps text-xs">{row.label}</dt>
            <dd className="text-ink">
              <p>{row.value}</p>
              {row.note && <p className="text-ink-muted text-sm mt-1.5 max-w-prose">{row.note}</p>}
              {row.source && (
                <a href={row.source} target="_blank" rel="noopener noreferrer" className="inline-block text-xs no-underline text-ink-subtle hover:text-accent mt-2">
                  Source ↗
                </a>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
