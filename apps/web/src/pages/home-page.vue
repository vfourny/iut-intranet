<template>
  <div
    class="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center gap-6 p-6"
  >
    <h1 class="text-4xl font-bold text-slate-900">
      {{ t('home.greeting') }}
    </h1>

    <Button
      label="test view"
      @click="router.push({ name: RouteNames.user.annuaire })"
    />
    <Button
      label="test table"
      @click="router.push({ name: RouteNames.user.annuaire2 })"
    />
  </div>
</template>

<script lang="ts" setup>
import Button from 'primevue/button'
import { useRouter } from 'vue-router'

import { useI18n } from '@/composables/use-i18n'
import { RouteNames } from '@/router'

const { t } = useI18n()
const router = useRouter()
</script>
