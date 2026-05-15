/**
 * Postbuild assertion: every /{slug}-pricing and /{a}-vs-{b}-pricing page in
 * the static export contains the JSON-LD shapes required for AEO/Rich Results
 * indexing, plus a visible "Last updated" string.
 *
 * Fails (exit 1) if any expected node is missing — turning a missed schema
 * into a CI red, not a silent regression.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { loadProviders } from '../../calculator/src/data/loader';

const WEB_ROOT = path.join(__dirname, '..');
const STATIC_DIR = path.join(WEB_ROOT, '.next', 'server', 'app');

interface Check {
  path: string;
  htmlFile: string;
  kind: 'provider' | 'pair';
}

function pairSlug(a: string, b: string): string {
  return [a, b].sort().join('-vs-');
}

function htmlPathForRoute(internal: string): string {
  // Next 15 emits app-router HTML at .next/server/app/<route>.html
  return path.join(STATIC_DIR, `${internal}.html`);
}

function buildChecks(): Check[] {
  const providers = loadProviders();
  const slugs = Array.from(providers.keys()).sort();
  const checks: Check[] = [];

  for (const slug of slugs) {
    checks.push({
      path: `/${slug}-pricing`,
      htmlFile: htmlPathForRoute(`p/${slug}`),
      kind: 'provider',
    });
  }

  for (let i = 0; i < slugs.length; i++) {
    for (let j = i + 1; j < slugs.length; j++) {
      const pair = pairSlug(slugs[i], slugs[j]);
      checks.push({
        path: `/${pair}-pricing`,
        htmlFile: htmlPathForRoute(`c/${pair}`),
        kind: 'pair',
      });
    }
  }

  return checks;
}

function extractJsonLd(html: string): unknown[] {
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  const out: unknown[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      out.push(JSON.parse(m[1]));
    } catch {
      // Skip malformed; the validation below will surface the missing type.
    }
  }
  return out;
}

interface Failure {
  path: string;
  reason: string;
}

function runChecks(): Failure[] {
  const checks = buildChecks();
  const failures: Failure[] = [];

  for (const c of checks) {
    if (!fs.existsSync(c.htmlFile)) {
      failures.push({ path: c.path, reason: `HTML not found at ${path.relative(WEB_ROOT, c.htmlFile)}` });
      continue;
    }
    const html = fs.readFileSync(c.htmlFile, 'utf-8');
    const blobs = extractJsonLd(html);
    const types = blobs.map((b: any) => b?.['@type']);

    const hasProduct = types.includes('Product');
    const hasFaq = types.includes('FAQPage');
    const hasTable = types.includes('Table');
    const faqBlob = blobs.find((b: any) => b?.['@type'] === 'FAQPage') as any;
    const faqCount = Array.isArray(faqBlob?.mainEntity) ? faqBlob.mainEntity.length : 0;
    const hasUpdated = /Last updated/i.test(html);

    if (!hasProduct) failures.push({ path: c.path, reason: 'Missing Product JSON-LD' });
    if (!hasFaq) failures.push({ path: c.path, reason: 'Missing FAQPage JSON-LD' });
    if (!hasTable) failures.push({ path: c.path, reason: 'Missing Table JSON-LD' });
    if (faqCount < 5) failures.push({ path: c.path, reason: `FAQPage has only ${faqCount} questions, expected ≥5` });
    if (!hasUpdated) failures.push({ path: c.path, reason: 'Missing "Last updated" string' });

    if (c.kind === 'pair') {
      const productCount = types.filter((t) => t === 'Product').length;
      if (productCount < 2) failures.push({ path: c.path, reason: `Pair page has ${productCount} Product schema(s), expected 2` });
    }
  }

  return failures;
}

function main(): void {
  if (!fs.existsSync(STATIC_DIR)) {
    console.log('postbuild: no static output found — skipping AEO check (likely a dev run).');
    return;
  }

  const failures = runChecks();
  if (failures.length === 0) {
    console.log('✓ AEO check passed — all provider and pair pages have required JSON-LD.');
    return;
  }
  console.error(`✗ AEO check FAILED with ${failures.length} issue(s):`);
  for (const f of failures) {
    console.error(`  ${f.path}: ${f.reason}`);
  }
  process.exit(1);
}

main();
