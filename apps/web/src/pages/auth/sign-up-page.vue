<template>
  <AuthFormCard
    :error="signUpStatus === 'error' ? t('auth.signUp.error') : undefined"
    :loading="asyncStatus === 'loading'"
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
      option-value="value"
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
      @input="onPhoneInput"
    />

    <PrimeFileUpload
      accept="image/jpeg,image/png,image/webp"
      choose-label="Changer d'avatar"
      mode="basic"
      @select="onAvatarSelect"
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
        class="font-medium text-primary hover:underline"
        :to="{ name: RouteNames.auth.signIn }"
      >
        {{ t('auth.signUp.footer.signIn') }}
      </RouterLink>
    </template>
  </AuthFormCard>
</template>

<script lang="ts" setup>
import { signUpWithPasswordInputSchema } from '@iut-intranet/helpers/schemas/auth'
import { formatPhoneNational } from '@iut-intranet/helpers/utils/phone'
import type { FileUploadSelectEvent } from 'primevue/fileupload'
import PrimeFileUpload from 'primevue/fileupload'
import { useForm } from 'vee-validate'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { z } from 'zod'

import { useSignUp } from '@/api/auth.api'
import { useUploadMyAvatar } from '@/api/users.api'
import AuthFormCard from '@/components/auth/auth-form-card.vue'
import InputField from '@/components/ui/input-field.vue'
import PasswordField from '@/components/ui/password-field.vue'
import SelectField from '@/components/ui/select-field.vue'
import { useEnumOptions } from '@/composables/use-enum-options'
import { useI18n } from '@/composables/use-i18n'
import { fileToUploadInput } from '@/lib/file'
import { resolveRedirect, RouteNames } from '@/router'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { asyncStatus, mutateAsync: signUp, status: signUpStatus } = useSignUp()
const { mutateAsync: mutateAvatar } = useUploadMyAvatar()

const selectedAvatarFile = ref<File | null>(null)

const onAvatarSelect = (event: FileUploadSelectEvent) => {
  const file = Array.isArray(event.files) ? event.files[0] : event.files
  if (!file) return

  const contentType = file.type
  if (
    contentType !== 'image/jpeg' &&
    contentType !== 'image/png' &&
    contentType !== 'image/webp'
  ) {
    return
  }

  selectedAvatarFile.value = file
}

const departmentOptions = useEnumOptions('department')

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

const onPhoneInput = (event: Event) => {
  // Ne pas reformater lors d'une suppression : AsYouType ré-insérerait les
  // séparateurs et empêcherait d'effacer un espace.
  if ((event as InputEvent).inputType?.startsWith('delete')) return
  phone.value = formatPhoneNational(phone.value ?? '')
}

const handleSubmit = createSubmitHandler(
  async ({ confirmPassword: _, ...values }) => {
    await signUp(values)

    if (selectedAvatarFile.value) {
      await mutateAvatar(await fileToUploadInput(selectedAvatarFile.value))
    }
    await router.replace(
      resolveRedirect(route.query.redirect) ?? { name: RouteNames.home },
    )
  },
)
</script>
