<template>
  <header
    class="flex items-center justify-between border-b border-border bg-card px-6 py-3"
  >
    <div class="flex items-center gap-2">
      <RouterLink :to="{ name: RouteNames.home }">
        <img
          class="h-22 w-44 object-contain"
          src="../../assets/img/logo_iut.png"
        />
      </RouterLink>
    </div>

    <PrimeMenubar :model="items">
      <template #item="{ item, props }">
        <a class="flex items-center gap-2" v-bind="props.action">
          <i :class="item.icon" />
          <span>{{ item.label }}</span>
        </a>
      </template>
    </PrimeMenubar>

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

      <PrimeButton severity="secondary" text @click="profilMenu.toggle($event)">
        <div class="flex items-center gap-2">
          <PrimeAvatar icon="pi pi-user" shape="circle" />
          <span
            >{{ currentSession?.user.firstName }}
            {{ currentSession?.user.lastName }}</span
          >
          <i class="pi pi-angle-down text-xs" />
        </div>
      </PrimeButton>

      <PrimeMenu ref="profilMenu" :model="profilMenuItem" popup />
    </div>
  </header>
</template>

<script lang="ts" setup>
import PrimeAvatar from 'primevue/avatar'
import PrimeMenu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useSession, useSignOut } from '@/api/auth.api'
import { useColorMode } from '@/composables/use-color-mode'
import { useI18n } from '@/composables/use-i18n'
import { RouteNames } from '@/router'

const { t } = useI18n()
const router = useRouter()
const { mutateAsync: signOut } = useSignOut()
const { isDark, toggle } = useColorMode()
const { currentSession } = useSession()

const items = ref<MenuItem[]>([
  {
    command: () => router.push({ name: RouteNames.home }),
    icon: 'pi pi-home',
    label: t('layout.default.nav.home'),
  },
  {
    command: () => router.push({ name: RouteNames.directory }),
    icon: 'pi pi-users',
    label: t('layout.default.nav.directory'),
  },
  {
    command: () => router.push({ name: RouteNames.calendar }),
    icon: 'pi pi-calendar',
    label: t('layout.default.nav.calendar'),
  },
])

async function handleSignOut() {
  await signOut()
  router.push({ name: RouteNames.auth.signIn })
}

const profilMenu = ref()

const profilMenuItem = ref<MenuItem[]>([
  {
    command: () => handleSignOut(),
    icon: 'pi pi-sign-out',
    label: t('auth.signOut.label'),
  },
])
</script>
