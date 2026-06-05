<template>
  <component
    :is="props.to ? RouterLink : 'div'"
    class="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
    :to="props.to"
  >
    <div
      class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
      :class="TONE_CLASSES[props.tone ?? 'primary']"
    >
      <i class="text-xl" :class="props.icon" />
    </div>
    <div class="min-w-0">
      <p class="text-2xl font-semibold tracking-tight text-foreground">
        {{ props.value }}
      </p>
      <p class="truncate text-sm text-muted-foreground">{{ props.label }}</p>
    </div>
  </component>
</template>

<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'
import { RouterLink } from 'vue-router'

const props = defineProps<{
  icon: string
  label: string
  value: number | string
  tone?: 'primary' | 'info' | 'success' | 'warning'
  to?: RouteLocationRaw
}>()

// Classes littérales complètes : indispensable pour que Tailwind les détecte
// (pas d'interpolation `bg-${tone}` — le JIT ne les verrait pas).
const TONE_CLASSES = {
  info: 'bg-info/10 text-info',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
} as const
</script>
