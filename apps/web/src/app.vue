<template>
  <component :is="activeLayout">
    <RouterView />
  </component>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AuthLayout from '@/layouts/auth-layout.vue'
import DefaultLayout from '@/layouts/default-layout.vue'
import type { Layout } from '@/types/layout.type'

const route = useRoute()

const LayoutComponents = {
  auth: AuthLayout,
  default: DefaultLayout,
} as const satisfies Record<Layout, typeof DefaultLayout>

const activeLayout = computed(
  () => LayoutComponents[route.meta.layout] ?? DefaultLayout,
)
</script>
