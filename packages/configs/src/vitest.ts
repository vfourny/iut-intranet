import { resolve } from 'node:path'

import { defineProject } from 'vitest/config'

interface PackageProjectOptions {
  fileParallelism?: boolean
  name: string
  setupFiles?: string[]
}

/**
 * Shared Vitest "project" factory used by every testable package's
 * `vitest.config.ts`. Centralises the two things every package needs:
 *
 * - the `@/` (→ `src/`) and `@tests/` (→ `tests/`) path aliases, kept in sync
 *   with `@vfourny/node-toolkit/tsconfig/test`;
 * - `conditions: ['source']`, so internal `@iut-intranet/*` workspace deps
 *   resolve to their raw TypeScript `source` export instead of built `dist/`.
 *   That is what lets the test runner work without building every package
 *   first (only `@iut-intranet/configs` itself needs to be built, since this
 *   factory is imported while the config is loaded).
 */
export function definePackageProject(
  dirname: string,
  options: PackageProjectOptions,
) {
  const { name, ...testExtra } = options
  return defineProject({
    resolve: {
      alias: {
        '@/': `${resolve(dirname, 'src')}/`,
        '@tests/': `${resolve(dirname, 'tests')}/`,
      },
      conditions: ['source'],
    },
    test: {
      globals: true,
      name,
      ...testExtra,
    },
  })
}
