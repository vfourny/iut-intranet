<template>
  <div class="flex flex-col gap-6">
    <Teleport :to="pageHeaderSelector.actions">
      <PrimeButton
        icon="pi pi-plus"
        :label="t('news.list.createNews')"
        @click="openCreate"
      />
    </Teleport>

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
      :header="formMode === 'edit' ? t('news.update') : t('news.list.createNews')"
      modal
    >
      <div
        v-if="formMode === 'edit' && isSelectedLoading"
        class="py-8 text-center"
      >
        <PrimeProgressSpinner />
      </div>
      <NewsForm
        v-else
        :key="formMode === 'edit' ? (selectedNews?.id ?? 'edit') : 'create'"
        :news="formMode === 'edit' ? selectedNews : undefined"
        @cancel="formVisible = false"
        @saved="formVisible = false"
      />
    </PrimeDialog>

    <PrimeDialog
      v-model:visible="detailVisible"
      class="w-full max-w-2xl"
      :header="selectedNews?.title ?? pendingTitle"
      modal
    >
      <div v-if="isSelectedLoading" class="py-8 text-center">
        <PrimeProgressSpinner />
      </div>
      <NewsDetail v-else-if="selectedNews" :news="selectedNews" />
    </PrimeDialog>
  </div>
</template>

<script lang="ts" setup>
import { NewsStatus } from '@iut-intranet/db/enums'
import { isEditorRole } from '@iut-intranet/helpers/utils/role'
import PrimeButton from 'primevue/button'
import PrimeDialog from 'primevue/dialog'
import PrimeMultiSelect from 'primevue/multiselect'
import PrimePaginator from 'primevue/paginator'
import PrimeProgressSpinner from 'primevue/progressspinner'
import { computed, ref, watch } from 'vue'

import { useSession } from '@/api/auth.api'
import {
  NEWS_PAGE_SIZE,
  type NewsListItem,
  useNewsId,
  useVisibleNews,
} from '@/api/news.api'
import { pageHeaderSelector } from '@/lib/page-header'
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

// La liste ne porte que l'en-tête (pas `content`) : l'édition et le détail
// chargent la news complète par id à l'ouverture. `pendingTitle` évite l'en-tête
// vide du dialog détail pendant ce chargement.
const formVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const detailVisible = ref(false)
const selectedNewsId = ref<string | null>(null)
const pendingTitle = ref('')

const { data: selectedNews, isLoading: isSelectedLoading } =
  useNewsId(selectedNewsId)

const openCreate = () => {
  formMode.value = 'create'
  selectedNewsId.value = null
  formVisible.value = true
}

const openEdit = (item: NewsListItem) => {
  formMode.value = 'edit'
  selectedNewsId.value = item.id
  formVisible.value = true
}

const openDetail = (item: NewsListItem) => {
  selectedNewsId.value = item.id
  pendingTitle.value = item.title
  detailVisible.value = true
}
</script>
