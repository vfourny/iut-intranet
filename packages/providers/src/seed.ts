import { PutObjectCommand } from '@aws-sdk/client-s3'
import { prisma } from '@iut-intranet/db'

import { S3_BUCKET_NAME, s3Client } from '@/s3.client'
import { StorageFolders } from '@/s3.provider'

/**
 * `provider:seed` — alimente le bucket MinIO avec les images correspondant aux
 * clés déjà écrites en base par `db:seed` (avatars `user.image`, couvertures
 * `news.coverUrl`), plus le jeu d'images à la une (qui, lui, n'a aucune
 * ligne en base et est piloté uniquement par le contenu S3, listé via
 * `listObjects`).
 *
 * Deux commandes distinctes et ordonnées : `db:seed` écrit les clés, puis
 * `provider:seed` pousse les octets — la base peut donc être seedée sans MinIO.
 * Les clés ne sont pas reconstruites ici : on relit les valeurs réelles des
 * colonnes, il n'y a donc aucune convention à maintenir alignée avec `db`.
 *
 * Les octets viennent de services placeholder externes ; en cas d'indispo
 * (offline) le seed dégrade proprement (warn) sans faire échouer la commande.
 */

const HIGHLIGHT_SEEDS = ['campus', 'amphi', 'bibliotheque', 'remise-diplomes']

interface RemoteAsset {
  body: Buffer
  contentType: string
}

const fetchAsset = async (url: string): Promise<RemoteAsset | null> => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return {
      body: Buffer.from(await response.arrayBuffer()),
      contentType: response.headers.get('content-type') ?? 'image/png',
    }
  } catch (error) {
    console.warn(
      `Seed asset fetch failed (${url}):`,
      error instanceof Error ? error.message : error,
    )
    return null
  }
}

const seedObject = async (key: string, url: string): Promise<void> => {
  const asset = await fetchAsset(url)
  if (!asset) {
    return
  }

  await s3Client.send(
    new PutObjectCommand({
      Body: asset.body,
      Bucket: S3_BUCKET_NAME,
      ContentType: asset.contentType,
      Key: key,
    }),
  )
}

/** Avatars : un visuel déterministe par user, sous la clé stockée en `image`. */
const seedAvatars = async (): Promise<void> => {
  const users = await prisma.user.findMany({
    select: { firstName: true, image: true, lastName: true },
    where: { image: { not: null } },
  })

  await Promise.all(
    users.map((user) =>
      seedObject(
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
      return seedObject(key, `https://picsum.photos/seed/${slug}/1200/630`)
    }),
  )
}

/** Images à la une : jeu d'images fixe, aucune écriture en base. */
const seedHighlights = async (): Promise<void> => {
  await Promise.all(
    HIGHLIGHT_SEEDS.map((seed, index) =>
      seedObject(
        `${StorageFolders.highlights}/seed-${index + 1}.jpg`,
        `https://picsum.photos/seed/${seed}/1200/630`,
      ),
    ),
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
