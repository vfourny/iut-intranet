<template>
  <PrimeTag
    :class="SPECIALTY_TAG_CLASSES[SPECIALTY_BY_DEPARTMENT[code]]"
    :value="code"
  />
</template>

<script lang="ts" setup>
import type { DepartmentCode } from '@iut-intranet/db/enums'
import PrimeTag from 'primevue/tag'

import {
  SPECIALTY_BY_DEPARTMENT,
  SPECIALTY_TAG_CLASSES,
} from '@/lib/department'

defineProps<{ code: DepartmentCode }>()
</script>
