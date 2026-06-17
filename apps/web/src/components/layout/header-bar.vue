<template>
  <header
    class="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/80 px-6 py-2.5 backdrop-blur-md"
  >
    <div class="flex items-center gap-2">
      <RouterLink class="flex items-center" :to="{ name: RouteNames.home }">
        <img
          alt="IUT"
          class="h-10 w-auto object-contain"
          src="../../assets/img/logo_iut.png"
        />
      </RouterLink>
    </div>

    <PrimeMenubar
      :dt="{
        background: 'transparent',
        borderColor: 'transparent',
        borderRadius: '0',
        padding: '0',
        gap: '0.25rem',
      }"
      :model="items"
    >
      <template #item="{ item, props }">
        <a
          v-bind="props.action"
          class="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150"
          :class="
            isActive(item)
              ? 'bg-iut-blue-50 text-iut-blue-600'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          "
        >
          <i class="text-[0.95rem]" :class="item.icon" />
          <span>{{ item.label }}</span>
        </a>
      </template>
    </PrimeMenubar>

    <div class="flex items-center gap-2">
      <PrimeButton severity="secondary" text @click="profilMenu.toggle($event)">
        <div class="flex items-center gap-2">
          <PrimeAvatar v-if="me?.image" :image="me.image" shape="circle" />
          <PrimeAvatar v-else icon="pi pi-user" shape="circle" />
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
import PrimeButton from 'primevue/button'
import PrimeMenu from 'primevue/menu'
import PrimeMenubar from 'primevue/menubar'
import type { MenuItem } from 'primevue/menuitem'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useSession, useSignOut } from '@/api/auth.api'
import { useMe } from '@/api/users.api'
import { useI18n } from '@/composables/use-i18n'
import { NAV_ITEMS, NAV_ORDER, RouteNames } from '@/router'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { mutateAsync: signOut } = useSignOut()
const { currentSession } = useSession()
// L'avatar vient de `me` (URL signée), pas de la session better-auth qui ne
// contient que la clé S3 brute — inexploitable avec le bucket privé.
const { data: me } = useMe()

const items = computed<MenuItem[]>(() =>
  NAV_ORDER.map((key) => {
    const nav = NAV_ITEMS[key]
    return {
      command: () => router.push({ name: nav.route }),
      icon: nav.icon,
      label: t(nav.label),
      route: nav.route,
    }
  }),
)

// La page courante se détecte par son nom de route, posé sur chaque item.
const isActive = (item: MenuItem) => route.name === item.route

async function handleSignOut() {
  await signOut()
  router.push({ name: RouteNames.auth.signIn })
}

const profilMenu = ref()

const profilMenuItem = ref<MenuItem[]>([
  {
    command: () => router.push({ name: RouteNames.profil }),
    icon: 'pi pi-user',
    label: t('profil.access_profil'),
  },
  {
    command: () => handleSignOut(),
    icon: 'pi pi-sign-out',
    label: t('auth.signOut.label'),
  },
])
</script>
