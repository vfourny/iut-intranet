import { S3Client } from '@aws-sdk/client-s3'
import { getServerEnv } from '@iut-intranet/helpers/env'

const {
  S3_ACCESS_KEY_ID,
  S3_BUCKET,
  S3_ENDPOINT,
  S3_REGION,
  S3_SECRET_ACCESS_KEY,
} = getServerEnv(
  'S3_ACCESS_KEY_ID',
  'S3_BUCKET',
  'S3_ENDPOINT',
  'S3_REGION',
  'S3_SECRET_ACCESS_KEY',
)

export const S3_BUCKET_NAME = S3_BUCKET

export const s3Client = new S3Client({
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
  endpoint: S3_ENDPOINT,
  forcePathStyle: true,
  region: S3_REGION,
})
