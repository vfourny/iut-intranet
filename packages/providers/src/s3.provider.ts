import { randomUUID } from 'node:crypto'

import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { AppError } from '@iut-intranet/helpers/errors'
import { MAX_UPLOAD_BYTES } from '@iut-intranet/helpers/schemas/storage'

import { S3_BUCKET_NAME, s3Client } from '@/s3.client'

const SIGNED_URL_TTL_SECONDS = 24 * 60 * 60

const extensionByContentType = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const

type AvatarContentType = keyof typeof extensionByContentType

const STORAGE_FOLDERS = {
  avatars: 'avatars/',
  carousel: 'image/',
  cover: 'covers/',
} as const

type StorageFolder = keyof typeof STORAGE_FOLDERS

export const CAROUSEL_IMAGE_PREFIX = STORAGE_FOLDERS.carousel

/**
 * Generates a temporary presigned URL granting read access to a private object.
 * The bucket is private, so stored object keys are turned into usable URLs only
 * at read time — never persisted (the signature expires).
 */
export const getSignedObjectUrl = (key: string): Promise<string> =>
  getSignedUrl(
    s3Client,
    new GetObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key }),
    {
      expiresIn: SIGNED_URL_TTL_SECONDS,
    },
  )

interface UploadObjectBase {
  base64: string
  contentType: AvatarContentType
}

/** Folders whose objects are partitioned by a {@link subPath} segment in their key. */
const SCOPED_FOLDERS = ['avatars'] as const satisfies StorageFolder[]
type ScopedFolder = (typeof SCOPED_FOLDERS)[number]

export type UploadObjectPayload = UploadObjectBase &
  (
    | {
        folder: ScopedFolder
        /** Segment inserted between the folder and the generated uuid (e.g. a userId). */
        subPath: string
      }
    | {
        folder: Exclude<StorageFolder, ScopedFolder>
        subPath?: string
      }
  )

/**
 * Uploads an object to private storage under the given folder.
 * @returns The object key (e.g. `avatars/<userId>/<uuid>.png`), to be persisted
 * and later turned into a usable URL via {@link getSignedObjectUrl} (or listed
 * and signed via {@link listImageObjects} for the carousel folder).
 */
export const uploadObject = async (
  payload: UploadObjectPayload,
): Promise<string> => {
  const { base64, contentType, folder, subPath } = payload

  const body = Buffer.from(base64, 'base64')
  if (body.byteLength > MAX_UPLOAD_BYTES) {
    throw new AppError(
      'PAYLOAD_TOO_LARGE',
      'File exceeds the maximum upload size',
    )
  }

  const base = STORAGE_FOLDERS[folder]
  const prefix = subPath ? `${base}${subPath}/` : base
  const key = `${prefix}${randomUUID()}.${extensionByContentType[contentType]}`

  await s3Client.send(
    new PutObjectCommand({
      Body: body,
      Bucket: S3_BUCKET_NAME,
      ContentType: contentType,
      Key: key,
    }),
  )

  return key
}

export interface CarouselImageObject {
  id: string
  url: string
}

export const listImageObjects = async (): Promise<CarouselImageObject[]> => {
  const { Contents } = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
      Prefix: CAROUSEL_IMAGE_PREFIX,
    }),
  )

  const objects = (Contents ?? [])
    .filter((object) => object.Key && object.Key !== CAROUSEL_IMAGE_PREFIX)
    .sort(
      (a, b) =>
        (b.LastModified?.getTime() ?? 0) - (a.LastModified?.getTime() ?? 0),
    )

  return Promise.all(
    objects.map(async (object) => {
      const key = object.Key as string

      return {
        id: key,
        url: await getSignedObjectUrl(key),
      }
    }),
  )
}
