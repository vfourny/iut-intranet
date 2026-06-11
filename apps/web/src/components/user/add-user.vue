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
        :icon="isEditing ? 'pi pi-save' : 'pi pi-user-plus'"
        icon-pos="right"
        :label="
          t(isEditing ? 'user.edit.actions.submit' : 'user.add.actions.submit')
        "
        :loading="isLoading"
        type="submit"
      />
    </div>
  </form>
</template>

<script lang="ts" setup>
import type { updateUserFromAdminInput } from '@iut-intranet/helpers/schemas/user'
import { createUserInputSchema } from '@iut-intranet/helpers/schemas/user'
import { formatPhoneNational } from '@iut-intranet/helpers/utils/phone'
import PrimeButton from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { useForm } from 'vee-validate'
import { computed, watch } from 'vue'
import type { z } from 'zod'

import { useCreateUser, useGetUserById, useUpdateUser } from '@/api/users.api'
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

const { asyncStatus: createStatus, mutateAsync: createUser } = useCreateUser()
const { asyncStatus: updateStatus, mutateAsync: updateUser } = useUpdateUser()

const isLoading = computed(
  () => createStatus.value === 'loading' || updateStatus.value === 'loading',
)

const departmentOptions = useEnumOptions('department')

type CreateUserFormValues = z.infer<typeof createUserInputSchema>

const props = defineProps<{
  userId?: string
}>()

const { data: user } = useGetUserById(computed(() => props.userId))

const isEditing = computed(() => props.userId !== undefined)

const {
  defineField,
  errors,
  handleSubmit: createSubmitHandler,
  setValues,
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

watch(user, (u) => {
  if (!u) return
  setValues({
    departmentCode: u.department.code,
    email: u.email,
    firstName: u.firstName,
    jobTitle: u.jobTitle ?? undefined,
    lastName: u.lastName,
    phone: u.phone ?? undefined,
  })
})

const onSubmit = createSubmitHandler(async (values) => {
  try {
    if (isEditing.value) {
      if (!user.value) return
      await updateUser({
        ...values,
        role: user.value.role,
        userId: user.value.id as updateUserFromAdminInput['userId'],
      })
    } else {
      await createUser(values)
    }
    toast.add({
      detail: t(
        isEditing.value
          ? 'user.edit.toast.success.detail'
          : 'user.add.toast.success.detail',
      ),
      life: 3000,
      severity: 'success',
      summary: t(
        isEditing.value
          ? 'user.edit.toast.success.summary'
          : 'user.add.toast.success.summary',
      ),
    })
    emit('saved')
  } catch {
    toast.add({
      detail: t(
        isEditing.value
          ? 'user.edit.toast.error.detail'
          : 'user.add.toast.error.detail',
      ),
      life: 5000,
      severity: 'error',
      summary: t(
        isEditing.value
          ? 'user.edit.toast.error.summary'
          : 'user.add.toast.error.summary',
      ),
    })
  }
})
</script>
