import { prisma } from '@iut-intranet/db'
import { ContentType } from '@iut-intranet/helpers/schemas/storage'

import {
  deleteObject,
  listObjects,
  StorageFolders,
  updateObject,
  uploadObject,
} from '@/s3.provider'

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
      // La clé est `news/<newsId>/cover.png` : le nom de fichier est constant,
      // donc on dérive le seed picsum du segment `newsId` (unique, déterministe)
      // pour garder une couverture distincte par news.
      const segments = key.split('/')
      const seed = segments[segments.length - 2] ?? key
      return seedExistingKey(key, `https://picsum.photos/seed/${seed}/1200/630`)
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

/**
 * Vide le bucket des objets seedés/uploadés avant de le re-semer. Sans ça, un
 * reset réécrit bien les clés courantes (dérivées de la base, elle aussi remise
 * à zéro) mais laisse les objets des runs précédents en orphelins — visibles
 * notamment dans le carrousel « à la une », qui liste tout le dossier.
 */
const purgeStorage = async (): Promise<void> => {
  await Promise.all(
    Object.values(StorageFolders).map(async (folder) => {
      const objects = await listObjects(folder)
      await Promise.all(objects.map((object) => deleteObject(object.key)))
    }),
  )
}

async function main() {
  await purgeStorage()
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
