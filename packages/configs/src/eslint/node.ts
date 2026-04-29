import nodeConfig from '@vfourny/node-toolkit/eslint/node'
import typescriptEslint from 'typescript-eslint'

export default typescriptEslint.config(...nodeConfig, {
  rules: {
    'no-redeclare': 'off',
  },
})
