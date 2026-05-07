<template>
  <header
    class="flex items-center justify-between border-b border-border bg-card px-6 py-3"
  >
    <span class="font-semibold text-foreground">
      {{ t('layout.auth.brand.title') }}
    </span>
    <div class="flex items-center gap-2">
      <PrimeButton
        :aria-label="
          isDark ? t('layout.colorMode.toLight') : t('layout.colorMode.toDark')
        "
        :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
        rounded
        severity="secondary"
        size="small"
        text
        @click="toggle"
      />
      <PrimeButton
        icon="pi pi-sign-out"
        :label="t('auth.signOut.label')"
        :loading="isSigninOutLoading"
        severity="secondary"
        size="small"
        text
        @click="handleSignOut()"
      />
    </div>
  </header>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

import { useSignOut } from '@/api/auth.api'
import { useColorMode } from '@/composables/use-color-mode'
import { useI18n } from '@/composables/use-i18n'
import { RouteNames } from '@/router'

const { t } = useI18n()
const router = useRouter()
const { isLoading: isSigninOutLoading, mutateAsync: signOut } = useSignOut()
const { isDark, toggle } = useColorMode()

async function handleSignOut() {
  await signOut()
  router.push({ name: RouteNames.auth.signIn })
}
</script>
