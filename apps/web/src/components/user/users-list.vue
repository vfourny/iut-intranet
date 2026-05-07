<template>
  <div class="flex gap-4 items-center">
    <PrimeSelectButton
      :model-value="displayMode"
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
    <UserSearchBar @search="onSearch" />
  </div>
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
</template>

<script lang="ts" setup>
import PrimeSelectButton from 'primevue/selectbutton'
import { computed, ref } from 'vue'

import {
  USER_PAGE_SIZE,
  useUsersInfinite,
  useUsersPaginated,
} from '@/api/users.api'
import UserDataTable from '@/components/user/user-data-table.vue'
import UserDataView from '@/components/user/user-data-view.vue'
import UserSearchBar from '@/components/user/user-search-bar.vue'

enum DisplayMode {
  DATA_TABLE = 'data-table',
  DATA_VIEW = 'data-view',
}

const SEARCH_DEBOUNCE_MS = 300

const search = ref('')
const page = ref(1)
const displayMode = ref(DisplayMode.DATA_TABLE)

const displayModeOptions = ref<{ icon: string; value: DisplayMode }[]>([
  { icon: 'pi pi-table', value: DisplayMode.DATA_TABLE },
  { icon: 'pi pi-th-large', value: DisplayMode.DATA_VIEW },
])

const { asyncStatus: paginatedStatus, data: paginatedData } = useUsersPaginated(
  page,
  search,
)

const {
  asyncStatus: infiniteStatus,
  data: infiniteData,
  hasNextPage: infiniteHasNextPage,
  loadNextPage: infiniteLoadNextPage,
} = useUsersInfinite(search)

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
