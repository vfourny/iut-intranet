import type { UploadDocumentInput } from '@iut-intranet/helpers/schemas/document'
import {
  getSignedObjectUrl,
  listObjects,
  StorageFolders,
  uploadObject,
} from '@iut-intranet/providers/s3'

export class DocumentService {
  /**
   * Lists document from object storage, most recently modified first.
   * @returns {Promise<{ key: string; url: string }[]>} Each document's object key paired with a temporary signed URL the browser can load
   */
  public async list(): Promise<
    {
      key: string
      url: string
    }[]
  > {
    const objects = await listObjects(StorageFolders.documents)

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

  /**
   * Uploads an image to the home highlight folder.
   * @param {UploadHighlightInput} payload - The highlight image to upload
   * @returns {Promise<string>} The stored object key
   */
  public async upload(payload: UploadDocumentInput): Promise<string> {
    return uploadObject({ ...payload, folder: StorageFolders.highlights })
  }
}
