<template>
  <PrimeTag :value="status" />
</template>

<script lang="ts" setup>
import type { NewsStatus } from '@iut-intranet/db/enums'
import PrimeTag from 'primevue/tag'

defineProps<{ status: NewsStatus }>()
</script>
