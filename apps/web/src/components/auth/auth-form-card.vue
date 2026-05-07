<template>
  <PrimeCard>
    <template #header>
      <div class="px-6 pt-6">
        <h2 class="text-xl font-semibold text-foreground">{{ title }}</h2>
        <p class="mt-0.5 text-sm text-muted-foreground">{{ subtitle }}</p>
      </div>
    </template>
    <template #content>
      <PrimeFluid>
        <form class="space-y-4" @submit.prevent="emit('submit')">
          <PrimeMessage v-if="error" severity="error">{{ error }}</PrimeMessage>
          <slot />
          <PrimeButton
            class="w-full"
            :label="submitLabel"
            :loading="loading"
            type="submit"
          />
        </form>
      </PrimeFluid>
    </template>
    <template v-if="$slots.footer" #footer>
      <div class="pb-2 text-center text-sm text-muted-foreground">
        <slot name="footer" />
      </div>
    </template>
  </PrimeCard>
</template>

<script lang="ts" setup>
defineProps<{
  error?: string
  loading?: boolean
  submitLabel: string
  subtitle: string
  title: string
}>()

const emit = defineEmits<{
  submit: []
}>()
</script>
