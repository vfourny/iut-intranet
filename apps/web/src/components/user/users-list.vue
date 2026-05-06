<template>
  <div class="flex gap-4 items-center">
    <UserSearchBar @search="onSearch" />
    <PrimeSelectButton
      :model-value="diplayMode"
      option-value="value"
      :options="options"
      @value-change="
        diplayMode =
          $event ??
          (diplayMode === DisplayMode.DATA_TABLE
            ? DisplayMode.DATA_VIEW
            : DisplayMode.DATA_TABLE)
      "
    >
      <template #option="slotProps">
        <i :class="slotProps.option.icon"></i>
      </template>
    </PrimeSelectButton>
  </div>
  <UserPageDataTable
    v-if="diplayMode === DisplayMode.DATA_TABLE"
    :users="filteredUsers ?? []"
  />
  <UserPageDataView
    v-if="diplayMode === DisplayMode.DATA_VIEW"
    :users="filteredUsers ?? []"
  />
</template>

<script lang="ts" setup>
import PrimeSelectButton from 'primevue/selectbutton'
import { computed, ref } from 'vue'

import { useUsers } from '@/api/users.api'
import UserPageDataTable from '@/components/user/user-page-data-table.vue'
import UserPageDataView from '@/components/user/user-page-data-view.vue'
import UserSearchBar from '@/components/user/user-search-bar.vue'

enum DisplayMode {
  DATA_TABLE = 'data-table',
  DATA_VIEW = 'data-view',
}

const { data: users } = useUsers()
const searchQuery = ref('')

const filteredUsers = computed(() =>
  users.value?.filter((user) =>
    (user.firstName + ' ' + user.lastName)
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase()),
  ),
)

const onSearch = (name: string) => {
  searchQuery.value = name
}

const diplayMode = ref(DisplayMode.DATA_TABLE)
const options = ref<{ icon: string; value: DisplayMode }[]>([
  { icon: 'pi pi-table', value: DisplayMode.DATA_TABLE },
  { icon: 'pi pi-th-large', value: DisplayMode.DATA_VIEW },
])
</script>
