<script setup lang="ts">
import type { TrpcOutput } from '@iut-intranet/trpc'
import Avatar from 'primevue/avatar'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'

import { useI18n } from '@/composables/use-i18n'
import { RouteNames, router } from '@/router'

const { t } = useI18n()

defineProps<{ users: TrpcOutput['user']['list'] }>()
</script>

<template>
  <DataTable
    :value="users"
    @row-click="
      (e) => router.push({ name: RouteNames.home, params: { id: e.data.id } })
    "
  >
    <Column>
      <template #body="{ data: user }">
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
    </Column>
    <Column field="firstName" :header="t('user.table.prénom')" />
    <Column field="lastName" :header="t('user.table.nom')" />
    <Column field="department.code" :header="t('user.table.department')" />
    <Column field="jobTitle" :header="t('user.table.job')" />
  </DataTable>
</template>
