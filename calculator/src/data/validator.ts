// =============================================================================
// data/validator.ts — Ajv wrapper for provider YAML validation
// =============================================================================

import Ajv, { type ErrorObject, type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ProviderData } from './types';

const SCHEMA_PATH = path.join(__dirname, 'provider-schema.json');

let cachedValidator: ValidateFunction<ProviderData> | null = null;

function getValidator(): ValidateFunction<ProviderData> {
  if (cachedValidator) return cachedValidator;
  const schemaJson = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  cachedValidator = ajv.compile<ProviderData>(schemaJson);
  return cachedValidator;
}

export interface ValidationResult {
  valid: boolean;
  errors: ErrorObject[];
  data: unknown;
}

export function validate(data: unknown): ValidationResult {
  const validator = getValidator();
  const valid = validator(data);
  return { valid, errors: validator.errors ?? [], data };
}

export function formatErrors(errors: ErrorObject[]): string[] {
  return errors.map((err) => {
    const loc = err.instancePath || '<root>';
    return `${loc}: ${err.message ?? 'invalid'}${err.params ? ` (${JSON.stringify(err.params)})` : ''}`;
  });
}
