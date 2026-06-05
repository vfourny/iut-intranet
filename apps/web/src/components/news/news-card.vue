<template>
  <div v-if="loading" class="flex justify-center py-12">
    <PrimeProgressSpinner />
  </div>
  <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <div
      v-for="item in news"
      :key="item.id"
      class="cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
      @click="emit('select', item)"
    >
      <img
        v-if="item.coverUrl"
        :alt="item.title"
        class="h-48 w-full object-cover"
        :src="item.coverUrl"
      />
      <div v-else class="h-48 w-full" :style="{ backgroundColor: '#6366f1' }" />

      <div class="flex flex-col gap-2 p-4">
        <h2 class="line-clamp-2 text-lg font-semibold text-gray-900">
          {{ item.title }}
        </h2>

        <div class="flex items-center gap-2 text-xs text-gray-400">
          <span v-if="item.publishedAt">{{
            formatDate(item.publishedAt)
          }}</span>
          <span
            >{{ item.author.firstName }} {{ item.author.lastName }}</span
          >
        </div>

        <div
          v-if="item.targetDepartments.length > 0"
          class="flex flex-wrap items-center gap-1"
        >
          <DepartmentTag
            v-for="dept in item.targetDepartments"
            :key="dept.code"
            :code="dept.code as DepartmentCode"
          />
        </div>
      </div>

      <div v-if="isAdmin" class="flex justify-start px-4 py-2">
        <PrimeButton
          icon="pi pi-pencil"
          :label="t('news.update')"
          severity="secondary"
          size="small"
          text
          @click.stop="emit('edit', item)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { DepartmentCode } from '@iut-intranet/db/enums'
import PrimeButton from 'primevue/button'
import PrimeProgressSpinner from 'primevue/progressspinner'

import type { NewsList, NewsListItem } from '@/api/news.api'
import DepartmentTag from '@/components/department/department-tag.vue'
import { useI18n } from '@/composables/use-i18n'

const { t } = useI18n()

withDefaults(
  defineProps<{
    news: NewsList
    isAdmin?: boolean
    loading?: boolean
  }>(),
  {
    isAdmin: false,
  },
)

const emit = defineEmits<{
  edit: [news: NewsListItem]
  select: [news: NewsListItem]
}>()

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>
