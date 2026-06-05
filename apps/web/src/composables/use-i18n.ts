import type { PickupPaths } from '@intlify/core-base'
import type { NamedValue } from 'vue-i18n'
import { useI18n as useVueI18n } from 'vue-i18n'

import type { MessageSchema } from '@/plugins/i18n.plugin'

export type TranslationKey = PickupPaths<MessageSchema>

type TypedT = (
  key: TranslationKey,
  named?: NamedValue | number,
  plural?: number,
) => string

export function useI18n() {
  const composer = useVueI18n()
  return { ...composer, t: composer.t as unknown as TypedT }
}
