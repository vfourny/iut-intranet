<script setup lang="ts">
import type { UserWithDepartment } from '@iut-intranet/helpers/types/user'
import DataView from 'primevue/dataview'

import UserCard from '@/components/user/user-card.vue'

defineProps<{ users: UserWithDepartment[] }>()
</script>

<template>
  <DataView layout="grid" :value="users">
    <template #grid="slotProps">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
        <div
          v-for="user in slotProps.items as UserWithDepartment[]"
          :key="user.id"
        >
          <UserCard :user="user" />
        </div>
      </div>
    </template>
  </DataView>
</template>
