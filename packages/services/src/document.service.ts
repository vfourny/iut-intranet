import { AppError } from '@iut-intranet/helpers/errors'
import type { UserId } from '@iut-intranet/helpers/schemas/brand'
import type { UploadDocumentInput } from '@iut-intranet/helpers/schemas/document'
import { isEditorRole } from '@iut-intranet/helpers/utils/role'
import {
  deleteObject,
  getSignedObjectUrl,
  listObjects,
  StorageFolders,
  uploadObject,
} from '@iut-intranet/providers/s3'

import type { UserService } from '@/user/user.service'

export class DocumentService {
  constructor(private readonly userService: UserService) {}

  /**
   * Delete document from object storage
   */
  public async delete(userId: UserId, key: string): Promise<void> {
    const user = await this.userService.getById(userId)
    if (!user || !isEditorRole(user.role)) {
      throw new AppError('UNAUTHORIZED', 'Not authorized')
    }
    await deleteObject(key)
  }

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
  public async upload(
    userId: UserId,
    payload: UploadDocumentInput,
  ): Promise<string> {
    const user = await this.userService.getById(userId)
    if (!user || !isEditorRole(user.role)) {
      throw new AppError('UNAUTHORIZED', 'Not authorized')
    }

    return uploadObject({
      ...payload,
      fileName: payload.originalName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9.\-_]/g, '')
        .replace(/\.pdf$/i, ''),
      folder: StorageFolders.documents,
    })
  }
}
