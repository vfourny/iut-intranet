<template>
  <section class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-foreground">
        {{ t('home.sections.latestNews') }}
      </h2>
      <RouterLink
        class="text-sm font-medium text-primary hover:underline"
        :to="{ name: RouteNames.news }"
      >
        {{ t('home.viewAll') }}
      </RouterLink>
    </div>
    <div
      v-if="news.length"
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <RouterLink
        v-for="item in news"
        :key="item.id"
        class="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
        :to="{ name: RouteNames.news }"
      >
        <div class="aspect-video overflow-hidden bg-muted">
          <img
            v-if="item.coverUrl"
            :alt="item.title"
            class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            :src="item.coverUrl"
          />
          <div
            v-else
            class="flex h-full items-center justify-center text-muted-foreground"
          >
            <i class="pi pi-image text-2xl" />
          </div>
        </div>
        <div class="flex flex-col gap-1 p-4">
          <p class="line-clamp-2 font-medium text-foreground">
            {{ item.title }}
          </p>
          <p class="mt-1 text-xs text-muted-foreground">
            {{ formatNewsDate(item.publishedAt) }}
          </p>
        </div>
      </RouterLink>
    </div>
    <p v-else class="text-sm text-muted-foreground">
      {{ t('home.empty.news') }}
    </p>
  </section>
</template>

<script lang="ts" setup>
import { NewsStatus } from '@iut-intranet/db/enums'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { useVisibleNews } from '@/api/news.api'
import { useI18n } from '@/composables/use-i18n'
import { RouteNames } from '@/router'

const { t } = useI18n()

const { data: newsPage } = useVisibleNews(NewsStatus.PUBLISHED, 1, '', [])
const news = computed(() => (newsPage.value?.items ?? []).slice(0, 4))

const newsDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const formatNewsDate = (date: Date | string | null) =>
  date ? newsDateFormatter.format(new Date(date)) : ''
</script>
