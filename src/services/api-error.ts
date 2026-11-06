import { t } from '@/i18n';

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
    if (error.kind === 'network') return t('errorOffline');
    if (error.status === 404) return t('errorNotFound');
  }
  return t('errorDefault');
}
