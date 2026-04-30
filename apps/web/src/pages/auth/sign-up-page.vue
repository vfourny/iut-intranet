<template>
  <PrimeCard>
    <template #header>
      <div class="px-6 pt-6">
        <h2 class="text-xl font-semibold text-slate-900">
          {{ t('auth.signUp.header.title') }}
        </h2>
        <p class="mt-0.5 text-sm text-slate-500">
          {{ t('auth.signUp.header.subtitle') }}
        </p>
      </div>
    </template>
    <template #content>
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <PrimeMessage v-if="status === 'error'" severity="error">
          {{ t('auth.signUp.error') }}
        </PrimeMessage>

        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-slate-700">{{
              t('auth.signUp.fields.firstName.label')
            }}</label>
            <PrimeInputText
              v-model="firstName"
              autocomplete="given-name"
              :invalid="!!errors.firstName"
              name="firstName"
            />
            <small v-if="errors.firstName" class="text-xs text-red-500">{{
              errors.firstName
            }}</small>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-slate-700">{{
              t('auth.signUp.fields.lastName.label')
            }}</label>
            <PrimeInputText
              v-model="lastName"
              autocomplete="family-name"
              :invalid="!!errors.lastName"
              name="lastName"
            />
            <small v-if="errors.lastName" class="text-xs text-red-500">{{
              errors.lastName
            }}</small>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-slate-700">{{
            t('auth.signUp.fields.email.label')
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
            t('auth.signUp.fields.password.label')
          }}</label>
          <PrimePassword
            v-model="password"
            autocomplete="new-password"
            :invalid="!!errors.password"
            name="password"
            toggle-mask
          />
          <small v-if="!errors.password" class="text-xs text-slate-400">{{
            t('auth.signUp.fields.password.hint')
          }}</small>
          <small v-if="errors.password" class="text-xs text-red-500">{{
            errors.password
          }}</small>
        </div>

        <PrimeButton
          class="w-full"
          :label="t('auth.signUp.submit')"
          :loading="status === 'pending'"
          type="submit"
        />
      </form>
    </template>
    <template #footer>
      <div class="pb-2 text-center text-sm text-slate-500">
        {{ t('auth.signUp.footer.alreadyAccount') }}
        <RouterLink
          class="font-medium text-blue-600 hover:underline"
          :to="{ name: RouteNames.auth.signIn }"
        >
          {{ t('auth.signUp.footer.signIn') }}
        </RouterLink>
      </div>
    </template>
  </PrimeCard>
</template>

<script lang="ts" setup>
import { signUpWithPasswordInputSchema } from '@iut-intranet/helpers/schemas/auth'
import type { SignUpWithPasswordInput } from '@iut-intranet/helpers/types/auth'
import { useForm } from 'vee-validate'
import { useRouter } from 'vue-router'

import { useSignUp } from '@/composables/api/auth/use-sign-up'
import { useI18n } from '@/composables/use-i18n'
import { RouteNames } from '@/router'

const { t } = useI18n()
const router = useRouter()
const { mutateAsync, status } = useSignUp()

const {
  defineField,
  errors,
  handleSubmit: createSubmitHandler,
} = useForm<SignUpWithPasswordInput>({
  validationSchema: signUpWithPasswordInputSchema,
})

const [email] = defineField('email')
const [firstName] = defineField('firstName')
const [lastName] = defineField('lastName')
const [password] = defineField('password')

const handleSubmit = createSubmitHandler(async (values) => {
  await mutateAsync(values)
  router.push({ name: RouteNames.home })
})
</script>
