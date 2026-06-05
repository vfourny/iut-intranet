import { randomUUID } from 'node:crypto'

import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { AppError } from '@iut-intranet/helpers/errors'
import { ContentType } from '@iut-intranet/helpers/schemas/storage'
import { MAX_UPLOAD_BYTES } from '@iut-intranet/helpers/schemas/storage'

import { S3_BUCKET_NAME, s3Client } from '@/s3.client'

const SIGNED_URL_TTL_SECONDS = 24 * 60 * 60

const ExtensionByContentType = {
  [ContentType.IMAGE_JPEG]: 'jpg',
  [ContentType.IMAGE_PNG]: 'png',
  [ContentType.IMAGE_WEBP]: 'webp',
} as const satisfies Record<ContentType, string>

export const StorageFolders = {
  highlights: 'highlights',
  news: 'news',
  users: 'users',
} as const

type StorageFolder = keyof typeof StorageFolders

/** Folders whose objects are partitioned by a {@link subFolder} segment in their key. */
const ScopedFolder = ['users'] as const satisfies StorageFolder[]
type ScopedFolder = (typeof ScopedFolder)[number]

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

/**
 * Decodes a base64 payload, enforces the upload size limit, and writes it to the
 * given key (overwriting any existing object). Shared by {@link uploadObject}
 * (fresh key) and {@link updateObject} (existing key).
 */
const putObject = async (
  key: string,
  base64: string,
  contentType: ContentType,
): Promise<void> => {
  const body = Buffer.from(base64, 'base64')
  if (body.byteLength > MAX_UPLOAD_BYTES) {
    throw new AppError(
      'PAYLOAD_TOO_LARGE',
      'File exceeds the maximum upload size',
    )
  }

  await s3Client.send(
    new PutObjectCommand({
      Body: body,
      Bucket: S3_BUCKET_NAME,
      ContentType: contentType,
      Key: key,
    }),
  )
}

/** The raw content shared by every write to storage. */
interface ObjectBase {
  base64: string
  contentType: ContentType
}

export type UploadObjectPayload = ObjectBase & {
  fileName?: string
} & (
    | {
        folder: ScopedFolder
        subFolder: string
      }
    | {
        folder: Exclude<StorageFolder, ScopedFolder>
        subFolder?: string
      }
  )

/**
 * Uploads an object to private storage under the given folder.
 * @returns The object key (e.g. `users/<userId>/avatar.png`), to be persisted
 * and later turned into a usable URL via {@link getSignedObjectUrl} (or listed
 * via {@link listObjects} then signed, e.g. for the highlight folder).
 */
export const uploadObject = async (
  payload: UploadObjectPayload,
): Promise<string> => {
  const { base64, contentType, fileName, folder, subFolder } = payload

  const base = StorageFolders[folder]
  const prefix = subFolder ? `${base}/${subFolder}` : base
  const name = fileName ?? randomUUID()
  const key = `${prefix}/${name}.${ExtensionByContentType[contentType]}`

  await putObject(key, base64, contentType)

  return key
}

export interface UpdateObjectPayload extends ObjectBase {
  key: string
}

/**
 * Overwrites an existing object in place, keeping the same key. The new
 * `contentType` is stored as object metadata even if it differs from the one the
 * key's extension was derived from (the extension is cosmetic — the bucket is
 * private and objects are served by their `ContentType` header, not their name).
 * @returns The unchanged object key, for symmetry with {@link uploadObject}.
 */
export const updateObject = async (
  payload: UpdateObjectPayload,
): Promise<string> => {
  const { base64, contentType, key } = payload

  await putObject(key, base64, contentType)

  return key
}

export interface StorageObject {
  key: string
  lastModified?: Date
}

/**
 * Lists the objects stored under a folder prefix (e.g. `StorageFolders.highlights`).
 * Returns raw keys, not URLs: the caller signs them on read via
 * {@link getSignedObjectUrl}. The folder placeholder object (key equal to the
 * prefix itself) is filtered out.
 */
export const listObjects = async (prefix: string): Promise<StorageObject[]> => {
  const { Contents } = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
      Prefix: `${prefix}/`,
    }),
  )

  return (Contents ?? [])
    .filter((object) => object.Key && object.Key !== prefix)
    .map((object) => ({
      key: object.Key as string,
      lastModified: object.LastModified,
    }))
}

/** Permanently removes an object from storage (no-op if the key doesn't exist). */
export const deleteObject = async (key: string): Promise<void> => {
  await s3Client.send(
    new DeleteObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key }),
  )
}
