<template>
  <AuthFormCard
    :error="signUpStatus === 'error' ? t('auth.signUp.error') : undefined"
    :loading="signUpStatus === 'pending'"
    :submit-label="t('auth.signUp.submit')"
    :subtitle="t('auth.signUp.header.subtitle')"
    :title="t('auth.signUp.header.title')"
    @submit="handleSubmit"
  >
    <div class="grid grid-cols-2 gap-3">
      <InputField
        v-model="firstName"
        autocomplete="given-name"
        :error="errors.firstName"
        :label="t('auth.signUp.fields.firstName.label')"
        name="firstName"
      />
      <InputField
        v-model="lastName"
        autocomplete="family-name"
        :error="errors.lastName"
        :label="t('auth.signUp.fields.lastName.label')"
        name="lastName"
      />
    </div>

    <InputField
      v-model="email"
      autocomplete="email"
      :error="errors.email"
      :label="t('auth.signUp.fields.email.label')"
      name="email"
    />

    <SelectField
      v-model="departmentCode"
      :error="errors.departmentCode"
      :label="t('auth.signUp.fields.department.label')"
      name="departmentCode"
      option-label="label"
      option-value="code"
      :options="departmentOptions"
      :placeholder="t('auth.signUp.fields.department.placeholder')"
    />

    <InputField
      v-model="jobTitle"
      autocomplete="organization-title"
      :error="errors.jobTitle"
      :label="t('auth.signUp.fields.jobTitle.label')"
      name="jobTitle"
      :placeholder="t('auth.signUp.fields.jobTitle.placeholder')"
    />

    <InputField
      v-model="phone"
      autocomplete="tel"
      :error="errors.phone"
      :label="t('auth.signUp.fields.phone.label')"
      name="phone"
      :placeholder="t('auth.signUp.fields.phone.placeholder')"
    />

    <PasswordField
      v-model="password"
      autocomplete="new-password"
      :error="errors.password"
      :hint="t('auth.signUp.fields.password.hint')"
      :label="t('auth.signUp.fields.password.label')"
      name="password"
      toggle-mask
    />

    <PasswordField
      v-model="confirmPassword"
      autocomplete="new-password"
      :error="errors.confirmPassword"
      :feedback="false"
      :label="t('auth.signUp.fields.confirmPassword.label')"
      name="confirmPassword"
      toggle-mask
    />

    <template #footer>
      {{ t('auth.signUp.footer.alreadyAccount') }}
      <RouterLink
        class="font-medium text-blue-600 hover:underline"
        :to="{ name: RouteNames.auth.signIn }"
      >
        {{ t('auth.signUp.footer.signIn') }}
      </RouterLink>
    </template>
  </AuthFormCard>
</template>

<script lang="ts" setup>
import { DepartmentCode } from '@iut-intranet/db/enums'
import { signUpWithPasswordInputSchema } from '@iut-intranet/helpers/schemas/auth'
import { useForm } from 'vee-validate'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'

import { useSignUp } from '@/api/auth.api'
import AuthFormCard from '@/components/auth/auth-form-card.vue'
import InputField from '@/components/ui/input-field.vue'
import PasswordField from '@/components/ui/password-field.vue'
import SelectField from '@/components/ui/select-field.vue'
import { useI18n } from '@/composables/use-i18n'
import { RouteNames } from '@/router'

const { t } = useI18n()
const router = useRouter()
const { mutateAsync: signUp, status: signUpStatus } = useSignUp()

const departmentOptions = computed(() =>
  Object.values(DepartmentCode).map((code) => ({
    code,
    label: t(`department.label.${code}`),
  })),
)

const signUpFormSchema = signUpWithPasswordInputSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: t('auth.signUp.fields.confirmPassword.mismatch'),
    path: ['confirmPassword'],
  })

type SignUpFormValues = z.infer<typeof signUpFormSchema>

const {
  defineField,
  errors,
  handleSubmit: createSubmitHandler,
} = useForm<SignUpFormValues>({
  validationSchema: signUpFormSchema,
})

const [confirmPassword] = defineField('confirmPassword')
const [departmentCode] = defineField('departmentCode')
const [email] = defineField('email')
const [firstName] = defineField('firstName')
const [jobTitle] = defineField('jobTitle')
const [lastName] = defineField('lastName')
const [password] = defineField('password')
const [phone] = defineField('phone')

const handleSubmit = createSubmitHandler(
  async ({ confirmPassword: _, ...values }) => {
    await signUp(values)
    router.push({ name: RouteNames.home })
  },
)
</script>
