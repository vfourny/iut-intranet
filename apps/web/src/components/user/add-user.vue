<template>
  <form class="flex flex-col gap-8" @submit.prevent="onSubmit">
    <section class="flex flex-col gap-4">
      <h2
        class="text-xs font-semibold tracking-widest text-muted-foreground uppercase"
      >
        {{ t('user.add.sections.account') }}
      </h2>

      <div class="grid grid-cols-2 gap-4">
        <InputField
          v-model="lastName"
          autocomplete="family-name"
          :error="errors.lastName"
          :label="t('user.add.fields.lastName')"
          name="lastName"
          :placeholder="t('user.add.placeholders.lastName')"
        />
        <InputField
          v-model="firstName"
          autocomplete="given-name"
          :error="errors.firstName"
          :label="t('user.add.fields.firstName')"
          name="firstName"
          :placeholder="t('user.add.placeholders.firstName')"
        />
        <InputField
          v-model="email"
          autocomplete="email"
          :error="errors.email"
          :label="t('user.add.fields.email')"
          name="email"
          :placeholder="t('user.add.placeholders.email')"
          type="email"
        />
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <h2
        class="text-xs font-semibold tracking-widest text-muted-foreground uppercase"
      >
        {{ t('user.add.sections.profile') }}
      </h2>

      <div class="grid grid-cols-2 gap-4">
        <InputField
          v-model="jobTitle"
          autocomplete="organization-title"
          :error="errors.jobTitle"
          :label="t('user.add.fields.jobTitle')"
          name="jobTitle"
          :placeholder="t('user.add.placeholders.jobTitle')"
        />
        <InputField
          v-model="phone"
          autocomplete="tel"
          :error="errors.phone"
          inputmode="tel"
          :label="t('user.add.fields.phone')"
          name="phone"
          :placeholder="t('user.add.placeholders.phone')"
          @input="onPhoneInput"
        />
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <h2
        class="text-xs font-semibold tracking-widest text-muted-foreground uppercase"
      >
        {{ t('user.add.sections.department') }}
      </h2>

      <div class="grid grid-cols-2 gap-4">
        <SelectField
          v-model="departmentCode"
          :error="errors.departmentCode"
          :label="t('user.add.fields.departmentCode')"
          name="departmentCode"
          option-label="label"
          option-value="value"
          :options="departmentOptions"
          :placeholder="t('user.add.placeholders.departmentCode')"
        />
      </div>
    </section>

    <div class="flex justify-end gap-3 pt-2">
      <PrimeButton
        :label="t('user.add.actions.cancel')"
        severity="secondary"
        text
        type="button"
        @click="emit('cancel')"
      />
      <PrimeButton
        icon="pi pi-user-plus"
        icon-pos="right"
        :label="t('user.add.actions.submit')"
        :loading="isLoading"
        type="submit"
      />
    </div>
  </form>
</template>

<script lang="ts" setup>
import { createUserInputSchema } from '@iut-intranet/helpers/schemas/user'
import { formatPhoneNational } from '@iut-intranet/helpers/utils/phone'
import PrimeButton from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { useForm } from 'vee-validate'
import type { z } from 'zod'

import { useCreateUser } from '@/api/users.api'
import InputField from '@/components/ui/input-field.vue'
import SelectField from '@/components/ui/select-field.vue'
import { useEnumOptions } from '@/composables/use-enum-options'
import { useI18n } from '@/composables/use-i18n'

const emit = defineEmits<{
  cancel: []
  saved: []
}>()

const { t } = useI18n()
const toast = useToast()

const { isLoading, mutateAsync: createUser } = useCreateUser()

const departmentOptions = useEnumOptions('department')

type CreateUserFormValues = z.infer<typeof createUserInputSchema>

const {
  defineField,
  errors,
  handleSubmit: createSubmitHandler,
} = useForm<CreateUserFormValues>({
  validationSchema: createUserInputSchema,
})

const [departmentCode] = defineField('departmentCode')
const [email] = defineField('email')
const [firstName] = defineField('firstName')
const [jobTitle] = defineField('jobTitle')
const [lastName] = defineField('lastName')
const [phone] = defineField('phone')

const onPhoneInput = (event: Event) => {
  // Ne pas reformater lors d'une suppression : AsYouType ré-insérerait les
  // séparateurs et empêcherait d'effacer un espace.
  if ((event as InputEvent).inputType?.startsWith('delete')) return
  phone.value = formatPhoneNational(phone.value ?? '')
}

const onSubmit = createSubmitHandler(async (values) => {
  try {
    await createUser(values)
    toast.add({
      detail: t('user.add.toast.success.detail'),
      life: 3000,
      severity: 'success',
      summary: t('user.add.toast.success.summary'),
    })
    emit('saved')
  } catch {
    toast.add({
      detail: t('user.add.toast.error.detail'),
      life: 5000,
      severity: 'error',
      summary: t('user.add.toast.error.summary'),
    })
  }
})
</script>
