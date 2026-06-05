import { prisma } from '@iut-intranet/db'
import { ContentType } from '@iut-intranet/helpers/schemas/storage'

import { updateObject, uploadObject } from '@/s3.provider'

const KNOWN_CONTENT_TYPES = new Set<string>(Object.values(ContentType))

/** Le header `content-type` distant est libre : on le contraint à l'enum du provider. */
const toContentType = (header: string | null): ContentType =>
  header && KNOWN_CONTENT_TYPES.has(header)
    ? (header as ContentType)
    : ContentType.IMAGE_PNG

interface RemoteAsset {
  base64: string
  contentType: ContentType
}

const fetchAsset = async (url: string): Promise<RemoteAsset | null> => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return {
      base64: Buffer.from(await response.arrayBuffer()).toString('base64'),
      contentType: toContentType(response.headers.get('content-type')),
    }
  } catch (error) {
    console.warn(
      `Seed asset fetch failed (${url}):`,
      error instanceof Error ? error.message : error,
    )
    return null
  }
}

/** Écrit les octets sur une clé déjà présente en base (avatar, couverture). */
const seedExistingKey = async (key: string, url: string): Promise<void> => {
  const asset = await fetchAsset(url)
  if (!asset) {
    return
  }

  await updateObject({
    base64: asset.base64,
    contentType: asset.contentType,
    key,
  })
}

/** Avatars : un visuel déterministe par user, sous la clé stockée en `image`. */
const seedAvatars = async (): Promise<void> => {
  const users = await prisma.user.findMany({
    select: { firstName: true, image: true, lastName: true },
    where: { image: { not: null } },
  })

  await Promise.all(
    users.map((user) =>
      seedExistingKey(
        user.image as string,
        `https://api.dicebear.com/9.x/initials/png?seed=${encodeURIComponent(
          `${user.firstName} ${user.lastName}`,
        )}&size=256`,
      ),
    ),
  )
}

/** Couvertures d'news, sous la clé stockée en `coverUrl`. */
const seedNewsCovers = async (): Promise<void> => {
  const news = await prisma.news.findMany({
    select: { coverUrl: true },
    where: { coverUrl: { not: null } },
  })

  await Promise.all(
    news.map((news) => {
      const key = news.coverUrl as string
      // Seed picsum déterministe dérivé du nom de fichier de la clé.
      const slug =
        key
          .split('/')
          .pop()
          ?.replace(/\.[^.]+$/, '') ?? key
      return seedExistingKey(key, `https://picsum.photos/seed/${slug}/1200/630`)
    }),
  )
}

/**
 * Images à la une : jeu d'images fixe, aucune écriture en base. La clé est
 * générée par le provider depuis `fileName` (pas de clé pré-existante à viser).
 */
const HIGHLIGHT_SEEDS = ['campus', 'amphi', 'bibliotheque', 'remise-diplomes']

const seedHighlights = async (): Promise<void> => {
  await Promise.all(
    HIGHLIGHT_SEEDS.map(async (seed, index) => {
      const asset = await fetchAsset(
        `https://picsum.photos/seed/${seed}/1200/630`,
      )
      if (!asset) {
        return
      }

      await uploadObject({
        base64: asset.base64,
        contentType: asset.contentType,
        fileName: `seed-${index + 1}`,
        folder: 'highlights',
      })
    }),
  )
}

async function main() {
  await Promise.all([seedAvatars(), seedNewsCovers(), seedHighlights()])
}

main()
  .catch((error) => {
    console.error('Provider seed error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
