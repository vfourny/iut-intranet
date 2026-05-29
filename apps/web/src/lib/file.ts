import type { uploadAvatarInput } from '@iut-intranet/helpers/types/storage'

export const fileToAvatarInput = (file: File): Promise<uploadAvatarInput> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const result = reader.result as string
      resolve({
        base64: result.split(',')[1] ?? '',
        contentType: file.type as uploadAvatarInput['contentType'],
      })
    }
    reader.readAsDataURL(file)
  })
