<template>
  <article class="flex flex-col gap-4">
    <img
      v-if="news.coverUrl"
      :alt="news.title"
      class="h-64 w-full rounded-lg object-cover"
      :src="news.coverUrl"
    />
    <div v-else class="h-64 w-full rounded-lg" :style="{ backgroundColor: '#6366f1' }" />

    <div class="flex flex-wrap items-center gap-1">
      <NewsTag :status="news.status" />
      <DepartmentTag
        v-for="dept in news.targetDepartments"
        :key="dept.code"
        :code="dept.code as DepartmentCode"
      />
    </div>

    <div class="flex items-center gap-2 text-sm text-gray-400">
      <span v-if="news.publishedAt">{{ formatDate(news.publishedAt) }}</span>
      <span>{{ news.author.firstName }} {{ news.author.lastName }}</span>
    </div>

    <!-- Contenu HTML produit par l'éditeur PrimeVue (Quill) lors de la rédaction
         (formulaire gaté aux rédacteurs), rendu tel quel. -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="news-content" v-html="news.content" />
  </article>
</template>

<script lang="ts" setup>
import type { DepartmentCode } from '@iut-intranet/db/enums'

import type { News } from '@/api/news.api'
import DepartmentTag from '@/components/department/department-tag.vue'
import NewsTag from '@/components/news/news-tag.vue'

defineProps<{
  news: News
}>()

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<style scoped>
/* Restaure la mise en forme des balises produites par Quill, que le preflight
   Tailwind remet à plat (puces, marges, niveaux de titre). */
.news-content {
  line-height: 1.7;
}
.news-content :deep(p) {
  margin-block: 0.75rem;
}
.news-content :deep(h1),
.news-content :deep(h2),
.news-content :deep(h3) {
  margin-block: 1.25rem 0.5rem;
  font-weight: 600;
  line-height: 1.3;
}
.news-content :deep(h1) {
  font-size: 1.75rem;
}
.news-content :deep(h2) {
  font-size: 1.4rem;
}
.news-content :deep(h3) {
  font-size: 1.15rem;
}
.news-content :deep(ul),
.news-content :deep(ol) {
  margin-block: 0.75rem;
  padding-left: 1.5rem;
}
.news-content :deep(ul) {
  list-style: disc;
}
.news-content :deep(ol) {
  list-style: decimal;
}
.news-content :deep(a) {
  color: var(--p-primary-color);
  text-decoration: underline;
}
.news-content :deep(blockquote) {
  margin-block: 1rem;
  border-left: 4px solid var(--p-surface-300);
  padding-left: 1rem;
  color: var(--p-surface-500);
  font-style: italic;
}
.news-content :deep(img) {
  max-width: 100%;
  border-radius: 0.5rem;
}
</style>
