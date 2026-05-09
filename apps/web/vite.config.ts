import { resolve } from 'node:path'

import { getPublicEnv, getServerEnv } from '@iut-intranet/helpers/env'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const { PUBLIC_API_URL } = getPublicEnv('PUBLIC_API_URL')
const { APP_PORT } = getServerEnv('APP_PORT')

export default defineConfig({
  define: {
    'import.meta.env.PUBLIC_API_URL': JSON.stringify(PUBLIC_API_URL),
  },
  plugins: [vue(), tailwindcss()],
  preview: {
    host: true,
    port: APP_PORT,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    host: true,
    port: APP_PORT,
    strictPort: true,
  },
})
