import { NewsStatus } from '@iut-intranet/db'
import { AppError } from '@iut-intranet/helpers/errors'
import type {
  CreateNewsInput,
  UpdateNewsInput,
} from '@iut-intranet/helpers/schemas/news'

/**
 * Resolves the publication date to persist from the payload's status.
 * @param {CreateNewsInput | UpdateNewsInput} payload - Write payload; its `status` discriminates the shape
 * @param {{ publishedAt: Date | null; status: NewsStatus } | null} existing - The existing news' publication date and status, or `null` on create. Its `publishedAt` stays nullable (a news that exists but was never published); its `status` decides whether a PUBLISHED date is preserved or stamped now.
 * @returns {Date | null} `null` for a DRAFT, the payload date for a SCHEDULED (the schema guarantees its presence), the existing date for a news already PUBLISHED (a simple edit doesn't reset it) or `now` at its first publication, and the existing date untouched for an ARCHIVED
 * @remarks Structural mapping only: `publishedAt` exists on the payload solely for the SCHEDULED variant, so the date is never user-driven for the others. A first publication — including from SCHEDULED, whose planned date is potentially future — is stamped to `now` so it never becomes the real go-live date. Archiving preserves the news' history rather than resetting it. The temporal rule (a scheduled date must be future) stays in {@link assertPublishDateMatchesStatus}.
 */
export const resolvePublishedAt = (
  payload: CreateNewsInput | UpdateNewsInput,
  existing: { publishedAt: Date | null; status: NewsStatus } | null,
): Date | null => {
  if (payload.status === NewsStatus.SCHEDULED) return payload.publishedAt
  if (payload.status === NewsStatus.PUBLISHED) {
    const wasPublished = existing?.status === NewsStatus.PUBLISHED
    return wasPublished ? (existing.publishedAt ?? new Date()) : new Date()
  }
  if (payload.status === NewsStatus.ARCHIVED)
    return existing?.publishedAt ?? null
  return null
}

/**
 * Validates the temporal coherence between a news status and its publication date.
 * @param {NewsStatus} status - The status the news is moving to
 * @param {Date | null} [publishedAt] - The publication date, when one is set
 * @returns {void}
 * @throws {AppError} BAD_REQUEST when a SCHEDULED news lacks a future date, or a PUBLISHED news carries a future one
 * @remarks Only the clock-dependent rules live here; the structural ones (a draft has no date, a scheduled news has one) are enforced upfront by the input schema. Shared by create/update.
 */
export const assertPublishDateMatchesStatus = (
  status: NewsStatus,
  publishedAt?: Date | null,
) => {
  const now = new Date()

  if (status === NewsStatus.SCHEDULED && (!publishedAt || publishedAt <= now)) {
    throw new AppError(
      'BAD_REQUEST',
      'A scheduled news must have a future publication date',
    )
  }

  if (status === NewsStatus.PUBLISHED && publishedAt && publishedAt > now) {
    throw new AppError(
      'BAD_REQUEST',
      'A published news cannot have a future publication date',
    )
  }
}
