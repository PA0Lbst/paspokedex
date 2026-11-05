import { ApiError } from './api-error';

/**
 * Small readers for `unknown` JSON. They throw an `invalid` ApiError when the shape is wrong,
 * so the rest of the app only sees typed data (no `any`, no `as`).
 */

export type JsonRecord = Record<string, unknown>;

function invalid(what: string): ApiError {
  return new ApiError('invalid', `Unexpected API response: ${what}`);
}

export function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function readRecord(value: unknown, what: string): JsonRecord {
  if (!isRecord(value)) throw invalid(what);
  return value;
}

export function readString(obj: JsonRecord, key: string): string {
  const value = obj[key];
  if (typeof value !== 'string') throw invalid(key);
  return value;
}

export function readNumber(obj: JsonRecord, key: string): number {
  const value = obj[key];
  if (typeof value !== 'number') throw invalid(key);
  return value;
}

/** A number that the API sometimes sends as null (e.g. base_experience). */
export function readOptionalNumber(obj: JsonRecord, key: string): number | null {
  const value = obj[key];
  if (value === null || value === undefined) return null;
  if (typeof value !== 'number') throw invalid(key);
  return value;
}

export function readNullableString(obj: JsonRecord, key: string): string | null {
  const value = obj[key];
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') throw invalid(key);
  return value;
}

export function readArray(obj: JsonRecord, key: string): unknown[] {
  const value = obj[key];
  if (!Array.isArray(value)) throw invalid(key);
  return value;
}

/** `{ name, url }`, the API's "named resource". */
export function readNamedResource(value: unknown, what: string): { name: string; url: string } {
  const obj = readRecord(value, what);
  return { name: readString(obj, 'name'), url: readString(obj, 'url') };
}
