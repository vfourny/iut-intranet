<template>
  <AuthFormCard
    :error="signInStatus === 'error' ? t('auth.signIn.error') : undefined"
    :submit-label="t('auth.signIn.submit')"
    :subtitle="t('auth.signIn.header.subtitle')"
    :title="t('auth.signIn.header.title')"
    @submit="handleSubmit"
  >
    <InputField
      v-model="email"
      autocomplete="email"
      :error="errors.email"
      :label="t('auth.signIn.fields.email.label')"
      name="email"
    />

    <PasswordField
      v-model="password"
      autocomplete="current-password"
      :error="errors.password"
      :feedback="false"
      :label="t('auth.signIn.fields.password.label')"
      name="password"
      toggle-mask
    />

    <div class="flex items-center gap-2">
      <PrimeCheckbox
        v-model="rememberMe"
        binary
        input-id="rememberMe"
        name="rememberMe"
      />
      <label class="cursor-pointer text-sm text-slate-700" for="rememberMe">
        {{ t('auth.signIn.fields.rememberMe') }}
      </label>
    </div>

    <template #footer>
      {{ t('auth.signIn.footer.noAccount') }}
      <RouterLink
        class="font-medium text-blue-600 hover:underline"
        :to="{ name: RouteNames.auth.signUp }"
      >
        {{ t('auth.signIn.footer.createAccount') }}
      </RouterLink>
    </template>
  </AuthFormCard>
</template>

<script lang="ts" setup>
import { signInWithPasswordInputSchema } from '@iut-intranet/helpers/schemas/auth'
import type { SignInWithPasswordInput } from '@iut-intranet/helpers/types/auth'
import { useForm } from 'vee-validate'
import { useRouter } from 'vue-router'

import { useSignIn } from '@/api/auth.api'
import AuthFormCard from '@/components/auth/auth-form-card.vue'
import InputField from '@/components/ui/input-field.vue'
import PasswordField from '@/components/ui/password-field.vue'
import { useI18n } from '@/composables/use-i18n'
import { RouteNames } from '@/router'

const { t } = useI18n()
const router = useRouter()
const { mutateAsync: signIn, status: signInStatus } = useSignIn()

const {
  defineField,
  errors,
  handleSubmit: createSubmitHandler,
} = useForm<SignInWithPasswordInput>({
  validationSchema: signInWithPasswordInputSchema,
})

const [email] = defineField('email')
const [password] = defineField('password')
const [rememberMe] = defineField('rememberMe')

const handleSubmit = createSubmitHandler(async (values) => {
  await signIn(values)
  await router.push({ name: RouteNames.home })
})
</script>
