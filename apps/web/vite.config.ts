import { resolve } from 'node:path'

import { getEnv } from '@iut-intranet/helpers/env'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const env = getEnv('APP_PORT', 'API_URL')

export default defineConfig({
  define: {
    'import.meta.env.API_URL': JSON.stringify(env.API_URL),
  },
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    host: true,
    port: env.APP_PORT,
    strictPort: true,
  },
})
