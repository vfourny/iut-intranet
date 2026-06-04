<template>
  <div class="flex flex-col gap-6 p-6">
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <h1 class="text-3xl font-bold text-gray-900">
        {{ t('news.list.title') }}
      </h1>

      <PrimeButton
        class="w-full sm:w-auto"
        icon="pi pi-plus"
        :label="t('news.list.createNews')"
        @click="openCreate"
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
    </div>

    <div
      v-if="!isLoading && news.length === 0"
      class="py-12 text-center text-gray-500"
    >
      {{ t('news.list.empty') }}
    </div>

    <NewsCard
      :is-admin="isAdmin"
      :loading="isLoading"
      :news="news"
      @edit="openEdit"
      @select="openDetail"
    />

    <PrimePaginator
      :first="(page - 1) * NEWS_PAGE_SIZE"
      :rows="NEWS_PAGE_SIZE"
      :total-records="totalRecords"
      @page="page = $event.page + 1"
    />

    <PrimeDialog
      v-model:visible="formVisible"
      class="w-full max-w-2xl"
      :header="formNews ? t('news.update') : t('news.list.createNews')"
      modal
    >
      <NewsForm
        :key="formNews?.id ?? 'create'"
        :news="formNews"
        @cancel="formVisible = false"
        @saved="formVisible = false"
      />
    </PrimeDialog>

    <PrimeDialog
      v-model:visible="detailVisible"
      class="w-full max-w-2xl"
      :header="detailNews?.title"
      modal
    >
      <NewsDetail v-if="detailNews" :news="detailNews" />
    </PrimeDialog>
  </div>
</template>

<script lang="ts" setup>
import { NewsStatus } from '@iut-intranet/db/enums'
import { isEditorRole } from '@iut-intranet/helpers/utils/role'
import PrimeDialog from 'primevue/dialog'
import PrimeMultiSelect from 'primevue/multiselect'
import PrimePaginator from 'primevue/paginator'
import { computed, ref, watch } from 'vue'

import { useSession } from '@/api/auth.api'
import { type News, NEWS_PAGE_SIZE, useVisibleNews } from '@/api/news.api'
import NewsCard from '@/components/news/news-card.vue'
import NewsDetail from '@/components/news/news-detail.vue'
import NewsForm from '@/components/news/news-form.vue'
import UserSearchBar from '@/components/ui/search-bar.vue'
import { useEnumOptions } from '@/composables/use-enum-options'
import { useI18n } from '@/composables/use-i18n'

const { t } = useI18n()
const { currentSession } = useSession()

const isAdmin =
  !!currentSession.value && isEditorRole(currentSession.value.user.role)

const search = ref('')

const SEARCH_DEBOUNCE_MS = 300
let debounceTimer: ReturnType<typeof setTimeout> | undefined

const selectedDepartments = ref<string[]>([])
const page = ref(1)

const departmentOptions = useEnumOptions('department')

const onSearch = (value: string) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    search.value = value
  }, SEARCH_DEBOUNCE_MS)
}

// Recherche, filtre département et pagination sont désormais résolus côté
// serveur : l'API ne renvoie que la page demandée + le total.
const { data, isLoading } = useVisibleNews(
  NewsStatus.PUBLISHED,
  page,
  search,
  selectedDepartments,
)

const news = computed(() => data.value?.items ?? [])
const totalRecords = computed(() => data.value?.total ?? 0)

watch([search, selectedDepartments], () => {
  page.value = 1
})

// `formNews` indéfini = création, défini = édition de cette news.
const formVisible = ref(false)
const formNews = ref<News | undefined>(undefined)
const detailVisible = ref(false)
const detailNews = ref<News | undefined>(undefined)

const openCreate = () => {
  formNews.value = undefined
  formVisible.value = true
}

const openEdit = (item: News) => {
  formNews.value = item
  formVisible.value = true
}

const openDetail = (item: News) => {
  detailNews.value = item
  detailVisible.value = true
}
</script>
