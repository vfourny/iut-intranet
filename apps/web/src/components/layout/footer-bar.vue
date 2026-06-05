<template>
  <footer class="border-t border-border bg-card px-6 py-4">
    <div
      class="flex flex-col items-center gap-1 text-center text-sm text-muted-foreground"
    >
      <span
        >{{ t('layout.footer.location')
        }}{{ t('layout.footer.contactPhoneNumber') }}</span
      >
      <span class="font-medium text-foreground">{{
        t('layout.footer.title')
      }}</span>
      <span>{{ t('layout.footer.legals') }}</span>
    </div>
  </footer>
</template>

<script lang="ts" setup>
import { useI18n } from '@/composables/use-i18n'

const { t } = useI18n()
</script>
