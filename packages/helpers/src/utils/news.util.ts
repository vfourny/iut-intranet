import { NewsStatus } from '@iut-intranet/db/enums'

/**
 * Resolves the publication date of a news from its status.
 * @param {NewsStatus | undefined} status - The status the news is moving to (undefined on a partial update)
 * @param {Date | null | undefined} publishedAt - The publication date carried by the input
 * @param {Date | null} publishedDate - The date to apply when the status is PUBLISHED
 * @returns {Date | null | undefined} `null` for a DRAFT, `publishedDate` for a PUBLISHED, the untouched `publishedAt` otherwise (SCHEDULED or unknown status)
 * @remarks Pure (clock-free): the caller owns the PUBLISHED date — the schema defers to the service with `null`, the service passes `now` (create) or the existing date (update). The structural mapping lives here, the temporal rule stays in the service.
 */
export const resolvePublishedAt = (
  status: NewsStatus | undefined,
  publishedAt: Date | null | undefined,
  publishedDate: Date | null,
) => {
  switch (status) {
    case NewsStatus.DRAFT:
      return null
    case NewsStatus.PUBLISHED:
      return publishedDate
    default:
      return publishedAt
  }
}
