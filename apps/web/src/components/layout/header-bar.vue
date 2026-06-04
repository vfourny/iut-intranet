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

    <PrimeMenubar :model="items">
      <template #item="{ item, props }">
        <a class="flex items-center gap-2" v-bind="props.action">
          <i :class="item.icon" />
          <span>{{ item.label }}</span>
        </a>
      </template>
    </PrimeMenubar>

    <div class="flex items-center gap-2">
      <PrimeButton severity="secondary" text @click="profilMenu.toggle($event)">
        <div class="flex items-center gap-2">
          <PrimeAvatar
            v-if="me?.image"
            :image="me.image"
            shape="circle"
          />
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
import PrimeMenu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useSession, useSignOut } from '@/api/auth.api'
import { useMe } from '@/api/users.api'
import { useI18n } from '@/composables/use-i18n'
import { RouteNames } from '@/router'

const { t } = useI18n()
const router = useRouter()
const { mutateAsync: signOut } = useSignOut()
const { currentSession } = useSession()
// L'avatar vient de `me` (URL signée), pas de la session better-auth qui ne
// contient que la clé S3 brute — inexploitable avec le bucket privé.
const { data: me } = useMe()

const items = ref<MenuItem[]>([
  {
    command: () => router.push({ name: RouteNames.home }),
    icon: 'pi pi-home',
    label: t('layout.default.nav.home'),
  },
  {
    command: () => router.push({ name: RouteNames.users }),
    icon: 'pi pi-users',
    label: t('layout.default.nav.directory'),
  },
  {
    command: () => router.push({ name: RouteNames.calendar }),
    icon: 'pi pi-calendar',
    label: t('layout.default.nav.calendar'),
  },
  {
    command: () => router.push({ name: RouteNames.news.news }),
    icon: 'pi pi-file',
    label: t('layout.default.nav.news'),
  },
])

async function handleSignOut() {
  await signOut()
  router.push({ name: RouteNames.auth.signIn })
}

const profilMenu = ref()

const profilMenuItem = ref<MenuItem[]>([
  {
    command: () => router.push({ name: RouteNames.profil.private }),
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
