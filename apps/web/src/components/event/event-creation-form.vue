<script lang="ts" setup>
import { createEventFormulaireInputSchema } from '@iut-intranet/helpers/schemas/event'
import type { createEventFormulaireInput } from '@iut-intranet/helpers/types/event'
import type { FormSubmitEvent } from '@primevue/forms'
import { Form as PrimeForm } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import PrimeButton from 'primevue/button'
import PrimeDatePicker from 'primevue/datepicker'
import PrimeInputText from 'primevue/inputtext'
import PrimeMessage from 'primevue/message'
import PrimeSelect from 'primevue/select'
import PrimeTextarea from 'primevue/textarea'
import PrimeToggleSwitch from 'primevue/toggleswitch'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useSession } from '@/api/auth.api'
import { useGetDepartments } from '@/api/department.api'
import { useCreateEvent } from '@/api/event.api'
import { useI18n } from '@/composables/use-i18n'
import { RouteNames } from '@/router'

const props = withDefaults(
  defineProps<{
    startAt?: Date
    endAt?: Date
  }>(),
  {
    endAt: undefined,
    startAt: undefined,
  },
)

const { t } = useI18n()
const router = useRouter()
const { currentSession } = useSession()
const { data: departments, isPending: isDepartmentsLoading } =
  useGetDepartments()
const { mutateAsync: createEvent } = useCreateEvent()
const resolver = zodResolver(
  createEventFormulaireInputSchema.omit({
    departmentId: true,
    organizerId: true,
  }),
)

const initialValues = {
  departmentId: currentSession.value?.user?.departmentId ?? '',
  description: '',
  endAt: props.endAt,
  isPublic: false,
  location: '',
  startAt: props.startAt,
  titre: '',
}

const selectedDepartmentId = ref(currentSession.value?.user?.departmentId ?? '')

async function onSubmit(event: FormSubmitEvent) {
  if (!event.valid || !currentSession.value) return

  const values = event.values

  const payload: createEventFormulaireInput = {
    departmentId: selectedDepartmentId.value,
    description: values.description ?? '',
    endAt: new Date(values.endAt),
    isPublic: values.isPublic ?? false,
    location: values.location ?? '',
    organizerId: currentSession.value.user.id,
    startAt: new Date(values.startAt),
    titre: values.titre ?? '',
  }

  await createEvent(payload)
  await router.push({ name: RouteNames.calendar })
}
</script>
<template>
  <div class="flex flex-col gap-4 p-4">
    <PrimeForm
      v-slot="$form"
      :initial-values="initialValues"
      :resolver="resolver"
      @submit="onSubmit"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label>{{ t('event.titre') }}</label>
          <PrimeInputText
            fluid
            name="titre"
            :placeholder="t('event.placeholder.titre')"
          />
          <PrimeMessage
            v-if="$form?.titre?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form?.titre?.error?.message }}
          </PrimeMessage>
        </div>

        <div class="flex flex-col gap-1">
          <label>{{ t('event.description') }}</label>
          <PrimeTextarea
            fluid
            name="description"
            :placeholder="t('event.placeholder.description')"
            rows="3"
          />
          <PrimeMessage
            v-if="$form?.description?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form?.description?.error?.message }}
          </PrimeMessage>
        </div>

        <div class="flex flex-col gap-1">
          <label>{{ t('event.department') }}</label>
          <PrimeSelect
            v-model="selectedDepartmentId"
            fluid
            :loading="isDepartmentsLoading"
            option-label="code"
            option-value="id"
            :options="departments ?? []"
            :placeholder="t('event.placeholder.department')"
          />
        </div>

        <div class="flex gap-4">
          <div class="flex flex-1 flex-col gap-1">
            <label>{{ t('event.startAt') }}</label>
            <PrimeDatePicker fluid hour-format="24" name="startAt" show-time />
            <PrimeMessage
              v-if="$form?.startAt?.invalid"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form?.startAt?.error?.message }}
            </PrimeMessage>
          </div>
          <div class="flex flex-1 flex-col gap-1">
            <label>{{ t('event.endAt') }}</label>
            <PrimeDatePicker fluid hour-format="24" name="endAt" show-time />
            <PrimeMessage
              v-if="$form?.endAt?.invalid"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form?.endAt?.error?.message }}
            </PrimeMessage>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label>{{ t('event.location') }}</label>
          <PrimeInputText
            fluid
            name="location"
            :placeholder="t('event.placeholder.location')"
          />
          <PrimeMessage
            v-if="$form?.location?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form?.location?.error?.message }}
          </PrimeMessage>
        </div>

        <div class="flex items-center gap-2">
          <PrimeToggleSwitch name="isPublic" />
          <label>{{ t('event.publicEvent') }}</label>
        </div>

        <PrimeButton :label="t('event.createEvent')" type="submit" />
      </div>
    </PrimeForm>
  </div>
</template>
