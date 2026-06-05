<template>
  <div class="flex min-h-screen flex-col bg-background">
    <HeaderBar />
    <main class="flex-1">
      <div class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          v-if="route.meta.title"
          class="mb-8"
          :subtitle="subtitle"
          :title="t(route.meta.title)"
        />
        <slot />
      </div>
    </main>
    <FooterBar />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import FooterBar from '@/components/layout/footer-bar.vue'
import HeaderBar from '@/components/layout/header-bar.vue'
import PageHeader from '@/components/layout/page-header.vue'
import { useI18n } from '@/composables/use-i18n'

const route = useRoute()
const { t } = useI18n()

// Le titre/sous-titre de page vivent dans `route.meta` (clés i18n), si bien
// que chaque page partage le même en-tête sans le réécrire.
const subtitle = computed(() =>
  route.meta.subtitle ? t(route.meta.subtitle) : undefined,
)
</script>
