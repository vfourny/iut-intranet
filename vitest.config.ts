import { defineConfig } from 'vitest/config'

const projects = ['packages/helpers', 'packages/services', 'packages/emails']

export default defineConfig({
  test: {
    api: {
      allowExec: true,
      host: '0.0.0.0',
      port: 51204,
    },
    coverage: {
      enabled: true,
      exclude: [
        '**/*.d.ts',
        '**/*.hbs',
        '**/dist/**',
        '**/generated/**',
        '**/node_modules/**',
      ],
      include: [
        'packages/helpers/src/**',
        'packages/emails/src/**',
        'packages/services/src/**',
      ],
      provider: 'v8',
      reportOnFailure: true,
      reporter: ['text', 'html'],
    },
    globals: true,
    projects,
    ui: true,
  },
})
