import type { ProviderData } from '../../../calculator/src/data/types';
import payload from './providers.json';

interface Payload {
  generatedAt: string;
  slugs: string[];
  providers: Record<string, ProviderData>;
}

// The generated JSON is structurally valid per the YAML schema (Ajv-validated
// in the prebuild), but the calculator's TS types are slightly stricter than
// the JSON Schema. Cast through `unknown` to accept the runtime shape.
const data = payload as unknown as Payload;

export const PROVIDER_SLUGS: readonly string[] = data.slugs;

export function getProvider(slug: string): ProviderData | undefined {
  return data.providers[slug];
}

export function getAllProviders(): ProviderData[] {
  return data.slugs.map((s) => data.providers[s]);
}

export function getProvidersMap(): Map<string, ProviderData> {
  return new Map(Object.entries(data.providers));
}

export const DATA_GENERATED_AT: string = data.generatedAt;
