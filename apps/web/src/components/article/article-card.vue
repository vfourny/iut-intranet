<script lang="ts" setup>
import type { DepartmentCode } from '@iut-intranet/db/enums'
import type { ArticleList } from '@iut-intranet/helpers/types/article'
import PrimeProgressSpinner from 'primevue/progressspinner'
import { useRouter } from 'vue-router'

import ArticleTag from '@/components/article/article-tag.vue'
import DepartmentTag from '@/components/department/department-tag.vue'
import { useI18n } from '@/composables/use-i18n'
import { RouteNames } from '@/router'

const { t } = useI18n()

withDefaults(
  defineProps<{
    articles: ArticleList
    isAdmin?: boolean
    loading?: boolean
  }>(),
  {
    isAdmin: false,
  },
)

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const router = useRouter()
</script>

<template>
  <div v-if="loading" class="flex justify-center py-12">
    <PrimeProgressSpinner />
  </div>
  <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <div
      v-for="article in articles"
      :key="article.id"
      class="cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
      @click="
        router.push({
          name: RouteNames.article.news,
          params: { id: article.id },
        })
      "
    >
      <img
        v-if="article.coverUrl"
        :alt="article.title"
        class="h-48 w-full object-cover"
        :src="article.coverUrl"
      />
      <div v-else class="h-48 w-full" :style="{ backgroundColor: '#6366f1' }" />

      <div class="flex flex-col gap-2 p-4">
        <h2 class="line-clamp-2 text-lg font-semibold text-gray-900">
          {{ article.title }}
        </h2>

        <p v-if="article.excerpt" class="line-clamp-3 text-sm text-gray-500">
          {{ article.excerpt }}
        </p>

        <div class="flex items-center gap-2 text-xs text-gray-400">
          <span v-if="article.publishedAt">{{
            formatDate(article.publishedAt)
          }}</span>
          <span
            >{{ article.author.firstName }} {{ article.author.lastName }}</span
          >
        </div>

        <div
          v-if="article.targetDepartments.length > 0 || article.status"
          class="flex flex-wrap items-center gap-1"
        >
          <ArticleTag :key="article.id" :status="article.status" />
          <DepartmentTag
            v-for="dept in article.targetDepartments"
            :key="dept.code"
            :code="dept.code as DepartmentCode"
          />
        </div>
      </div>

      <div v-if="isAdmin" class="flex justify-start px-4 py-2">
        <PrimeButton
          icon="pi pi-pencil"
          :label="t('article.update')"
          severity="secondary"
          size="small"
          text
          @click.stop="
            router.push({
              name: RouteNames.article.update,
              params: { id: article.id },
            })
          "
        />
      </div>
    </div>
  </div>
</template>
