<template>
  <div class="p-6 flex flex-col gap-6">
    <div class="flex justify-end">
      <PrimeButton
        icon="pi pi-upload"
        :label="t('document.add')"
        @click="fileInputRef?.click()"
      />
      <input
        ref="fileInputRef"
        accept="application/pdf"
        class="hidden"
        type="file"
        @change="onFileChange"
      />
    </div>

    <div v-if="isPending" class="flex justify-center py-16">
      <PrimeProgressSpinner />
    </div>

    <DocumentList :documents="data ?? []" />
  </div>
</template>

<script lang="ts" setup>
import PrimeButton from 'primevue/button'
import PrimeProgressSpinner from 'primevue/progressspinner'
import { useToast } from 'primevue/usetoast'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useDocument, useUploadDocument } from '@/api/document.api'
import DocumentList from '@/components/document/document-list.vue'
import { fileToUploadInput } from '@/lib/file'

const { t } = useI18n()
const toast = useToast()
const { data, isPending } = useDocument()
const { mutateAsync: upload } = useUploadDocument()

const fileInputRef = ref<HTMLInputElement | null>(null)

const onFileChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const input = await fileToUploadInput(file)

  try {
    await upload({ ...input, originalName: file.name })
    toast.add({
      detail: t('document.upload.success.detail'),
      life: 3000,
      severity: 'success',
      summary: t('document.upload.success.summary'),
    })
  } catch {
    toast.add({
      detail: t('document.upload.error.detail'),
      life: 5000,
      severity: 'error',
      summary: t('document.upload.error.summary'),
    })
  } finally {
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}
</script>
