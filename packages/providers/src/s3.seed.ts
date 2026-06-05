import { prisma } from '@iut-intranet/db'
import { ContentType } from '@iut-intranet/helpers/schemas/storage'

import { updateObject, uploadObject } from '@/s3.provider'

const KNOWN_CONTENT_TYPES = new Set<string>(Object.values(ContentType))

const toContentType = (header: string | null): ContentType =>
  header && KNOWN_CONTENT_TYPES.has(header)
    ? (header as ContentType)
    : ContentType.IMAGE_PNG

interface RemoteAsset {
  base64: string
  contentType: ContentType
}

const fetchAsset = async (url: string): Promise<RemoteAsset> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Seed asset fetch failed (${url}): HTTP ${response.status}`)
  }
  return {
    base64: Buffer.from(await response.arrayBuffer()).toString('base64'),
    contentType: toContentType(response.headers.get('content-type')),
  }
}

/** Écrit les octets sur une clé déjà présente en base (avatar, couverture). */
const seedExistingKey = async (key: string, url: string): Promise<void> => {
  const asset = await fetchAsset(url)

  await updateObject({
    base64: asset.base64,
    contentType: asset.contentType,
    key,
  })
}

/** Avatars : une vraie photo de portrait déterministe par user, sous la clé stockée en `image`. */
const seedAvatars = async (): Promise<void> => {
  const users = await prisma.user.findMany({
    select: { firstName: true, image: true, lastName: true },
    where: { image: { not: null } },
  })

  await Promise.all(
    users.map((user) =>
      seedExistingKey(
        user.image as string,
        // pravatar : portrait réel, déterministe via `u` (le nom du user).
        `https://i.pravatar.cc/256?u=${encodeURIComponent(
          `${user.firstName} ${user.lastName}`,
        )}`,
      ),
    ),
  )
}

const seedNewsCovers = async (): Promise<void> => {
  const news = await prisma.news.findMany({
    select: { coverUrl: true },
    where: { coverUrl: { not: null } },
  })

  await Promise.all(
    news.map((news) => {
      const key = news.coverUrl as string
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
