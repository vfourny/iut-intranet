import type { UploadFileInput } from '@iut-intranet/helpers/schemas/storage'

export const fileToUploadInput = (file: File): Promise<UploadFileInput> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const result = reader.result as string
      resolve({
        base64: result.split(',')[1] ?? '',
        contentType: file.type as UploadFileInput['contentType'],
      })
    }
    reader.readAsDataURL(file)
  })
