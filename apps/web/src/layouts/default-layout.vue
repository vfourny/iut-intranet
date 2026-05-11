<template>
  <div class="min-h-screen">
    <HeaderBar />
    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <slot />
    </main>
    <footer class="border-t border-slate-200 bg-white px-6 py-4">
      <div
        class="flex flex-col items-center gap-1 text-center text-sm text-slate-500"
      >
        <span class="font-medium text-slate-700">{{
          t('layout.footer.title')
        }}</span>
        <span>{{ t('layout.footer.legal') }}</span>
        <span>{{ t('layout.footer.contact') }}</span>
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import HeaderBar from '@/components/layout/header-bar.vue'
</script>
