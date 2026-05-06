<script setup lang="ts">
import type { TrpcOutput } from '@iut-intranet/trpc'
import Avatar from 'primevue/avatar'
import Card from 'primevue/card'

import { RouteNames, router } from '@/router'

defineProps<{ user: TrpcOutput['user']['list'][number] }>()
</script>

<template>
  <Card
    class="hover:shadow-lg"
    @click="router.push({ name: RouteNames.home, params: { id: user.id } })"
  >
    <template #header>
      <Avatar
        v-if="user.image"
        :image="user.image"
        size="xlarge"
        style="border-radius: 8px"
      />
      <Avatar
        v-else
        :label="`${user.firstName[0]}${user.lastName[0]}`"
        size="xlarge"
        style="border-radius: 8px"
      />
    </template>

    <template #title>{{ user.firstName }} {{ user.lastName }}</template>
    <template #subtitle
      >{{ user.department?.code }} {{ user.jobTitle }}</template
    >
  </Card>
</template>
