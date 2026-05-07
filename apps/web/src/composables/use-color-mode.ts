import { computed, ref, watch } from 'vue'

type ColorMode = 'dark' | 'light'

const STORAGE_KEY = 'iut-color-mode'

function getInitialMode(): ColorMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

const mode = ref<ColorMode>(getInitialMode())

watch(
  mode,
  (next) => {
    document.documentElement.classList.toggle('dark', next === 'dark')
    localStorage.setItem(STORAGE_KEY, next)
  },
  { immediate: true },
)

export function useColorMode() {
  function toggle() {
    mode.value = mode.value === 'dark' ? 'light' : 'dark'
  }

  return {
    isDark: computed(() => mode.value === 'dark'),
    mode,
    toggle,
  }
}
