<template>
  <main class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight">
          {{ t('layout.auth.brand.title') }}
        </h1>
        <p class="text-slate-500 mt-1">
          {{ t('layout.auth.brand.subtitle') }}
        </p>
      </div>
      <slot />
    </div>
  </main>
</template>

<script lang="ts" setup>
import { useI18n } from '@/composables/use-i18n'

const { t } = useI18n()
</script>
