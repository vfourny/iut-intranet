import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

export const IutPreset = definePreset(Aura, {
  semantic: {
    primary: {
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
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
      },
    },
  },
})
