'use client';

import { useMemo, useState } from 'react';
import type { ProviderData } from '../../../calculator/src/data/types';
import type { UserInputs } from '../../../calculator/src/types';
import { calculate } from '@/lib/calc-client';
import { getAssumptions } from '@/lib/integration-assumptions';
import { LogSlider } from './inputs/log-slider';
import { NumberStepper } from './inputs/number-stepper';
import { IntegrationSelect } from './inputs/integration-select';
import { SstStateGrid } from './inputs/sst-state-grid';
import { ProviderCard } from './provider-card';

const REVENUE_STOPS = [500_000, 1_000_000, 5_000_000, 25_000_000, 100_000_000, 500_000_000];
const ORDER_STOPS = [1_000, 5_000, 25_000, 100_000, 250_000, 1_000_000, 5_000_000];

// Form-visible inputs. The other UserInputs fields are filled with sensible
// defaults below (annual billing, monthly cadence, no special requirements).
interface FormState {
  integrationType: UserInputs['integrationType'];
  annualFilings: number;
  annualOrders: number;
  annualRevenueUSD: number;
  statesFiling: number;
  registrationBacklog: number;
}

const INITIAL_FORM: FormState = {
  integrationType: 'shopify',
  annualFilings: 200,
  annualOrders: 250_000,
  annualRevenueUSD: 25_000_000,
  statesFiling: 20,
  registrationBacklog: 0,
};

// Pre-select 10 SST states so the default view reflects a realistic mid-market
// buyer rather than a never-selected-SST baseline. Matches the Mid-Market
// scenario on comparison pages.
const INITIAL_SST_STATES = ['AR', 'GA', 'IN', 'IA', 'KS', 'KY', 'MI', 'MN', 'NE', 'NV'] as const;

function formatShortMoney(v: number): string {
  if (v >= 1_000_000) return `$${v / 1_000_000}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

function formatShortCount(v: number): string {
  if (v >= 1_000_000) return `${v / 1_000_000}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return `${v}`;
}

/**
 * Build the full UserInputs object the calculator expects, filling in the
 * fields the form no longer asks about with sensible defaults derived from
 * the visible inputs and integration-specific assumptions.
 */
function buildUserInputs(form: FormState, sstCount: number): UserInputs {
  const { taxableShare } = getAssumptions(form.integrationType);

  // Order count comes directly from the buyer. Drives TaxJar's, TaxCloud's,
  // and Avalara's order-tier pickers — providers whose subscription plans
  // are priced by volume.
  const monthlyOrders = Math.round(form.annualOrders / 12);

  // Taxable transaction volume for bps pricers (Anrok). Applies the
  // integration's typical taxable share rather than treating 100% of revenue
  // as taxable — SaaS profiles drop to ~50%, ERP/B2B to ~50-60%, DTC ecom
  // stays around 85%.
  const monthlyTransactionVolumeUSD = Math.round((form.annualRevenueUSD * taxableShare) / 12);

  return {
    monthlyOrders,
    monthlyTransactionVolumeUSD,
    annualRevenueUSD: form.annualRevenueUSD,
    statesFiling: form.statesFiling,
    statesPhysicalNexus: 0,           // form no longer asks; SST grid handles physical-nexus disqualification
    filingFrequency: 'monthly',       // unused when annualFilings is provided
    registrationBacklog: form.registrationBacklog,
    integrationType: form.integrationType,
    requiresApiAccess: false,
    requiresExemptionCertificateMgmt: false,
    requiresInternationalVatGst: false,
    requiresVdaSupport: false,
    billingCadence: 'annual',
    annualFilings: form.annualFilings,
    sstEligibleStates: sstCount,
  };
}

export function CalculatorForm({ providersJson }: { providersJson: Record<string, ProviderData> }) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [sstStates, setSstStates] = useState<Set<string>>(() => new Set(INITIAL_SST_STATES));

  const providersMap = useMemo(() => new Map(Object.entries(providersJson)), [providersJson]);
  const effectiveInputs = useMemo<UserInputs>(
    () => buildUserInputs(form, sstStates.size),
    [form, sstStates],
  );
  const results = useMemo(() => {
    try {
      return calculate(effectiveInputs, providersMap);
    } catch (e) {
      console.error('calculator error', e);
      return [];
    }
  }, [effectiveInputs, providersMap]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[20rem_1fr] gap-10">
      {/* Form */}
      <aside className="lg:sticky lg:top-6 lg:self-start space-y-7 pb-8 lg:pb-0">
        <div>
          <h2 className="font-serif text-xl font-semibold mb-1">Your business</h2>
          <p className="text-xs text-ink-subtle">Results update as you change inputs.</p>
        </div>

        <IntegrationSelect
          label="Primary integration"
          value={form.integrationType}
          onChange={(v) => set('integrationType', v)}
        />

        <NumberStepper
          label="Number of annual filings"
          value={form.annualFilings}
          onChange={(v) => set('annualFilings', v)}
          min={0}
          max={1000}
          step={10}
          suffix="filings/year"
        />

        <LogSlider
          label="Annual orders / transactions"
          stops={ORDER_STOPS}
          value={form.annualOrders}
          onChange={(v) => set('annualOrders', v)}
          format={formatShortCount}
        />

        <LogSlider
          label="Estimated annual revenue"
          stops={REVENUE_STOPS}
          value={form.annualRevenueUSD}
          onChange={(v) => set('annualRevenueUSD', v)}
          format={formatShortMoney}
        />

        <NumberStepper
          label="Number of states you're filing in today"
          value={form.statesFiling}
          onChange={(v) => set('statesFiling', v)}
          min={0}
          max={50}
          suffix="states"
        />

        <NumberStepper
          label="Number of new registrations needed"
          value={form.registrationBacklog}
          onChange={(v) => set('registrationBacklog', v)}
          min={0}
          max={50}
          suffix="states"
        />

        <SstStateGrid
          label="SST states with economic nexus"
          selected={sstStates}
          onChange={setSstStates}
          filingCap={form.statesFiling}
        />
      </aside>

      {/* Results */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-serif text-xl font-semibold">Estimated annual cost</h2>
          <p className="text-xs text-ink-subtle small-caps">Cheapest first</p>
        </div>
        {results.length === 0 && (
          <p className="text-ink-subtle">Couldn&apos;t compute estimates. Check the console.</p>
        )}
        {results.map((r, i) => (
          <ProviderCard key={r.slug} estimate={r} rank={i + 1} />
        ))}
        <p className="text-xs text-ink-subtle mt-6 max-w-prose">
          These are estimates from each provider&apos;s published pricing, or when they don&apos;t
          publish, ranges from real buyer contracts. Not a quote. Each provider may run current
          deals or surcharges that shift the math.{' '}
          <a href="/methodology" className="no-underline hover:text-accent">See methodology</a> for
          how we rate sources.
        </p>
      </section>
    </div>
  );
}
