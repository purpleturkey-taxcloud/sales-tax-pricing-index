// =============================================================================
// scripts/confidence-report.ts — Audit data quality across all providers
//
// Walks every provider YAML, collects all confidence ratings, and reports
// the distribution per provider. Flags providers below quality thresholds.
//
// Usage: npm run confidence-report
//
// Confidence quality tiers (Anthropic-style: simple, defensible buckets):
//   - "Primary":      A + B (provider's own pricing page or help center)
//   - "Corroborated": C + D (aggregators and competitor blogs)
//   - "Anecdotal":    E + F + G (forums, internal notes, estimates)
//
// A provider with <50% Primary should be flagged for additional research.
// =============================================================================

import { loadProvidersSafe } from '../src/data/loader';

type Bucket = 'Primary' | 'Corroborated' | 'Anecdotal';

const BUCKET_MAP: Record<string, Bucket> = {
  A: 'Primary',
  B: 'Primary',
  C: 'Corroborated',
  D: 'Corroborated',
  E: 'Anecdotal',
  F: 'Anecdotal',
  G: 'Anecdotal',
};

const PRIMARY_THRESHOLD_PCT = 50;

function collectConfidenceRatings(obj: unknown, ratings: string[] = []): string[] {
  if (Array.isArray(obj)) {
    obj.forEach((item) => collectConfidenceRatings(item, ratings));
  } else if (obj !== null && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'confidence' && typeof value === 'string') {
        ratings.push(value);
      } else {
        collectConfidenceRatings(value, ratings);
      }
    }
  }
  return ratings;
}

function bucketize(ratings: string[]): Record<Bucket, number> {
  const buckets: Record<Bucket, number> = { Primary: 0, Corroborated: 0, Anecdotal: 0 };
  for (const r of ratings) {
    const b = BUCKET_MAP[r];
    if (b) buckets[b]++;
  }
  return buckets;
}

function pct(n: number, total: number): string {
  return total === 0 ? '  0%' : `${Math.round((n / total) * 100).toString().padStart(3)}%`;
}

function main(): void {
  console.log('Confidence Report — Provider YAML Data Quality');
  console.log('='.repeat(78));
  console.log('');

  const { providers, errors } = loadProvidersSafe();
  if (errors.length > 0) {
    console.error('Cannot generate report — validation errors present. Run `npm run validate` first.');
    process.exit(1);
  }

  console.log('Provider        Total  Primary  Corroborated  Anecdotal  Status');
  console.log('-'.repeat(78));

  const flagged: string[] = [];
  for (const data of providers.values()) {
    const ratings = collectConfidenceRatings(data);
    const buckets = bucketize(ratings);
    const total = ratings.length;
    const primaryPct = total === 0 ? 0 : Math.round((buckets.Primary / total) * 100);
    const status = primaryPct >= PRIMARY_THRESHOLD_PCT ? '✓ Good' : '⚠ Flag for research';

    if (primaryPct < PRIMARY_THRESHOLD_PCT) flagged.push(data.provider.name);

    console.log(
      data.provider.name.padEnd(15) +
        total.toString().padStart(5) +
        '  ' +
        pct(buckets.Primary, total).padStart(6) +
        '   ' +
        pct(buckets.Corroborated, total).padStart(11) +
        '   ' +
        pct(buckets.Anecdotal, total).padStart(7) +
        '   ' +
        status,
    );
  }

  console.log('');
  console.log(`Threshold: Primary (A+B sources) ≥ ${PRIMARY_THRESHOLD_PCT}%`);
  if (flagged.length > 0) {
    console.log('');
    console.log('Providers needing additional primary-source research:');
    for (const name of flagged) console.log(`  - ${name}`);
  }
  console.log('');
}

main();
