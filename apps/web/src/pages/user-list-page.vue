<template>
  <div class="flex gap-4 items-center mt-6">
    <PrimeSelectButton
      :model-value="displayMode"
      option-label="label"
      option-value="value"
      :options="displayModeOptions"
      @value-change="
        displayMode =
          $event ??
          (displayMode === DisplayMode.DATA_TABLE
            ? DisplayMode.DATA_VIEW
            : DisplayMode.DATA_TABLE)
      "
    >
      <template #option="slotProps">
        <i :class="slotProps.option.icon"></i>
      </template>
    </PrimeSelectButton>
    <PrimeDropdown
      :model-value="department"
      option-label="label"
      option-value="value"
      :options="departmentOptions"
      placeholder="Tous les départements"
      show-clear
      @update:model-value="department = $event"
    />
    <UserSearchBar @search="onSearch" />
  </div>

  <Teleport defer :to="pageHeaderSelector.actions">
    <PrimeButton
      v-if="isAdmin"
      icon="pi pi-user-plus"
      icon-pos="right"
      :label="t('user.add.actions.create')"
      @click="createVisible = true"
    />
  </Teleport>
  <UserDataTable
    v-if="displayMode === DisplayMode.DATA_TABLE"
    :loading="paginatedStatus === 'loading'"
    :page="page"
    :page-size="USER_PAGE_SIZE"
    :total="paginatedTotal"
    :users="paginatedUsers"
    @update:page="page = $event"
  />
  <UserDataView
    v-else
    :has-next-page="infiniteHasNextPage"
    :loading="infiniteStatus === 'loading'"
    :users="infiniteUsers"
    @load-more="infiniteLoadNextPage()"
  />

  <PrimeDialog
    v-model:visible="createVisible"
    class="w-full max-w-2xl"
    :header="t('user.add.title')"
    modal
  >
    <AddUser @cancel="createVisible = false" @saved="createVisible = false" />
  </PrimeDialog>
</template>

<script lang="ts" setup>
import { DepartmentCode } from '@iut-intranet/db/enums'
import PrimeButton from 'primevue/button'
import PrimeDialog from 'primevue/dialog'
import PrimeDropdown from 'primevue/dropdown'
import PrimeSelectButton from 'primevue/selectbutton'
import { computed, ref } from 'vue'

import { useSession } from '@/api/auth.api'
import {
  USER_PAGE_SIZE,
  useUsersInfinite,
  useUsersPaginated,
} from '@/api/users.api'
import UserSearchBar from '@/components/ui/search-bar.vue'
import AddUser from '@/components/user/add-user.vue'
import UserDataTable from '@/components/user/user-data-table.vue'
import UserDataView from '@/components/user/user-data-view.vue'
import { useI18n } from '@/composables/use-i18n'
import { SPECIALTY_BY_DEPARTMENT } from '@/lib/department'
import { pageHeaderSelector } from '@/lib/page-header'

const { t } = useI18n()
const { isAdmin } = useSession()

const createVisible = ref(false)

enum DisplayMode {
  DATA_TABLE = 'data-table',
  DATA_VIEW = 'data-view',
}

const SEARCH_DEBOUNCE_MS = 300

const search = ref('')
const page = ref(1)
const displayMode = ref(DisplayMode.DATA_VIEW)
const department = ref<DepartmentCode | undefined>(undefined)

const displayModeOptions = ref([
  { icon: 'pi pi-th-large', label: 'Vue', value: DisplayMode.DATA_VIEW },
  { icon: 'pi pi-table', label: 'Tableau', value: DisplayMode.DATA_TABLE },
])

const departmentOptions = Object.values(DepartmentCode).map((code) => ({
  label: code,
  specialty: SPECIALTY_BY_DEPARTMENT[code],
  value: code,
}))

const { asyncStatus: paginatedStatus, data: paginatedData } = useUsersPaginated(
  page,
  search,
  department,
)

const {
  asyncStatus: infiniteStatus,
  data: infiniteData,
  hasNextPage: infiniteHasNextPage,
  loadNextPage: infiniteLoadNextPage,
} = useUsersInfinite(search, department)

const paginatedUsers = computed(() => paginatedData.value?.items ?? [])
const paginatedTotal = computed(() => paginatedData.value?.total ?? 0)
const infiniteUsers = computed(
  () => infiniteData.value?.pages.flatMap((p) => p.items) ?? [],
)

let debounceTimer: ReturnType<typeof setTimeout> | undefined
const onSearch = (value: string) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    search.value = value
    page.value = 1
  }, SEARCH_DEBOUNCE_MS)
}
</script>
