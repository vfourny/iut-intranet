<template>
  <PrimeDataTable
    :first="(page - 1) * pageSize"
    lazy
    :loading="loading"
    paginator
    :rows="pageSize"
    :total-records="total"
    :value="users"
    @page="onPage"
  >
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
    >
      <template
        v-if="col.field === 'department.code'"
        #body="{ data: user }: { data: User }"
      >
        <DepartmentTag
          v-if="user.department?.code"
          :code="user.department.code"
        />
      </template>
    </PrimeColumn>
  </PrimeDataTable>
</template>

<script setup lang="ts">
import type { TrpcOutput } from '@iut-intranet/trpc'
import PrimeAvatar from 'primevue/avatar'
import PrimeColumn from 'primevue/column'
import PrimeDataTable from 'primevue/datatable'

import DepartmentTag from '@/components/department/department-tag.vue'
import { useI18n } from '@/composables/use-i18n'

type User = TrpcOutput['user']['list']['items'][number]
type UserField =
  | (keyof User & string)
  | `department.${keyof User['department'] & string}`

const { t } = useI18n()

const getInitials = (user: User) => `${user.firstName[0]}${user.lastName[0]}`

interface UserDataTableProps {
  loading: boolean
  page: number
  pageSize: number
  total: number
  users: User[]
}

defineProps<UserDataTableProps>()

const emit = defineEmits<{ 'update:page': [page: number] }>()

const onPage = (event: { page: number }) => {
  emit('update:page', event.page + 1)
}

const columns = [
  { field: 'firstName', header: t('user.table.prénom') },
  { field: 'lastName', header: t('user.table.nom') },
  { field: 'department.code', header: t('user.table.department') },
  { field: 'jobTitle', header: t('user.table.job') },
  { field: 'email', header: t('user.table.email') },
  { field: 'phone', header: t('user.table.phone') },
] satisfies { field: UserField; header: string }[]
</script>
