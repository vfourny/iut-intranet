import type { Linter } from 'eslint'
import typescriptEslint from 'typescript-eslint'

import eslintConfigNode from './src/eslint/node'

const configFilesRules: Linter.Config = {
  files: ['src/**/*.{ts,js}'],
  rules: {
    'import/no-default-export': 'off',
  },
}

export default typescriptEslint.config(...eslintConfigNode, configFilesRules)
