<template>
  <div class="flex min-h-[calc(100vh-57px)] items-center justify-center p-6">
    <h1 class="text-4xl font-bold text-slate-900">
      {{ t('home.greeting') }}
    </h1>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from '@/composables/use-i18n'

const { t } = useI18n()
</script>
