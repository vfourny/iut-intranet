import type { PrismaClient } from '@iut-intranet/db'
import type { uploadImageInput } from '@iut-intranet/helpers/types/image'
import { uploadImageObject } from '@iut-intranet/providers/s3'

export class ImageService {
  constructor(private prisma: PrismaClient) {}

  async list() {
    return this.prisma.image.findMany({
      select: {
        id: true,
        url: true,
      },
    })
  }

  async upload(
    payload: uploadImageInput & { userId: string },
  ): Promise<string> {
    const { base64, contentType, userId } = payload

    const url = await uploadImageObject({ base64, contentType })

    await this.prisma.image.create({
      data: { url, userId },
    })

    return url
  }
}
