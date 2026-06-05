<template>
  <div class="flex flex-col gap-8">
    <!-- En-tête de bienvenue -->
    <header class="flex flex-col gap-1">
      <h1 class="text-3xl font-semibold tracking-tight text-foreground">
        {{ t('home.greeting')
        }}<span v-if="firstName">, {{ firstName }}</span> 👋
      </h1>
      <p class="text-muted-foreground first-letter:uppercase">
        {{ todayLabel }}
      </p>
    </header>

    <!-- Cartes statistiques -->
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        icon="pi pi-calendar"
        :label="t('home.stats.events')"
        :to="{ name: RouteNames.calendar }"
        tone="primary"
        :value="eventsCount"
      />
      <StatCard
        icon="pi pi-file"
        :label="t('home.stats.news')"
        :to="{ name: RouteNames.news.news }"
        tone="info"
        :value="newsCount"
      />
      <StatCard
        icon="pi pi-users"
        :label="t('home.stats.members')"
        :to="{ name: RouteNames.users }"
        tone="success"
        :value="membersCount"
      />
    </section>

    <!-- À la une + prochains événements -->
    <section class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div
        class="rounded-2xl border border-border bg-card p-5 lg:col-span-2"
      >
        <div class="mb-4 flex items-center justify-between gap-4">
          <h2 class="text-lg font-semibold text-foreground">
            {{ t('home.sections.highlights') }}
          </h2>
          <PrimeFileUpload
            accept="image/jpeg,image/png,image/webp"
            auto
            :choose-label="t('home.addPhoto')"
            custom-upload
            :max-file-size="MAX_UPLOAD_BYTES"
            mode="basic"
            @uploader="handleUpload"
          />
        </div>
        <div class="overflow-hidden rounded-xl">
          <ImageCarousel :images="images ?? []" />
        </div>
      </div>

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
        <ul v-if="upcomingEvents.length" class="flex flex-col gap-3">
          <li
            v-for="event in upcomingEvents"
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
    </section>

    <!-- Dernières actualités -->
    <section class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-foreground">
          {{ t('home.sections.latestNews') }}
        </h2>
        <RouterLink
          class="text-sm font-medium text-primary hover:underline"
          :to="{ name: RouteNames.news.news }"
        >
          {{ t('home.viewAll') }}
        </RouterLink>
      </div>
      <div
        v-if="latestNews.length"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <RouterLink
          v-for="news in latestNews"
          :key="news.id"
          class="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          :to="{ name: RouteNames.news.news }"
        >
          <div class="aspect-video overflow-hidden bg-muted">
            <img
              v-if="news.coverUrl"
              :alt="news.title"
              class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              :src="news.coverUrl"
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
              {{ news.title }}
            </p>
            <p class="mt-1 text-xs text-muted-foreground">
              {{ formatNewsDate(news.publishedAt) }}
            </p>
          </div>
        </RouterLink>
      </div>
      <p v-else class="text-sm text-muted-foreground">
        {{ t('home.empty.news') }}
      </p>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { NewsStatus } from '@iut-intranet/db/enums'
import { MAX_UPLOAD_BYTES } from '@iut-intranet/helpers/schemas/storage'
import type { FileUploadUploaderEvent } from 'primevue/fileupload'
import PrimeFileUpload from 'primevue/fileupload'
import { computed } from 'vue'

import { useSession } from '@/api/auth.api'
import { useVisibleEvents } from '@/api/event.api'
import { useHighlightImages, useUploadHighlightImage } from '@/api/highlight.api'
import { useVisibleNews } from '@/api/news.api'
import { useUsersPaginated } from '@/api/users.api'
import ImageCarousel from '@/components/carousel/carousel-image.vue'
import StatCard from '@/components/home/stat-card.vue'
import { useI18n } from '@/composables/use-i18n'
import { RouteNames } from '@/router'

const { t } = useI18n()

const { currentSession } = useSession()
const userId = computed(() => currentSession.value?.user.id ?? '')
const firstName = computed(() => currentSession.value?.user.firstName ?? '')

// « À la une » + upload (conservé depuis l'ancienne home).
const { mutate: uploadHighlightImage } = useUploadHighlightImage()
const { data: images, refetch } = useHighlightImages()

// Données du dashboard (toutes dérivées des hooks existants).
// Fenêtre fixe « à venir » (≈ 6 mois) : la home n'est pas un calendrier, on
// borne donc la requête au lieu de tout charger.
const DASHBOARD_HORIZON_DAYS = 180
const dashboardRange = {
  from: new Date(),
  to: new Date(Date.now() + DASHBOARD_HORIZON_DAYS * 24 * 60 * 60 * 1000),
}
const { data: events } = useVisibleEvents(userId.value, dashboardRange)
const { data: newsPage } = useVisibleNews(NewsStatus.PUBLISHED, 1, '', [])
const { data: usersPage } = useUsersPaginated(1, '')

const upcomingAll = computed(() =>
  (events.value ?? [])
    .filter((event) => new Date(event.startAt).getTime() >= Date.now())
    .sort(
      (a, b) =>
        new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    ),
)
const upcomingEvents = computed(() => upcomingAll.value.slice(0, 5))
const eventsCount = computed(() => upcomingAll.value.length)

const latestNews = computed(() => (newsPage.value?.items ?? []).slice(0, 4))
const newsCount = computed(() => newsPage.value?.total ?? 0)
const membersCount = computed(() => usersPage.value?.total ?? 0)

const todayLabel = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  weekday: 'long',
}).format(new Date())

const dayFormatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit' })
const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'short' })
const newsDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const dayNumber = (date: Date | string) => dayFormatter.format(new Date(date))
const monthShort = (date: Date | string) =>
  monthFormatter.format(new Date(date)).replace('.', '')
const formatNewsDate = (date: Date | string | null) =>
  date ? newsDateFormatter.format(new Date(date)) : ''

const handleUpload = async (event: FileUploadUploaderEvent) => {
  const file = Array.isArray(event.files) ? event.files[0] : event.files
  if (!file) return

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  await uploadHighlightImage({
    base64,
    contentType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
  })
  await refetch()
}
</script>
