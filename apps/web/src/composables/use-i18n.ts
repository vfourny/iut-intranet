import type { PickupPaths } from '@intlify/core-base'
import { useI18n as useVueI18n } from 'vue-i18n'

import type { MessageSchema } from '@/plugins/i18n'

export type TranslationKey = PickupPaths<MessageSchema>

export function useI18n() {
  const { t: $t, ...rest } = useVueI18n()

  function t(key: TranslationKey): string {
    return $t(key as string)
  }

  return { ...rest, t }
}
