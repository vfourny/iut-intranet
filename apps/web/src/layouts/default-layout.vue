<template>
  <div class="flex min-h-screen flex-col bg-background">
    <HeaderBar />
    <main class="flex-1">
      <div class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>
    <FooterBar />
  </div>
</template>

<script lang="ts" setup>
import FooterBar from '@/components/layout/footer-bar.vue'
import HeaderBar from '@/components/layout/header-bar.vue'
</script>
