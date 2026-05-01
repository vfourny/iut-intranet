<template>
  <PrimeCard>
    <template #header>
      <div class="px-6 pt-6">
        <h2 class="text-xl font-semibold text-slate-900">
          {{ t('auth.signIn.header.title') }}
        </h2>
        <p class="mt-0.5 text-sm text-slate-500">
          {{ t('auth.signIn.header.subtitle') }}
        </p>
      </div>
    </template>
    <template #content>
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <PrimeMessage v-if="status === 'error'" severity="error">
          {{ t('auth.signIn.error') }}
        </PrimeMessage>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-slate-700">{{
            t('auth.signIn.fields.email.label')
          }}</label>
          <PrimeInputText
            v-model="email"
            autocomplete="email"
            :invalid="!!errors.email"
            name="email"
            type="email"
          />
          <small v-if="errors.email" class="text-xs text-red-500">{{
            errors.email
          }}</small>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-slate-700">{{
            t('auth.signIn.fields.password.label')
          }}</label>
          <PrimePassword
            v-model="password"
            autocomplete="current-password"
            :feedback="false"
            :invalid="!!errors.password"
            name="password"
            toggle-mask
          />
          <small v-if="errors.password" class="text-xs text-red-500">{{
            errors.password
          }}</small>
        </div>

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

        <PrimeButton
          class="w-full"
          :label="t('auth.signIn.submit')"
          type="submit"
        />
      </form>
    </template>
    <template #footer>
      <div class="pb-2 text-center text-sm text-slate-500">
        {{ t('auth.signIn.footer.noAccount') }}
        <RouterLink
          class="font-medium text-blue-600 hover:underline"
          :to="{ name: RouteNames.auth.signUp }"
        >
          {{ t('auth.signIn.footer.createAccount') }}
        </RouterLink>
      </div>
    </template>
  </PrimeCard>
</template>

<script lang="ts" setup>
import { signInWithPasswordInputSchema } from '@iut-intranet/helpers/schemas/auth'
import type { SignInWithPasswordInput } from '@iut-intranet/helpers/types/auth'
import { useForm } from 'vee-validate'
import { useRouter } from 'vue-router'

import { useSignIn } from '@/composables/api/auth/use-sign-in'
import { useI18n } from '@/composables/use-i18n'
import { RouteNames } from '@/router'

const { t } = useI18n()
const router = useRouter()
const { mutateAsync, status } = useSignIn()

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
  await mutateAsync(values)
  router.push({ name: RouteNames.home })
})
</script>
