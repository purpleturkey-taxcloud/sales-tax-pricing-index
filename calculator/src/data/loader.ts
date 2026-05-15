// =============================================================================
// data/loader.ts — Load + validate provider YAML files
//
// loadProviders() reads every providers/*.yaml file, validates each against
// the JSON Schema, and returns a Map<slug, ProviderData>. Throws on any
// validation failure to ensure data integrity.
//
// loadProvidersSafe() returns errors instead of throwing — useful for CI.
// =============================================================================

import * as fs from 'node:fs';
import * as path from 'node:path';
import yaml from 'js-yaml';
import type { ProviderData } from './types';
import { formatErrors, validate, type ValidationResult } from './validator';

// Default location of provider YAML files; can be overridden for tests
const DEFAULT_PROVIDERS_DIR = path.join(__dirname, '..', '..', 'providers');

export interface LoadResult {
  providers: Map<string, ProviderData>;
  errors: Array<{ file: string; messages: string[] }>;
}

function readProviderFiles(dir: string): { file: string; content: string }[] {
  if (!fs.existsSync(dir)) {
    throw new Error(`Providers directory not found: ${dir}`);
  }
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .map((file) => ({
      file,
      content: fs.readFileSync(path.join(dir, file), 'utf-8'),
    }));
}

function parseYaml(file: string, content: string): unknown {
  try {
    // Use JSON_SCHEMA to prevent js-yaml from auto-converting ISO dates to
    // Date objects. We want them to stay as strings so the JSON Schema
    // validator can check them with a string pattern.
    return yaml.load(content, { schema: yaml.JSON_SCHEMA });
  } catch (err) {
    throw new Error(`Failed to parse ${file}: ${(err as Error).message}`);
  }
}

/**
 * Load all provider YAML files, validating each. Returns errors collected per file
 * rather than throwing — suitable for CI reporting.
 */
export function loadProvidersSafe(dir: string = DEFAULT_PROVIDERS_DIR): LoadResult {
  const providers = new Map<string, ProviderData>();
  const errors: LoadResult['errors'] = [];

  for (const { file, content } of readProviderFiles(dir)) {
    let parsed: unknown;
    try {
      parsed = parseYaml(file, content);
    } catch (err) {
      errors.push({ file, messages: [(err as Error).message] });
      continue;
    }

    const result: ValidationResult = validate(parsed);
    if (!result.valid) {
      errors.push({ file, messages: formatErrors(result.errors) });
      continue;
    }

    const data = result.data as ProviderData;
    if (providers.has(data.provider.slug)) {
      errors.push({ file, messages: [`Duplicate slug: ${data.provider.slug}`] });
      continue;
    }
    providers.set(data.provider.slug, data);
  }

  return { providers, errors };
}

/**
 * Load all provider YAML files, throwing on any validation error.
 * Use this in calculator code where bad data should halt execution.
 */
export function loadProviders(dir?: string): Map<string, ProviderData> {
  const { providers, errors } = loadProvidersSafe(dir);
  if (errors.length > 0) {
    const summary = errors.map((e) => `  ${e.file}:\n    - ${e.messages.join('\n    - ')}`).join('\n');
    throw new Error(`Provider YAML validation failed:\n${summary}`);
  }
  return providers;
}
