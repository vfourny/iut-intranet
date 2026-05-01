import { en } from '@/locales/en'
import { fr } from '@/locales/fr'

export type SupportedLocale = 'fr' | 'en'

type LocaleShape = {
  [Template in keyof typeof fr]: {
    [Key in keyof (typeof fr)[Template]]: string
  }
}

export const locales = { en, fr } as const satisfies Record<
  SupportedLocale,
  LocaleShape
>

export { en, fr }
