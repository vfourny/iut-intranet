import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import type { Preset } from '@primeuix/themes/types'

const iutBlue = {
  50: 'var(--color-iut-blue-50)',
  100: 'var(--color-iut-blue-100)',
  200: 'var(--color-iut-blue-200)',
  300: 'var(--color-iut-blue-300)',
  400: 'var(--color-iut-blue-400)',
  500: 'var(--color-iut-blue-500)',
  600: 'var(--color-iut-blue-600)',
  700: 'var(--color-iut-blue-700)',
  800: 'var(--color-iut-blue-800)',
  900: 'var(--color-iut-blue-900)',
  950: 'var(--color-iut-blue-950)',
}

const iutGrey = {
  0: '#ffffff',
  50: 'var(--color-iut-grey-50)',
  100: 'var(--color-iut-grey-100)',
  200: 'var(--color-iut-grey-200)',
  300: 'var(--color-iut-grey-300)',
  400: 'var(--color-iut-grey-400)',
  500: 'var(--color-iut-grey-500)',
  600: 'var(--color-iut-grey-600)',
  700: 'var(--color-iut-grey-700)',
  800: 'var(--color-iut-grey-800)',
  900: 'var(--color-iut-grey-900)',
  950: 'var(--color-iut-grey-950)',
}

export const IutPreset = definePreset(Aura, {
  semantic: {
    colorScheme: {
      dark: {
        primary: {
          activeColor: '{primary.200}',
          color: '{primary.400}',
          contrastColor: 'var(--color-iut-grey-950)',
          hoverColor: '{primary.300}',
        },
        surface: iutGrey,
      },
      light: {
        primary: {
          activeColor: '{primary.700}',
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.600}',
        },
        surface: iutGrey,
      },
    },
    primary: iutBlue,
  },
} satisfies Preset)
