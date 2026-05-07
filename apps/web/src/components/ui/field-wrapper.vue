<template>
  <div class="flex flex-col gap-1">
    <label class="text-sm font-medium text-foreground" :for="toKebabCase(name)">
      {{ label }}
    </label>
    <slot />
    <small v-if="error" class="text-xs text-danger">{{ error }}</small>
    <small v-else-if="hint" class="text-xs text-muted-foreground">{{
      hint
    }}</small>
  </div>
</template>

<script lang="ts" setup>
import { toKebabCase } from '@iut-intranet/helpers/utils/format'
export interface FieldWrapperProps {
  error?: string
  hint?: string
  label: string
  name: string
}

const {
  error = undefined,
  hint = undefined,
  label,
  name,
} = defineProps<FieldWrapperProps>()
</script>
