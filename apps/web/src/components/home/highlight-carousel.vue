<template>
  <div class="relative overflow-hidden rounded-2xl lg:col-span-2">
    <PrimeCarousel
      :autoplay-interval="3000"
      circular
      class="h-full"
      :num-scroll="1"
      :num-visible="1"
      :show-navigators="true"
      :value="images ?? []"
    >
      <template #item="{ data }">
        <img
          :alt="data.key"
          class="h-full w-full object-cover"
          :src="data.url"
        />
      </template>
    </PrimeCarousel>
    <PrimeFileUpload
      accept="image/jpeg,image/png,image/webp"
      auto
      :choose-label="t('home.addPhoto')"
      class="absolute right-4 top-4 z-10"
      custom-upload
      :max-file-size="MAX_UPLOAD_BYTES"
      mode="basic"
      @uploader="handleUpload"
    />
  </div>
</template>

<script lang="ts" setup>
import { MAX_UPLOAD_BYTES } from '@iut-intranet/helpers/schemas/storage'
import PrimeCarousel from 'primevue/carousel'
import type { FileUploadUploaderEvent } from 'primevue/fileupload'
import PrimeFileUpload from 'primevue/fileupload'

import {
  useHighlightImages,
  useUploadHighlightImage,
} from '@/api/highlight.api'
import { useI18n } from '@/composables/use-i18n'

const { t } = useI18n()

const { mutate: uploadHighlightImage } = useUploadHighlightImage()
const { data: images, refetch } = useHighlightImages()

const handleUpload = async (event: FileUploadUploaderEvent) => {
  const file = Array.isArray(event.files) ? event.files[0] : event.files
  if (!file) return

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  await uploadHighlightImage({
    base64,
    contentType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
  })
  await refetch()
}
</script>

<style scoped>
.h-full :deep(.p-carousel-content),
.h-full :deep(.p-carousel-viewport),
.h-full :deep(.p-carousel-items-content),
.h-full :deep(.p-carousel-items-container),
.h-full :deep(.p-carousel-item) {
  height: 100%;
}

.h-full :deep(.p-carousel-content) {
  position: relative;
}

.h-full :deep(.p-carousel-prev-button),
.h-full :deep(.p-carousel-next-button) {
  position: absolute;
  top: 50%;
  z-index: 10;
  transform: translateY(-50%);
  color: white;
  background: rgb(0 0 0 / 35%);
}

.h-full :deep(.p-carousel-prev-button) {
  left: 0.75rem;
}

.h-full :deep(.p-carousel-next-button) {
  right: 0.75rem;
}
</style>
