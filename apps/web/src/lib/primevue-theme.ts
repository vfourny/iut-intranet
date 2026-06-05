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
  primitive: {
    // Coins légèrement plus arrondis qu'Aura par défaut → look « app » moderne,
    // sans tomber dans le pill. md sert aux inputs, xl aux cartes/overlays.
    borderRadius: {
      lg: '10px',
      md: '8px',
      none: '0',
      sm: '6px',
      xl: '14px',
      xs: '4px',
    },
  },
  semantic: {
    colorScheme: {
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
    content: {
      borderRadius: '{border.radius.xl}',
    },
    // Anneau de focus « halo » discret (style Linear) au lieu du trait sec.
    focusRing: {
      color: '{primary.color}',
      offset: '2px',
      shadow: '0 0 0 4px color-mix(in srgb, {primary.color} 18%, transparent)',
      style: 'solid',
      width: '2px',
    },
    // Inputs plus hauts et arrondis : plus d'air, moins « formulaire scolaire ».
    formField: {
      borderRadius: '{border.radius.lg}',
      paddingX: '0.875rem',
      paddingY: '0.625rem',
    },
    primary: iutBlue,
  },
} satisfies Preset)
