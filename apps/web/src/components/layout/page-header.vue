<template>
  <header
    class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-semibold tracking-tight text-foreground">
        {{ title }}
      </h1>
      <!-- Sous-titre piloté par `meta.subtitle` (statique) ou complété par une
        page via `<Teleport to="#page-header-subtitle">` (dynamique, ex. la date
        de l'accueil). `empty:hidden` masque le paragraphe quand ni l'un ni
        l'autre n'est fourni. -->
      <p
        :id="PageHeaderOutlet.subtitle"
        class="text-muted-foreground first-letter:uppercase empty:hidden"
      >
        <template v-if="subtitle">{{ subtitle }}</template>
      </p>
    </div>

    <!-- Outlet d'actions : les pages y téléportent leurs boutons (créer, etc.).
      `empty:hidden` retire le conteneur quand la page n'a pas d'action. -->
    <div
      :id="PageHeaderOutlet.actions"
      class="flex items-center gap-2 empty:hidden"
    />
  </header>
</template>

<script lang="ts" setup>
import { PageHeaderOutlet } from '@/lib/page-header'

defineProps<{
  title: string
  subtitle?: string
}>()
</script>
