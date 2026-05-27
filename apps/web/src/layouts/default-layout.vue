<template>
  <div class="min-h-screen">
    <Toast />
    <HeaderBar />
    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
  <FooterBar />
  <Toast />
</template>

<script lang="ts" setup>
import Toast from 'primevue/toast'

import FooterBar from '@/components/layout/footer-bar.vue'
import HeaderBar from '@/components/layout/header-bar.vue'
</script>
