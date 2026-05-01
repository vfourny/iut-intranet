<template>
  <FieldWrapper :error="error" :hint="hint" :label="label" :name="name">
    <PrimePassword
      v-model="model"
      :input-id="toKebabCase(name)"
      :invalid="!!error"
      v-bind="$attrs"
    />
  </FieldWrapper>
</template>

<script lang="ts" setup>
import { toKebabCase } from '@iut-intranet/helpers/utils/format'

import FieldWrapper, {
  type FieldWrapperProps,
} from '@/components/ui/field-wrapper.vue'

defineOptions({ inheritAttrs: false })

const model = defineModel<string | undefined>()

defineProps<FieldWrapperProps>()
</script>
