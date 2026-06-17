<template>
  <div class="flex flex-col gap-8">
    <!-- L'en-tête générique (titre « Accueil ») est rendu par le layout ; on y
      téléporte seulement la date du jour comme sous-titre. -->
    <Teleport defer :to="pageHeaderSelector.subtitle">{{
      todayLabel
    }}</Teleport>

    <DashboardStats />

    <section class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <HighlightCarousel />
      <UpcomingEvents />
    </section>

    <LatestNews />
  </div>
</template>

<script lang="ts" setup>
import DashboardStats from '@/components/home/dashboard-stats.vue'
import HighlightCarousel from '@/components/home/highlight-carousel.vue'
import LatestNews from '@/components/home/latest-news.vue'
import UpcomingEvents from '@/components/home/upcoming-events.vue'
import { pageHeaderSelector } from '@/lib/page-header'

const todayLabel = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  weekday: 'long',
}).format(new Date())
</script>
