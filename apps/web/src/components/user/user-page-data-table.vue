<script setup lang="ts">
import type { TrpcOutput } from '@iut-intranet/trpc'
import PrimeAvatar from 'primevue/avatar'
import PrimeColumn from 'primevue/column'
import PrimeDataTable from 'primevue/datatable'

import { useI18n } from '@/composables/use-i18n'
import { RouteNames, router } from '@/router'

const { t } = useI18n()

const getInitials = (user: TrpcOutput['user']['list'][number]) =>
  `${user.firstName[0]}${user.lastName[0]}`

interface UserDataTableProps {
  users: TrpcOutput['user']['list']
}

defineProps<UserDataTableProps>()
</script>

<template>
  <PrimeDataTable
    :value="users"
    @row-click="
      (e) => router.push({ name: RouteNames.home, params: { id: e.data.id } })
    "
  >
    <PrimeColumn>
      <template #body="{ data: user }">
        <Avatar
          v-if="user.image"
          :image="user.image"
          size="xlarge"
          style="border-radius: 8px"
        />
        <PrimeAvatar
          v-else
          :label="getInitials(user)"
          size="xlarge"
          style="border-radius: 8px"
        />
      </template>
    </PrimeColumn>
    <Column field="firstName" :header="t('user.table.prénom')" />
    <Column field="lastName" :header="t('user.table.nom')" />
    <Column field="department.code" :header="t('user.table.department')" />
    <Column field="jobTitle" :header="t('user.table.job')" />
  </PrimeDataTable>
</template>
