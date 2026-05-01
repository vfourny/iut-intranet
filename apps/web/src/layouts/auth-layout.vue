<template>
  <main class="min-h-screen grid lg:grid-cols-2 bg-slate-50">
    <section class="flex items-center justify-center p-6 sm:p-10">
      <div class="w-full max-w-md">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900 tracking-tight">
            {{ t('layout.auth.brand.title') }}
          </h1>
          <p class="text-slate-500 mt-1">
            {{ t('layout.auth.brand.subtitle') }}
          </p>
        </div>
        <slot />
      </div>
    </section>

    <aside
      class="hidden lg:flex relative overflow-hidden bg-linear-to-br from-blue-600 via-indigo-600 to-violet-700"
    >
      <div
        class="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
      />
      <div
        class="absolute bottom-0 right-0 h-112 w-md rounded-full bg-fuchsia-400/20 blur-3xl"
      />
      <div
        class="relative z-10 flex flex-col justify-end p-12 text-white max-w-lg"
      >
        <blockquote class="text-2xl font-medium leading-snug">
          {{ t('layout.auth.brand.subtitle') }}
        </blockquote>
        <p class="mt-4 text-sm text-white/70">
          {{ t('layout.auth.brand.title') }}
        </p>
      </div>
    </aside>
  </main>
</template>

<script lang="ts" setup>
import { useI18n } from '@/composables/use-i18n'

const { t } = useI18n()
</script>
