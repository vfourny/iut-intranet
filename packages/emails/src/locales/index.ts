import { fr } from '@/locales/fr'

export type SupportedLocale = 'fr'

type DeepLocaleShape<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends object
      ? DeepLocaleShape<T[K]>
      : never
}

type LocaleShape = DeepLocaleShape<typeof fr>

export const locales = { fr } as const satisfies Record<
  SupportedLocale,
  LocaleShape
>

export { fr }
