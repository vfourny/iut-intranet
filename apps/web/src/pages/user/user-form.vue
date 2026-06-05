<template>
  <div v-if="currentSession?.user.role == UserRole.ADMIN">
    <AddUser />
  </div>
</template>

<script lang="ts" setup>
import { UserRole } from '@iut-intranet/db/enums'

import { useSession } from '@/api/auth.api'
import AddUser from '@/components/user/add-user.vue'

const { currentSession } = useSession()
</script>
