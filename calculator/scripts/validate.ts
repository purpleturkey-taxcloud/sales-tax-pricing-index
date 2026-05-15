// =============================================================================
// scripts/validate.ts — CLI for validating all provider YAML files
//
// Usage: npm run validate
// Exit code: 0 if all valid, 1 if any errors. Use in CI to block bad data.
// =============================================================================

import { loadProvidersSafe } from '../src/data/loader';

function main(): void {
  console.log('Validating provider YAML files...\n');
  const { providers, errors } = loadProvidersSafe();

  if (errors.length === 0) {
    console.log(`✓ All ${providers.size} provider files valid.\n`);
    console.log('Loaded providers:');
    for (const [slug, data] of providers.entries()) {
      console.log(`  - ${data.provider.name.padEnd(14)} (${slug}) — ${data.transparency.tier}, ${data.plans.length} plan(s)`);
    }
    process.exit(0);
  }

  console.error(`✗ ${errors.length} file(s) failed validation:\n`);
  for (const { file, messages } of errors) {
    console.error(`  ${file}:`);
    for (const msg of messages) {
      console.error(`    - ${msg}`);
    }
    console.error('');
  }
  process.exit(1);
}

main();
