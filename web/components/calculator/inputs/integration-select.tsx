'use client';

import type { IntegrationType } from '../../../../calculator/src/types';

const OPTIONS: Array<{ value: IntegrationType; label: string }> = [
  { value: 'shopify', label: 'Shopify' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'bigcommerce', label: 'BigCommerce' },
  { value: 'woocommerce', label: 'WooCommerce' },
  { value: 'chargebee', label: 'Chargebee' },
  { value: 'quickbooks', label: 'QuickBooks' },
  { value: 'netsuite', label: 'NetSuite' },
  { value: 'sap', label: 'SAP' },
  { value: 'oracle', label: 'Oracle' },
  { value: 'dynamics', label: 'Dynamics' },
  { value: 'custom_api', label: 'Custom (API)' },
  { value: 'csv_only', label: 'Spreadsheet / CSV only' },
];

export function IntegrationSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: IntegrationType;
  onChange: (v: IntegrationType) => void;
}) {
  return (
    <div>
      <label className="small-caps text-xs text-ink-subtle block mb-2">{label}</label>
      <select
        className="w-full h-9 px-3 bg-paper-raised border border-rule text-sm text-ink focus:border-accent focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value as IntegrationType)}
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
