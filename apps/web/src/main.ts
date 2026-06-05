import '@/assets/styles/index.css'
import 'primeicons/primeicons.css'

import { PiniaColada } from '@pinia/colada'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import { createApp } from 'vue'

import App from '@/app.vue'
import { IutPreset } from '@/lib/primevue-theme'
import { i18n } from '@/plugins/i18n.plugin'
import { router } from '@/router'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(PiniaColada)
app.use(ToastService)

app.use(PrimeVue, {
  theme: {
    options: {
      cssLayer: {
        name: 'primevue',
        order: 'theme, base, primevue, utilities',
      },
      // App light-only : on coupe le dark de PrimeVue (sinon `system` suit
      // `prefers-color-scheme` et rend toutes les surfaces en noir).
      darkModeSelector: false,
    },
    preset: IutPreset,
  },
})

app.use(i18n)
app.use(router)
app.use(ConfirmationService)

app.mount('#app')
