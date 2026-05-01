import eslintConfigNode from '@iut-intranet/configs/eslint/node'
import typescriptEslint from 'typescript-eslint'

export default typescriptEslint.config(
  ...eslintConfigNode,
  {
    ignores: ['generated'],
  },
  {
    files: ['src/seeds/**'],
    rules: { 'no-console': 'off' },
  },
)
