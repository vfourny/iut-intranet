<template>
  <FieldWrapper :error="error" :hint="hint" :label="label" :name="name">
    <PrimeSelect
      :id="toKebabCase(name)"
      v-model="model"
      :invalid="!!error"
      :option-label="optionLabel"
      :option-value="optionValue"
      :options="options"
      :placeholder="placeholder"
      v-bind="$attrs"
    />
  </FieldWrapper>
</template>

<script
  lang="ts"
  setup
  generic="TOption extends Record<string, unknown>, TValue"
>
import { toKebabCase } from '@iut-intranet/helpers/utils/format'

import FieldWrapper, {
  type FieldWrapperProps,
} from '@/components/ui/field-wrapper.vue'

defineOptions({ inheritAttrs: false })

const model = defineModel<TValue | undefined>()

defineProps<
  FieldWrapperProps & {
    optionLabel?: keyof TOption & string
    options: TOption[]
    optionValue?: keyof TOption & string
    placeholder?: string
  }
>()
</script>
