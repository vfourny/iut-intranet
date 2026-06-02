import type { uploadImageInput } from '@iut-intranet/helpers/types/image'
import {
  type CarouselImageObject,
  listImageObjects,
  uploadImageObject,
} from '@iut-intranet/providers/s3'

export class ImageService {
  async list(): Promise<CarouselImageObject[]> {
    return listImageObjects()
  }

  async upload(payload: uploadImageInput): Promise<string> {
    const { base64, contentType } = payload

    return uploadImageObject({ base64, contentType })
  }
}
