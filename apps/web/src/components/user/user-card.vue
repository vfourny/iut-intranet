<script setup lang="ts">
import type { TrpcOutput } from '@iut-intranet/trpc'
import PrimeAvatar from 'primevue/avatar'
import PrimeCard from 'primevue/card'
import { computed } from 'vue'

import { RouteNames, router } from '@/router'

interface UserCardProps {
  user: TrpcOutput['user']['list'][number]
}

const { user } = defineProps<UserCardProps>()

const getInitials = computed(() => `${user.firstName[0]}${user.lastName[0]}`)
</script>

<template>
  <PrimeCard
    class="hover:shadow-lg"
    @click="router.push({ name: RouteNames.home, params: { id: user.id } })"
  >
    <template #header>
      <PrimeAvatar
        v-if="user.image"
        :image="user.image"
        size="xlarge"
        style="border-radius: 8px"
      />
      <PrimeAvatar
        v-else
        :label="getInitials"
        size="xlarge"
        style="border-radius: 8px"
      />
    </template>

    <template #title>{{ user.firstName }} {{ user.lastName }}</template>
    <template #subtitle
      >{{ user.department?.code }} {{ user.jobTitle }}</template
    >
  </PrimeCard>
</template>
