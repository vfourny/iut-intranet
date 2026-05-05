<script lang="ts" setup>
import type { UserWithDepartment } from '@iut-intranet/helpers/types/user'
import { onMounted, ref } from 'vue'

import UserList from '@/components/user2/user-list.vue'
import UserSearchCard from '@/components/user2/user-search-card.vue'
import { getUsers } from '@/composables/use-user'

const users = ref<UserWithDepartment[]>([])

const fetchUsers = async (name?: string) => {
  users.value = (await getUsers(name)).map((user) => ({
    ...user,
    banExpires: user.banExpires ? new Date(user.banExpires) : null,
    createdAt: new Date(user.createdAt),
    department: user.department ?? null,
    updatedAt: new Date(user.updatedAt),
  }))
}

onMounted(() => fetchUsers())
</script>

<template>
  <UserSearchCard @search="fetchUsers" />
  <UserList :users="users" />
</template>
