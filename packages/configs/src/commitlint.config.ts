import type { UserConfig } from '@commitlint/types'
import { createCommitlintMonorepoConfig } from '@vfourny/node-toolkit/commitlint'

const scopes = ['api', 'db', 'auth', 'trpc', 'helpers', 'configs']

export default createCommitlintMonorepoConfig({ scopes }) as UserConfig
