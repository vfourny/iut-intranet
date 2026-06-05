import { computed } from 'vue'

import type { TranslationKey } from '@/composables/use-i18n'
import { useI18n } from '@/composables/use-i18n'
import { enums } from '@/langs/fr/enums.lang'

export const useEnumOptions = <K extends keyof typeof enums>(name: K) => {
  const { t } = useI18n()

  return computed(() =>
    (Object.keys(enums[name]) as (keyof (typeof enums)[K] & string)[]).map(
      (value) => ({
        label: t(`enums.${name}.${value}` as TranslationKey),
        value,
      }),
    ),
  )
}
