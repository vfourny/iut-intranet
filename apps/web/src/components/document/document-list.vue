<template>
  <div
    v-if="documents.length === 0"
    class="text-center text-surface-400 py-12 text-sm"
  >
    {{ t('document.empty') }}
  </div>

  <div
    v-else
    class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4"
  >
    <DocumentCard v-for="doc in documents" :key="doc.key" :document="doc" />
  </div>
</template>

<script lang="ts" setup>
import type { DocumentList } from '@/api/document.api'
import DocumentCard from '@/components/document/document-card.vue'
import { useI18n } from '@/composables/use-i18n'

const { t } = useI18n()

defineProps<{
  documents: DocumentList
}>()
</script>
