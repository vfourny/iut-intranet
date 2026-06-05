<template>
  <div class="space-y-4">
    <div
      class="max-w-5xl mx-auto flex items-start gap-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg px-4 py-3 text-sm text-blue-800"
    >
      <span>{{ t('profil.readOnlyNote') }}</span>
    </div>

    <div
      class="max-w-5xl mx-auto w-full px-6 py-8 bg-white rounded-xl shadow-md"
    >
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-semibold text-gray-900">
              {{ user.firstName }} {{ user.lastName }}
            </h1>
            <DepartmentTag :code="user.department.code" />
          </div>
          <p class="text-sm text-gray-500 mt-1">{{ user.email }}</p>
        </div>
      </div>
    </div>

    <FormUpdateProfil :user="user" />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import type { MeWithDepartment } from '@/api/users.api'
import DepartmentTag from '@/components/department/department-tag.vue'
import FormUpdateProfil from '@/components/profil/form-update-profil.vue'

defineProps<{
  user: MeWithDepartment
}>()

const { t } = useI18n()
</script>
