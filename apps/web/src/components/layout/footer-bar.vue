<template>
  <footer class="border-t border-slate-200 bg-white px-6 py-4">
    <div
      class="flex flex-col items-center gap-1 text-center text-sm text-slate-500"
    >
      <span
        >{{ t('layout.footer.location')
        }}{{ t('layout.footer.contactTel') }}</span
      >
      <span class="font-medium text-slate-700">{{
        t('layout.footer.title')
      }}</span>
      <span>{{ t('layout.footer.legal') }}</span>
    </div>
  </footer>
</template>

<script lang="ts" setup>
import { useI18n } from '@/composables/use-i18n'

const { t } = useI18n()
</script>
