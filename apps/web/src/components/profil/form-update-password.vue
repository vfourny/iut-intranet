<template>
  <div class="max-w-5xl mx-auto w-full px-6 py-8 bg-white rounded-xl shadow-md">
    <form class="flex flex-col gap-6" @submit.prevent="onSubmit">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">{{
            t('profil.password.current')
          }}</label>
          <PrimePassword
            v-model="currentPassword"
            class="w-full"
            input-class="w-full"
            toggle-mask
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">{{
            t('profil.password.new')
          }}</label>
          <PrimePassword
            v-model="newPassword"
            class="w-full"
            input-class="w-full"
            toggle-mask
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">{{
            t('profil.password.confirm')
          }}</label>
          <PrimePassword
            v-model="confirmNewPassword"
            class="w-full"
            input-class="w-full"
            toggle-mask
          />
        </div>

        <div class="flex justify-end pt-2">
          <PrimeButton :label="t('profil.save')" type="submit" />
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { passwordSchema } from '@iut-intranet/helpers/schemas/common'
import { updatePasswordInputSchema } from '@iut-intranet/helpers/schemas/user'
import PrimeButton from 'primevue/button'
import PrimePassword from 'primevue/password'
import { useToast } from 'primevue/usetoast'
import { useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'

import { useUpdatePasswordUser } from '@/api/users.api'

const { t } = useI18n()
const toast = useToast()

const { defineField, handleSubmit: updatePasswordHandleSubmit } = useForm({
  validationSchema: updatePasswordInputSchema
    .extend({
      confirmNewPassword: passwordSchema,
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: t('profil.password.nonSimilar'),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: t('profil.password.SimilarAll'),
    }),
})

const [currentPassword] = defineField('currentPassword')
const [newPassword] = defineField('newPassword')
const [confirmNewPassword] = defineField('confirmNewPassword')

const { mutate } = useUpdatePasswordUser()

const onSubmit = updatePasswordHandleSubmit(async (useFormValues) => {
  try {
    await mutate({
      currentPassword: useFormValues.currentPassword,
      newPassword: useFormValues.newPassword,
    })
    toast.add({
      detail: t('profil.password.success'),
      life: 3000,
      severity: 'success',
      summary: t('profil.saved'),
    })
  } catch {
    toast.add({
      detail: t('profil.password.fail'),
      life: 4000,
      severity: 'error',
      summary: t('profil.savedFailed'),
    })
  }
})
</script>
