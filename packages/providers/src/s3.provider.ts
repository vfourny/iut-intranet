import { randomUUID } from 'node:crypto'

import {
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getServerEnv } from '@iut-intranet/helpers/env'
import { AppError } from '@iut-intranet/helpers/errors'

const {
  S3_ACCESS_KEY_ID,
  S3_AVATARS_BUCKET,
  S3_ENDPOINT,
  S3_REGION,
  S3_SECRET_ACCESS_KEY,
} = getServerEnv(
  'S3_ACCESS_KEY_ID',
  'S3_AVATARS_BUCKET',
  'S3_ENDPOINT',
  'S3_REGION',
  'S3_SECRET_ACCESS_KEY',
)

const MAX_AVATAR_BYTES = 2 * 1024 * 1024

const extensionByContentType = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const

type AvatarContentType = keyof typeof extensionByContentType

const CAROUSEL_IMAGE_PREFIX = 'image/'

const s3Client = new S3Client({
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
  endpoint: S3_ENDPOINT,
  forcePathStyle: true,
  region: S3_REGION,
})

export interface UploadUserAvatarObjectPayload {
  base64: string
  contentType: AvatarContentType
  userId: string
}

export interface UploadImageObjectPayload {
  base64: string
  contentType: AvatarContentType
}

export const uploadUserAvatarObject = async (
  payload: UploadUserAvatarObjectPayload,
): Promise<string> => {
  const { base64, contentType, userId } = payload

  const body = Buffer.from(base64, 'base64')
  if (body.byteLength > MAX_AVATAR_BYTES) {
    throw new AppError(
      'PAYLOAD_TOO_LARGE',
      'Avatar exceeds the maximum size of 2MB',
    )
  }

  const key = `avatars/${userId}/${randomUUID()}.${extensionByContentType[contentType]}`

  await s3Client.send(
    new PutObjectCommand({
      ACL: 'public-read',
      Body: body,
      Bucket: S3_AVATARS_BUCKET,
      ContentType: contentType,
      Key: key,
    }),
  )

  return `${S3_ENDPOINT}/${S3_AVATARS_BUCKET}/${key}`
}

export const uploadImageObject = async (
  payload: UploadImageObjectPayload,
): Promise<string> => {
  const { base64, contentType } = payload

  const body = Buffer.from(base64, 'base64')
  if (body.byteLength > MAX_AVATAR_BYTES) {
    throw new AppError(
      'PAYLOAD_TOO_LARGE',
      'Avatar exceeds the maximum size of 2MB',
    )
  }

  const key = `${CAROUSEL_IMAGE_PREFIX}${randomUUID()}.${extensionByContentType[contentType]}`

  await s3Client.send(
    new PutObjectCommand({
      ACL: 'public-read',
      Body: body,
      Bucket: S3_AVATARS_BUCKET,
      ContentType: contentType,
      Key: key,
    }),
  )

  return `${S3_ENDPOINT}/${S3_AVATARS_BUCKET}/${key}`
}

export interface CarouselImageObject {
  id: string
  url: string
}

export const listImageObjects = async (): Promise<CarouselImageObject[]> => {
  const { Contents } = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: S3_AVATARS_BUCKET,
      Prefix: CAROUSEL_IMAGE_PREFIX,
    }),
  )

  return (Contents ?? [])
    .filter((object) => object.Key && object.Key !== CAROUSEL_IMAGE_PREFIX)
    .sort(
      (a, b) =>
        (b.LastModified?.getTime() ?? 0) - (a.LastModified?.getTime() ?? 0),
    )
    .map((object) => ({
      id: object.Key as string,
      url: `${S3_ENDPOINT}/${S3_AVATARS_BUCKET}/${object.Key as string}`,
    }))
}
