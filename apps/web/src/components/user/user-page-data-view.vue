<script setup lang="ts">
import type { TrpcOutput } from '@iut-intranet/trpc'
import DataView from 'primevue/dataview'

import UserCard from '@/components/user/user-card.vue'

defineProps<{ users: TrpcOutput['user']['list'] | undefined }>()
</script>

<template>
  <DataView layout="grid" :value="users">
    <template #grid="slotProps">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
        <div v-for="user in slotProps.items" :key="user.id">
          <UserCard :user="user" />
        </div>
      </div>
    </template>
  </DataView>
</template>
