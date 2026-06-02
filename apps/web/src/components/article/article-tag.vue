<template>
  <PrimeTag :value="status" />
</template>

<script lang="ts" setup>
import type { ArticleStatus } from '@iut-intranet/db/enums'
import PrimeTag from 'primevue/tag'

defineProps<{ status: ArticleStatus }>()
</script>
