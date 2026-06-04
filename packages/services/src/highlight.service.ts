import type { UploadHighlightInput } from '@iut-intranet/helpers/schemas/highlight'
import {
  getSignedObjectUrl,
  listObjects,
  StorageFolders,
  uploadObject,
} from '@iut-intranet/providers/s3'

export class HighlightService {
  /**
   * Lists highlight images from object storage, most recently modified first,
   * each paired with a temporary signed URL the browser can load.
   */
  public async list(): Promise<
    {
      key: string
      url: string
    }[]
  > {
    const objects = await listObjects(StorageFolders.highlights)

    return Promise.all(
      objects
        .sort(
          (a, b) =>
            (b.lastModified?.getTime() ?? 0) - (a.lastModified?.getTime() ?? 0),
        )
        .map(async ({ key }) => ({
          key,
          url: await getSignedObjectUrl(key),
        })),
    )
  }

  /** Uploads an image to the home highlight folder and returns its object key. */
  public async upload(payload: UploadHighlightInput): Promise<string> {
    return uploadObject({ ...payload, folder: StorageFolders.highlights })
  }
}
