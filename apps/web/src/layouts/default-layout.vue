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
        :loading="isSigninOutLoading"
        severity="secondary"
        size="small"
        text
        @click="handleSignOut()"
      />
    </header>
    <main>
      <slot />
    </main>
    <footer class="border-t border-slate-200 bg-white px-6 py-4">
      <div
        class="flex flex-col items-center gap-1 text-center text-sm text-slate-500"
      >
        <span class="font-medium text-slate-700">{{
          t('layout.footer.title')
        }}</span>
        <span>{{ t('layout.footer.legal') }}</span>
        <span>{{ t('layout.footer.contact') }}</span>
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

import { useSignOut } from '@/api/auth.api'
import { useI18n } from '@/composables/use-i18n'
import { RouteNames } from '@/router'

const { t } = useI18n()
const router = useRouter()
const { isLoading: isSigninOutLoading, mutateAsync: signOut } = useSignOut()

async function handleSignOut() {
  await signOut()
  router.push({ name: RouteNames.auth.signIn })
}
</script>
