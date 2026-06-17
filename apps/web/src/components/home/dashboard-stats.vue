<template>
  <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <StatCard
      v-for="stat in stats"
      :key="stat.label"
      :icon="stat.icon"
      :label="stat.label"
      :to="stat.to"
      :tone="stat.tone"
      :value="stat.value"
    />
  </section>
</template>

<script lang="ts" setup>
import { NewsStatus } from '@iut-intranet/db/enums'
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

import { useVisibleNews } from '@/api/news.api'
import { useUsersPaginated } from '@/api/users.api'
import StatCard from '@/components/home/stat-card.vue'
import { useDashboardEvents } from '@/composables/use-dashboard'
import { useI18n } from '@/composables/use-i18n'
import { RouteNames } from '@/router'

const { t } = useI18n()

// Mêmes requêtes que les sections (liste events / news) : dédupliquées par clé,
// donc aucune requête supplémentaire — on ne lit ici que les compteurs.
const { upcoming } = useDashboardEvents()
const { data: newsPage } = useVisibleNews([NewsStatus.PUBLISHED], 1, '', [])
const { data: usersPage } = useUsersPaginated(1, '', undefined)

const stats = computed(
  () =>
    [
      {
        icon: 'pi pi-calendar',
        label: t('home.stats.events'),
        to: { name: RouteNames.calendar },
        tone: 'primary',
        value: upcoming.value.length,
      },
      {
        icon: 'pi pi-file',
        label: t('home.stats.news'),
        to: { name: RouteNames.news },
        tone: 'info',
        value: newsPage.value?.total ?? 0,
      },
      {
        icon: 'pi pi-users',
        label: t('home.stats.members'),
        to: { name: RouteNames.users },
        tone: 'success',
        value: usersPage.value?.total ?? 0,
      },
    ] satisfies {
      icon: string
      label: string
      to: RouteLocationRaw
      tone: 'primary' | 'info' | 'success' | 'warning'
      value: number
    }[],
)
</script>
