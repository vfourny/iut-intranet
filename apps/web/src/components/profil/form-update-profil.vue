<template>
  <div class="max-w-5xl mx-auto w-full px-6 py-8 bg-white rounded-xl shadow-md">
    <form class="flex flex-col gap-6" @submit.prevent="onSubmit">
      <div class="flex flex-col gap-1.5">
        <label
          class="text-sm font-medium text-surface-700"
          for="phone"
        >
          {{ t('profil.fields.phone') }}
        </label>
        <PrimeInputText
          id="phone"
          v-model="phone"
          autocomplete="tel"
          class="w-full"
          inputmode="tel"
          placeholder="06 12 34 56 78"
          @input="onPhoneInput"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label
          class="text-sm font-medium text-surface-700"
          for="jobTitle"
        >
          {{ t('profil.fields.jobTitle') }}
        </label>
        <PrimeInputText
          id="jobTitle"
          v-model="jobTitle"
          autocomplete="organization-title"
          class="w-full"
          maxlength="150"
          @input="onInput"
        />
      </div>

      <PrimeFileUpload
        accept="image/jpeg,image/png,image/webp"
        auto
        choose-label="Changer d'avatar"
        custom-upload
        mode="basic"
        @uploader="onAvatarUpload"
      />

      <div class="flex justify-end pt-2">
        <PrimeButton
          :disabled="!isModificated"
          :label="t('profil.save')"
          :loading="isLoading"
          type="submit"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import {
  formatPhoneForStorage,
  formatPhoneNational,
  parsePhone,
} from '@iut-intranet/helpers/utils/phone'
import PrimeButton from 'primevue/button'
import type { FileUploadUploaderEvent } from 'primevue/fileupload'
import PrimeFileUpload from 'primevue/fileupload'
import PrimeInputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'
import { nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { MeWithDepartment } from '@/api/users.api'
import { useUpdateMe, useUploadMyAvatar } from '@/api/users.api'
import { fileToUploadInput } from '@/lib/file'

const { t } = useI18n()

const props = defineProps<{
  user: MeWithDepartment
}>()

const phone = ref<string>(parsePhone(props.user.phone ?? '')?.national ?? '')
const jobTitle = ref<string>(props.user.jobTitle ?? '')
const isModificated = ref(false)
const toast = useToast()

const { mutateAsync: mutateAvatar } = useUploadMyAvatar()
const { isLoading, mutate } = useUpdateMe()

const onAvatarUpload = async (event: FileUploadUploaderEvent) => {
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

  try {
    await mutateAvatar(await fileToUploadInput(file))
    toast.add({
      life: 3000,
      severity: 'success',
      summary: t('profil.avatar.success'),
    })
    await nextTick()
  } catch {
    toast.add({
      life: 5000,
      severity: 'error',
      summary: t('profil.avatar.fail'),
    })
  }
}

const onSubmit = async () => {
  try {
    await mutate({
      jobTitle: jobTitle.value,
      phone: (phone.value
        ? formatPhoneForStorage(phone.value)
        : undefined) as Exclude<typeof props.user.phone, null>,
    })
    isModificated.value = false
    toast.add({ life: 3000, severity: 'success', summary: t('profil.saved') })
  } catch {
    toast.add({
      life: 5000,
      severity: 'error',
      summary: t('profil.savedFailed'),
    })
  }
}

const onInput = () => {
  isModificated.value = true
}

const onPhoneInput = (event: Event) => {
  isModificated.value = true
  // Ne pas reformater lors d'une suppression : AsYouType ré-insérerait les
  // séparateurs et empêcherait d'effacer un espace.
  if ((event as InputEvent).inputType?.startsWith('delete')) return
  phone.value = formatPhoneNational(phone.value)
}
</script>
