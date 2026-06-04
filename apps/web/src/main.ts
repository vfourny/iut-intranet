import '@/assets/styles/index.css'
import 'primeicons/primeicons.css'

import { PiniaColada } from '@pinia/colada'
import { createPinia } from 'pinia'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Checkbox from 'primevue/checkbox'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import Fluid from 'primevue/fluid'
import InputText from 'primevue/inputtext'
import Menubar from 'primevue/menubar'
import Message from 'primevue/message'
import Password from 'primevue/password'
import Select from 'primevue/select'
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

app.component('PrimeAvatar', Avatar)
app.component('PrimeButton', Button)
app.component('PrimeCard', Card)
app.component('PrimeCheckbox', Checkbox)
app.component('PrimeFluid', Fluid)
app.component('PrimeInputText', InputText)
app.component('PrimeMenubar', Menubar)
app.component('PrimeMessage', Message)
app.component('PrimePassword', Password)
app.component('PrimeSelect', Select)

app.use(i18n)
app.use(router)
app.use(ConfirmationService)

app.mount('#app')
