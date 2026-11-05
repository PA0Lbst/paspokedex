export type ApiErrorKind = 'http' | 'network' | 'invalid';

/** Every failure of the PokeAPI client. The error views show `message`. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  /** HTTP status for `http` errors, null otherwise. */
  readonly status: number | null;

  constructor(kind: ApiErrorKind, message: string, status: number | null = null) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

/** A short message for the user, whatever went wrong. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.kind === 'network') return "You seem to be offline. Check your connection and try again.";
    if (error.status === 404) return "This Pokémon doesn't exist.";
  }
  return "We couldn't load the Pokémon. Check your connection and try again.";
}
