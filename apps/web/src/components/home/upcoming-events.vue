<template>
  <div class="rounded-2xl border border-border bg-card p-5">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-semibold text-foreground">
        {{ t('home.sections.upcomingEvents') }}
      </h2>
      <RouterLink
        class="text-sm font-medium text-primary hover:underline"
        :to="{ name: RouteNames.calendar }"
      >
        {{ t('home.viewAll') }}
      </RouterLink>
    </div>
    <ul v-if="events.length" class="flex flex-col gap-3">
      <li
        v-for="event in events"
        :key="event.id"
        class="flex items-center gap-3"
      >
        <div
          class="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-muted"
        >
          <span class="text-sm font-semibold leading-none text-foreground">
            {{ dayNumber(event.startAt) }}
          </span>
          <span class="text-[10px] uppercase text-muted-foreground">
            {{ monthShort(event.startAt) }}
          </span>
        </div>
        <div class="min-w-0">
          <p class="truncate font-medium text-foreground">
            {{ event.title }}
          </p>
          <p class="flex items-center gap-1 truncate text-sm text-muted-foreground">
            <i class="pi pi-map-marker text-xs" />
            {{ event.location }}
          </p>
        </div>
      </li>
    </ul>
    <p v-else class="text-sm text-muted-foreground">
      {{ t('home.empty.events') }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { useI18n } from '@/composables/use-i18n'
import { useDashboardEvents } from '@/composables/use-dashboard'
import { RouteNames } from '@/router'

const { t } = useI18n()

const { upcoming } = useDashboardEvents()
const events = computed(() => upcoming.value.slice(0, 5))

const dayFormatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit' })
const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'short' })

const dayNumber = (date: Date | string) => dayFormatter.format(new Date(date))
const monthShort = (date: Date | string) =>
  monthFormatter.format(new Date(date)).replace('.', '')
</script>
