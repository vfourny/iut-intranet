<template>
  <form class="space-y-8" @submit.prevent="handleSubmit">
    <section class="space-y-4">
      <h2
        class="text-xs font-semibold tracking-widest text-slate-400 uppercase"
      >
        {{ t('user.add.sections.account') }}
      </h2>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-700">
            {{ t('user.add.fields.name') }} <span class="text-red-400">*</span>
          </label>
          <PrimeInputText
            v-model="form.lastName"
            class="w-full"
            :placeholder="t('user.add.placeholders.name')"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-700">
            {{ t('user.add.fields.firstname') }}
            <span class="text-red-400">*</span>
          </label>
          <PrimeInputText
            v-model="form.firstName"
            class="w-full"
            :placeholder="t('user.add.placeholders.firstname')"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-700">
            {{ t('user.add.fields.email') }} <span class="text-red-400">*</span>
          </label>
          <PrimeInputText
            v-model="form.email"
            class="w-full"
            :placeholder="t('user.add.placeholders.email')"
            type="email"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-700">
            {{ t('user.add.fields.role') }} <span class="text-red-400">*</span>
          </label>
          <PrimeSelect
            v-model="form.role"
            class="w-full"
            :options="roleOptions"
            :placeholder="t('user.add.placeholders.role')"
          />
        </div>
      </div>
    </section>

    <section class="space-y-4">
      <h2
        class="text-xs font-semibold tracking-widest text-slate-400 uppercase"
      >
        {{ t('user.add.sections.profile') }}
      </h2>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-700">{{
            t('user.add.fields.jobTitle')
          }}</label>
          <PrimeInputText
            v-model="form.jobTitle"
            class="w-full"
            :placeholder="t('user.add.placeholders.jobTitle')"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-700">{{
            t('user.add.fields.phone')
          }}</label>
          <PrimeInputText
            v-model="form.phone"
            class="w-full"
            mask="99 99 99 99 99"
            :placeholder="t('user.add.placeholders.phone')"
          />
        </div>
      </div>
    </section>

    <section class="space-y-4">
      <h2
        class="text-xs font-semibold tracking-widest text-slate-400 uppercase"
      >
        {{ t('user.add.sections.department') }}
      </h2>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-700">
            {{ t('user.add.fields.departmentCode') }}
            <span class="text-red-400">*</span>
          </label>
          <PrimeSelect
            v-model="form.departmentCode"
            class="w-full"
            :options="codeOptions"
            :placeholder="t('user.add.placeholders.departmentCode')"
          />
        </div>
      </div>
    </section>

    <div class="flex justify-end gap-3 pt-2">
      <PrimeButton
        :label="t('user.add.actions.cancel')"
        severity="secondary"
        text
        type="button"
      />
      <PrimeButton
        icon="pi pi-user-plus"
        icon-pos="right"
        :label="t('user.add.actions.submit')"
        type="submit"
      />
    </div>
  </form>
</template>

<script lang="ts" setup>
import { DepartmentCode, UserRole } from '@iut-intranet/db/enums'
import type { createUserFromAdminInput } from '@iut-intranet/helpers/types/user'
import PrimeButton from 'primevue/button'
import PrimeInputText from 'primevue/inputtext'
import PrimeSelect from 'primevue/select'
import { useToast } from 'primevue/usetoast'
import { reactive } from 'vue'

import { useCreateUser } from '@/api/users.api'
import { useI18n } from '@/composables/use-i18n'
import { RouteNames, router } from '@/router'

const { mutateAsync } = useCreateUser()
const { t } = useI18n()
const toast = useToast()

const roleOptions = Object.values(UserRole)
const codeOptions = Object.values(DepartmentCode)

const form = reactive<createUserFromAdminInput>({
  departmentCode: DepartmentCode.INFO,
  email: '',
  firstName: '',
  jobTitle: '',
  lastName: '',
  phone: '',
  role: UserRole.USER,
})

async function handleSubmit() {
  try {
    await mutateAsync(form)
    toast.add({
      detail: t('user.add.toast.success.detail'),
      life: 3000,
      severity: 'success',
      summary: t('user.add.toast.success.summary'),
    })
    router.push({ name: RouteNames.directory })
  } catch {
    toast.add({
      detail: t('user.add.toast.error.detail'),
      life: 5000,
      severity: 'error',
      summary: t('user.add.toast.error.summary'),
    })
  }
}
</script>
