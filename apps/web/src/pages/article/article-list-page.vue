<template>
  <div class="flex flex-col gap-6 p-6">
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <h1 class="text-3xl font-bold text-gray-900">
        {{ t('article.list.title') }}
      </h1>

      <PrimeButton
        class="w-full sm:w-auto"
        icon="pi pi-plus"
        label="Créer un article"
        @click="router.push({ name: RouteNames.article.create })"
      />
    </div>

    <div class="flex flex-col md:flex-row gap-4">
      <UserSearchBar @search="onSearch" />
      <PrimeMultiSelect
        v-model="selectedDepartments"
        class="w-full md:w-80"
        filter
        :max-selected-labels="3"
        option-label="label"
        option-value="value"
        :options="departmentOptions"
        placeholder="Filtrer par département"
      />
      <PrimeSelectButton
        v-model="displayMode"
        :allow-empty="false"
        option-label="status"
        option-value="value"
        :options="displayModeStatus"
      />
    </div>

    <div
      v-if="!isLoading && filteredArticles.length === 0"
      class="py-12 text-center text-gray-500"
    >
      {{ t('article.list.empty') }}
    </div>

    <ArticleCard
      :articles="articles"
      :is-admin="isAdmin"
      :loading="isLoading"
    />

    <PrimePaginator
      :rows="PAGE_SIZE"
      :total-records="filteredArticles.length"
      @page="page = $event.page + 1"
    />
  </div>
</template>

<script lang="ts" setup>
import { ArticleStatus, UserRole } from '@iut-intranet/db/enums'
import type { ArticleList } from '@iut-intranet/helpers/types/article'
import PrimeMultiSelect from 'primevue/multiselect'
import PrimePaginator from 'primevue/paginator'
import PrimeSelectButton from 'primevue/selectbutton'
import { computed, ref, watch } from 'vue'

import { useVisibleArticles } from '@/api/article.api'
import { useSession } from '@/api/auth.api'
import ArticleCard from '@/components/article/article-card.vue'
import UserSearchBar from '@/components/ui/search-bar.vue'
import { useI18n } from '@/composables/use-i18n'
import { SPECIALTY_BY_DEPARTMENT } from '@/lib/department'
import { RouteNames, router } from '@/router'

const { t } = useI18n()
const { currentSession } = useSession()

const isAdmin =
  currentSession.value?.user.role === UserRole.ADMIN ||
  currentSession.value?.user.role === UserRole.EDITOR

const search = ref('')

const SEARCH_DEBOUNCE_MS = 300
let debounceTimer: ReturnType<typeof setTimeout> | undefined

const selectedDepartments = ref<string[]>([])
const page = ref(1)
const PAGE_SIZE = 12

const departmentOptions = Object.keys(SPECIALTY_BY_DEPARTMENT).map((code) => ({
  label: code,
  value: code,
}))

const onSearch = (value: string) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    search.value = value
  }, SEARCH_DEBOUNCE_MS)
}

const displayMode = ref<ArticleStatus>(ArticleStatus.PUBLISHED)

const displayModeStatus = [
  { status: t('article.status.archived'), value: ArticleStatus.ARCHIVED },
  { status: t('article.status.published'), value: ArticleStatus.PUBLISHED },
  { status: t('article.status.scheduled'), value: ArticleStatus.SCHEDULED },
  { status: t('article.status.draft'), value: ArticleStatus.DRAFT },
]

const { data: rawArticles, isLoading } = useVisibleArticles(
  currentSession.value?.user.id ?? '',
  displayMode,
)

const filteredArticles = computed(
  () =>
    (rawArticles.value ?? []).filter((article) => {
      const matchesSearch =
        !search.value ||
        (() => {
          const input = search.value.toLowerCase()
          return (
            article.title.toLowerCase().includes(input) ||
            article.excerpt?.toLowerCase().includes(input)
          )
        })()

      const matchesDept =
        selectedDepartments.value.length === 0 ||
        article.targetDepartments.some((d) =>
          selectedDepartments.value.includes(d.code),
        )

      return matchesSearch && matchesDept
    }) as ArticleList,
)

const articles = computed<ArticleList>(
  () =>
    filteredArticles.value.slice(
      (page.value - 1) * PAGE_SIZE,
      page.value * PAGE_SIZE,
    ) as ArticleList,
)

watch([search, selectedDepartments], () => {
  page.value = 1
})
</script>
