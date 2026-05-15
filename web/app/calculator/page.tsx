import type { Metadata } from 'next';
import { CalculatorForm } from '@/components/calculator/calculator-form';
import { getAllProviders } from '@/lib/data/providers';
import { lastUpdatedAcross } from '@/lib/last-updated';
import { UpdatedBadge } from '@/components/site/updated-badge';

export const metadata: Metadata = {
  title: 'Sales tax compliance pricing calculator',
  description:
    'Move the sliders to estimate annual cost for TaxCloud, Avalara, TaxJar, Numeral, Kintsugi, Anrok, Sphere, and Zamp based on your order volume, state footprint, and filing frequency.',
};

export default function CalculatorPage() {
  const providers = getAllProviders();
  const date = lastUpdatedAcross(providers);
  const providersJson = Object.fromEntries(providers.map((p) => [p.provider.slug, p]));

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10">
        <p className="small-caps text-xs text-ink-subtle">Tool</p>
        <h1 className="text-hed mt-2">Pricing calculator</h1>
        <p className="text-ink-muted mt-3 max-w-prose">
          Move the inputs. We rank all eight providers by what they&apos;d actually cost
          your business, including the SST states where you have economic nexus only.
          Estimates use each provider&apos;s published pricing, or ranges from real buyer
          contracts when they don&apos;t publish.
        </p>
        <div className="mt-4">
          <UpdatedBadge date={date} />
        </div>
      </header>
      <CalculatorForm providersJson={providersJson} />
    </div>
  );
}
