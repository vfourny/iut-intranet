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
        v-if="col.field === 'departments'"
        #body="{ data: user }: { data: User }"
      >
        <div class="flex gap-1 flex-wrap">
          <DepartmentTag
            v-for="ud in user.departments"
            :key="ud.department.code"
            :code="ud.department.code"
          />
        </div>
      </template>
    </PrimeColumn>
    <PrimeColumn v-if="isAdmin">
      <template #body="{ data: user }: { data: User }">
        <PrimeButton icon="pi pi-pencil" rounded text @click="onEdit(user)" />
        <PrimeButton
          icon="pi pi-trash"
          rounded
          severity="danger"
          text
          @click="onDelete(user)"
        />
      </template>
    </PrimeColumn>
  </PrimeDataTable>

  <PrimeDialog
    v-model:visible="editVisible"
    class="w-full max-w-2xl"
    :header="t('user.edit.title')"
    modal
  >
    <AddUser
      v-if="selectedUserId"
      :user-id="selectedUserId"
      @cancel="editVisible = false"
      @saved="editVisible = false"
    />
  </PrimeDialog>
  <PrimeDialog
    v-model:visible="deleteVisible"
    :header="t('user.delete.title')"
    modal
  >
    <p>{{ t('user.delete.confirm') }}</p>
    <div class="flex gap-2 justify-end mt-4">
      <PrimeButton
        :label="t('user.delete.actions.cancel')"
        severity="secondary"
        text
        @click="deleteVisible = false"
      />
      <PrimeButton
        :label="t('user.delete.actions.confirm')"
        :loading="isDeleting"
        severity="danger"
        @click="confirmDelete"
      />
    </div>
  </PrimeDialog>
</template>

<script setup lang="ts">
import { UserRole } from '@iut-intranet/db/enums'
import type { TrpcOutput } from '@iut-intranet/trpc'
import PrimeAvatar from 'primevue/avatar'
import PrimeButton from 'primevue/button'
import PrimeColumn from 'primevue/column'
import PrimeDataTable from 'primevue/datatable'
import PrimeDialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'

import { useSession } from '@/api/auth.api'
import { useDeleteUser } from '@/api/users.api'
import DepartmentTag from '@/components/department/department-tag.vue'
import AddUser from '@/components/user/add-user.vue'
import { useI18n } from '@/composables/use-i18n'

type User = TrpcOutput['user']['list']['items'][number]
type UserField = (keyof User & string) | 'departments'

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

const toast = useToast()
const { currentSession } = useSession()
const isAdmin = computed(
  () => currentSession.value?.user.role === UserRole.ADMIN,
)
const editVisible = ref(false)
const selectedUserId = ref<string | undefined>(undefined)

const { asyncStatus: deleteStatus, mutateAsync: deleteUser } = useDeleteUser()
const isDeleting = computed(() => deleteStatus.value === 'loading')
const deleteVisible = ref(false)
const selectedDeleteUserId = ref<string | undefined>(undefined)

const onEdit = (user: User) => {
  selectedUserId.value = user.id
  editVisible.value = true
}

const onDelete = (user: User) => {
  selectedDeleteUserId.value = user.id
  deleteVisible.value = true
}

const confirmDelete = async () => {
  if (!selectedDeleteUserId.value) return
  try {
    await deleteUser({ userId: selectedDeleteUserId.value })
    toast.add({
      detail: t('user.delete.toast.success.detail'),
      life: 3000,
      severity: 'success',
      summary: t('user.delete.toast.success.summary'),
    })
    deleteVisible.value = false
  } catch {
    toast.add({
      detail: t('user.delete.toast.error.detail'),
      life: 5000,
      severity: 'error',
      summary: t('user.delete.toast.error.summary'),
    })
  }
}

const columns = [
  { field: 'firstName', header: t('user.table.prénom') },
  { field: 'lastName', header: t('user.table.nom') },
  { field: 'departments', header: t('user.table.department') },
  { field: 'jobTitle', header: t('user.table.job') },
  { field: 'email', header: t('user.table.email') },
  { field: 'phone', header: t('user.table.phone') },
] satisfies { field: UserField; header: string }[]
</script>
