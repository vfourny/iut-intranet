<template>
  <div>
    <CalendarObject
      :events="formattedEvents ?? []"
      @create="openCreate"
      @edit="openEdit"
      @range-change="onRangeChange"
    />

    <PrimeDialog
      v-model:visible="formVisible"
      class="w-full max-w-2xl"
      :header="formEvent ? t('event.updateEvent') : t('event.addEvent')"
      modal
    >
      <EventFormulaire
        :key="formEvent?.id ?? 'create'"
        :department-code="formEvent?.department.code"
        :description="formEvent?.description"
        :end-at="formEvent ? new Date(formEvent.endAt) : undefined"
        :event-id="formEvent?.id"
        :is-public="formEvent?.isPublic"
        :location="formEvent?.location"
        :start-at="formEvent ? new Date(formEvent.startAt) : formStartAt"
        :title="formEvent?.title"
        @saved="formVisible = false"
      />
    </PrimeDialog>
  </div>
</template>

<script lang="ts" setup>
import type { TrpcOutput } from '@iut-intranet/trpc'
import PrimeDialog from 'primevue/dialog'
import { computed, ref } from 'vue'

import { useSession } from '@/api/auth.api'
import { type EventRange, useVisibleEvents } from '@/api/event.api'
import CalendarObject from '@/components/event/calendar-object.vue'
import EventFormulaire from '@/components/event/event-creation-form.vue'
import { useI18n } from '@/composables/use-i18n'

type VisibleEvent = TrpcOutput['event']['listVisible'][number]

const { t } = useI18n()
const { currentSession } = useSession()
const userId = computed(() => currentSession.value?.user.id ?? '')

// Fenêtre visible du calendrier : renseignée par le `datesSet` de FullCalendar,
// puis utilisée pour ne charger que les events de l'intervalle affiché.
const range = ref<EventRange | null>(null)
const onRangeChange = (next: EventRange) => {
  range.value = next
}

const { data: events } = useVisibleEvents(userId.value, range)

const formattedEvents = computed(() => {
  if (!events.value) return []

  return events.value.map((event) => ({
    ...event,
    endAt: new Date(event.endAt).toISOString(),
    startAt: new Date(event.startAt).toISOString(),
  }))
})

// `formEvent` indéfini = création, défini = édition de cet event. `formStartAt`
// pré-remplit la date de début lors d'une création depuis un clic sur le calendrier.
const formVisible = ref(false)
const formEvent = ref<undefined | VisibleEvent>(undefined)
const formStartAt = ref<Date | undefined>(undefined)

const openCreate = (startAt?: Date) => {
  formEvent.value = undefined
  formStartAt.value = startAt
  formVisible.value = true
}

const openEdit = (event: VisibleEvent) => {
  formEvent.value = event
  formStartAt.value = undefined
  formVisible.value = true
}
</script>
