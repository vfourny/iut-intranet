import '@/assets/styles/index.css'
import 'primeicons/primeicons.css'

import { PiniaColada } from '@pinia/colada'
import { createPinia } from 'pinia'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Checkbox from 'primevue/checkbox'
import PrimeVue from 'primevue/config'
import InputText from 'primevue/inputtext'
import Menubar from 'primevue/menubar'
import Message from 'primevue/message'
import Password from 'primevue/password'
import { createApp } from 'vue'

import App from '@/app.vue'
import { i18n } from '@/plugins/i18n'
import { router } from '@/router'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(PiniaColada)

app.use(PrimeVue, {
  pt: {
    button: {
      label: ({ props }: { props: Record<string, unknown> }) => ({
        class: props['label'] ? 'font-medium' : 'hidden',
      }),
      loadingIcon: { class: 'animate-spin' },
      root: ({ props }: { props: Record<string, unknown> }) => ({
        class: [
          'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:pointer-events-none disabled:opacity-50',
          {
            'h-7 px-2.5 text-xs': props['size'] === 'small',
            'h-9 px-4 text-sm': !props['size'] || props['size'] === 'normal',
            'h-11 px-5 text-base': props['size'] === 'large',
          },
          !props['severity'] &&
            !props['text'] &&
            'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400',
          props['severity'] === 'secondary' &&
            props['text'] &&
            'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400',
        ],
      }),
    },
    card: {
      body: { class: 'p-6' },
      content: { class: 'py-2' },
      footer: { class: 'pt-2' },
      root: { class: 'rounded-xl bg-white shadow-md' },
    },
    checkbox: {
      box: {
        class:
          'h-4 w-4 rounded border-2 transition-colors border-slate-300 bg-white data-[p-checked=true]:border-blue-500 data-[p-checked=true]:bg-blue-500',
      },
      checkmark: { class: 'text-white text-xs' },
      root: {
        class:
          'relative flex h-4 w-4 cursor-pointer items-center justify-center',
      },
    },
    inputtext: {
      root: ({ props }: { props: Record<string, unknown> }) => ({
        class: [
          'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400',
          props['invalid'] ? 'border-red-400' : 'border-slate-300',
        ],
      }),
    },
    message: {
      root: ({ props }: { props: Record<string, unknown> }) => ({
        class: [
          'flex items-start gap-2 rounded-lg px-4 py-3 text-sm',
          props['severity'] === 'error' && 'bg-red-50 text-red-700',
          (!props['severity'] || props['severity'] === 'info') &&
            'bg-blue-50 text-blue-700',
        ],
      }),
    },
    password: {
      root: { class: 'relative w-full' },
      toggleMaskButton: {
        class:
          'absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600',
      },
    },
  },
  unstyled: true,
})

app.component('PrimeAvatar', Avatar)
app.component('PrimeButton', Button)
app.component('PrimeCard', Card)
app.component('PrimeCheckbox', Checkbox)
app.component('PrimeInputText', InputText)
app.component('PrimeMenubar', Menubar)
app.component('PrimeMessage', Message)
app.component('PrimePassword', Password)

app.use(router)
app.use(i18n)

app.mount('#app')
