import { createI18n } from 'vue-i18n'

import { fr } from '@/langs/fr'

export const messages = {
  fr,
}

export type MessageSchema = typeof fr
export type Locale = keyof typeof messages

export const i18n = createI18n<MessageSchema, Locale>({
  fallbackLocale: 'fr' satisfies Locale,
  legacy: false,
  locale: 'fr' satisfies Locale,
  messages,
})
