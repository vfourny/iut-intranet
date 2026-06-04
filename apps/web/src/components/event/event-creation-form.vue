<script lang="ts" setup>
import {
  createEventFormulaireInputSchema,
  updateEventFormulaireInputSchema,
} from '@iut-intranet/helpers/schemas/event'
import type {
  createEventFormulaireInput,
  updateEventFormulaireInput,
} from '@iut-intranet/helpers/types/event'
import type { FormSubmitEvent } from '@primevue/forms'
import { Form as PrimeForm } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import PrimeButton from 'primevue/button'
import PrimeDatePicker from 'primevue/datepicker'
import PrimeInputText from 'primevue/inputtext'
import PrimeMessage from 'primevue/message'
import PrimeMultiSelect from 'primevue/multiselect'
import PrimeTextarea from 'primevue/textarea'
import PrimeToggleSwitch from 'primevue/toggleswitch'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useSession } from '@/api/auth.api'
import { useGetDepartments } from '@/api/department.api'
import { useCreateEvent, useUpdateEvent } from '@/api/event.api'
import { useI18n } from '@/composables/use-i18n'
import { RouteNames } from '@/router'

const props = defineProps<{
  departmentIds?: string[]
  description?: string
  endAt?: Date
  eventId?: string
  isPublic?: boolean
  location?: string
  startAt?: Date
  titre?: string
}>()

const { t } = useI18n()
const router = useRouter()
const { currentSession } = useSession()
const { data: departments, isPending: isDepartmentsLoading } =
  useGetDepartments()
const { mutateAsync: createEvent } = useCreateEvent()
const { mutateAsync: updateEvent } = useUpdateEvent()

const isUpdateMode = computed(() => !!props.eventId)

const resolver = zodResolver(
  isUpdateMode.value
    ? updateEventFormulaireInputSchema
    : createEventFormulaireInputSchema.omit({
        departmentIds: true,
        organizerId: true,
      }),
)

const initialValues = computed(() => ({
  departmentIds: props.departmentIds ?? [
    currentSession.value?.user?.departmentId ?? '',
  ],
  description: props.description ?? '',
  endAt: props.endAt,
  isPublic: props.isPublic ?? false,
  location: props.location ?? '',
  startAt: props.startAt,
  titre: props.titre ?? '',
}))

const selectedDepartmentIds = ref<string[]>(
  props.departmentIds ?? [currentSession.value?.user?.departmentId ?? ''],
)

const startAtValue = ref<Date>(props.startAt ?? new Date())
const endAtValue = ref<Date>(props.endAt ?? new Date())
const titreValue = ref<string>(props.titre ?? '')
const descriptionValue = ref<string>(props.description ?? '')
const locationValue = ref<string>(props.location ?? '')
const isPublicValue = ref<boolean>(props.isPublic ?? false)

const toast = useToast()

async function onSubmit(formEvent: FormSubmitEvent) {
  if (!formEvent.valid || !currentSession.value) return
  try {
    if (isUpdateMode.value) {
      if (!props.eventId) return
      const payload: updateEventFormulaireInput = {
        departmentIds: selectedDepartmentIds.value,
        description: descriptionValue.value,
        endAt: endAtValue.value,
        id: props.eventId,
        isPublic: isPublicValue.value,
        location: locationValue.value,
        startAt: startAtValue.value,
        titre: titreValue.value,
      }
      await updateEvent(payload)
      toast.add({
        detail: t('event.toast.updated'),
        life: 3000,
        severity: 'success',
        summary: t('layout.success'),
      })
    } else {
      const payload: createEventFormulaireInput = {
        departmentIds: selectedDepartmentIds.value,
        description: descriptionValue.value,
        endAt: endAtValue.value,
        isPublic: isPublicValue.value,
        location: locationValue.value,
        organizerId: currentSession.value.user.id,
        startAt: startAtValue.value,
        titre: titreValue.value,
      }
      await createEvent(payload)
      toast.add({
        detail: t('event.toast.created'),
        life: 3000,
        severity: 'success',
        summary: t('layout.success'),
      })
    }
    await router.push({ name: RouteNames.calendar })
  } catch {
    toast.add({
      detail: t('event.toast.error'),
      life: 3000,
      severity: 'error',
      summary: t('layout.error'),
    })
  }
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
            v-model="titreValue"
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
            v-model="descriptionValue"
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
          <PrimeMultiSelect
            v-model="selectedDepartmentIds"
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
            <PrimeDatePicker
              v-model="startAtValue"
              fluid
              hour-format="24"
              name="startAt"
              show-time
            />
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
            <PrimeDatePicker
              v-model="endAtValue"
              fluid
              hour-format="24"
              name="endAt"
              show-time
            />
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
            v-model="locationValue"
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
          <PrimeToggleSwitch v-model="isPublicValue" name="isPublic" />
          <label>{{ t('event.publicEvent') }}</label>
        </div>

        <PrimeButton
          :label="
            isUpdateMode ? t('event.updateEvent') : t('event.createEvent')
          "
          type="submit"
        />
      </div>
    </PrimeForm>
  </div>
</template>
