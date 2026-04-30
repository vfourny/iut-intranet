<template>
  <div class="min-h-screen">
    <header
      class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3"
    >
      <span class="font-semibold text-slate-900">
        {{ t('layout.auth.brand.title') }}
      </span>
      <PrimeButton
        icon="pi pi-sign-out"
        :label="t('auth.signOut.label')"
        :loading="isSigningOut"
        severity="secondary"
        size="small"
        text
        @click="signOut()"
      />
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>

<script lang="ts" setup>
import { useSignOut } from '@/composables/api/auth/use-sign-out'
import { useI18n } from '@/composables/use-i18n'

const { t } = useI18n()
const { isLoading: isSigningOut, mutate: signOut } = useSignOut()
</script>
