<template>
  <Card class="overflow-hidden">
    <template #header>
      <div
        class="bg-surface-100 dark:bg-surface-800 flex items-center justify-center h-40 overflow-hidden"
      >
        <canvas ref="canvasRef" class="w-full block" />
      </div>
    </template>

    <template #title>
      <span
        class="text-sm font-medium truncate block"
        :title="props.document.key"
      >
        {{ filename }}
      </span>
    </template>

    <template #footer>
      <div class="flex gap-2">
        <Button
          as="a"
          class="flex-1"
          :href="props.document.url"
          icon="pi pi-external-link"
          :label="t('document.open')"
          rel="noopener"
          size="small"
          target="_blank"
          variant="text"
        />
        <Button
          v-if="isEditor"
          icon="pi pi-trash"
          severity="danger"
          size="small"
          variant="text"
          @click="confirmDelete"
        />
      </div>
    </template>
  </Card>

  <ConfirmDialog />
</template>

<script lang="ts" setup>
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import Button from 'primevue/button'
import Card from 'primevue/card'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useSession } from '@/api/auth.api'
import type { DocumentList } from '@/api/document.api'
import { useDeleteDocument } from '@/api/document.api'

GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const props = defineProps<{ document: DocumentList[number] }>()

const { t } = useI18n()
const confirm = useConfirm()
const toast = useToast()
const { isEditor } = useSession()
const { mutateAsync: deleteDocument } = useDeleteDocument()

const filename = computed(
  () =>
    props.document.key
      .split('/')
      .at(-1)
      ?.replace(/^[a-f0-9-]{36}-/, '') ?? props.document.key,
)

const confirmDelete = () => {
  confirm.require({
    accept: async () => {
      try {
        await deleteDocument({ key: props.document.key })
        toast.add({
          detail: t('document.delete.success.detail'),
          life: 3000,
          severity: 'success',
          summary: t('document.delete.success.summary'),
        })
      } catch {
        toast.add({
          detail: t('document.delete.error.detail'),
          life: 5000,
          severity: 'error',
          summary: t('document.delete.error.summary'),
        })
      }
    },
    acceptProps: { label: t('common.actions.confirm'), severity: 'danger' },
    header: t('document.delete.confirm.header'),
    icon: 'pi pi-exclamation-triangle',
    message: t('document.delete.confirm.message'),
    rejectProps: {
      label: t('common.actions.cancel'),
      severity: 'secondary',
      variant: 'text',
    },
  })
}

const canvasRef = ref<HTMLCanvasElement | null>(null)

onMounted(async () => {
  if (!canvasRef.value) return
  const pdf = await getDocument({ url: props.document.url }).promise
  const page = await pdf.getPage(1)
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const viewport = page.getViewport({ scale: 1 })
  const scale = 200 / viewport.width
  const scaledViewport = page.getViewport({ scale })
  canvas.width = scaledViewport.width
  canvas.height = scaledViewport.height
  await page.render({ canvas, viewport: scaledViewport }).promise
})
</script>
