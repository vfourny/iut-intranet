<template>
  <PrimeDataTable :value="users">
    <PrimeColumn>
      <template #body="{ data: user }">
        <PrimeAvatar v-if="user.image" :image="user.image" />
        <PrimeAvatar v-else :label="getInitials(user)" size="large" />
      </template>
    </PrimeColumn>
    <PrimeColumn
      v-for="col of columns"
      :key="col.field"
      :field="col.field"
      :header="col.header"
    />
  </PrimeDataTable>
</template>

<script setup lang="ts">
import type { TrpcOutput } from '@iut-intranet/trpc'
import PrimeAvatar from 'primevue/avatar'
import PrimeColumn from 'primevue/column'
import PrimeDataTable from 'primevue/datatable'

import { useI18n } from '@/composables/use-i18n'

type User = TrpcOutput['user']['list'][number]
type UserField =
  | (keyof User & string)
  | `department.${keyof User['department'] & string}`

const { t } = useI18n()

const getInitials = (user: User) => `${user.firstName[0]}${user.lastName[0]}`

interface UserDataTableProps {
  users: User[]
}

defineProps<UserDataTableProps>()

const columns = [
  { field: 'firstName', header: t('user.table.prénom') },
  { field: 'lastName', header: t('user.table.nom') },
  { field: 'department.code', header: t('user.table.department') },
  { field: 'jobTitle', header: t('user.table.job') },
  { field: 'email', header: t('user.table.email') },
  { field: 'phone', header: t('user.table.phone') },
] satisfies { field: UserField; header: string }[]
</script>
