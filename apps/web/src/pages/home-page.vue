<script lang="ts" setup>
import { MAX_UPLOAD_BYTES } from '@iut-intranet/helpers/schemas/storage'
import type { FileUploadUploaderEvent } from 'primevue/fileupload'
import PrimeFileUpload from 'primevue/fileupload'
import { useI18n } from 'vue-i18n'

import { useImages, useUploadImage } from '@/api/image.api'
import ImageCarousel from '@/components/image/carroussel-image.vue'

const { t } = useI18n()
const { mutate: uploadImage } = useUploadImage()
const { data: images, refetch } = useImages()

const handleUpload = async (event: FileUploadUploaderEvent) => {
  const file = Array.isArray(event.files) ? event.files[0] : event.files
  if (!file) return

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  await uploadImage({
    base64,
    contentType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
  })
  await refetch()
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    <div class="h-[200px] overflow-hidden">
      <ImageCarousel :images="images ?? []" />
    </div>
    <div class="flex justify-center">
      <PrimeFileUpload
        accept="image/jpeg,image/png,image/webp"
        auto
        :choose-label="t('home.addPicture')"
        custom-upload
        :max-file-size="MAX_UPLOAD_BYTES"
        mode="basic"
        @uploader="handleUpload"
      />
    </div>
  </div>
</template>
