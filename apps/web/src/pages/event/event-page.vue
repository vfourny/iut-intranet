<template>
  <div>
    <CalendarObject
      :events="formattedEvents ?? []"
      @range-change="onRangeChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

import { useSession } from '@/api/auth.api'
import { type EventRange, useVisibleEvents } from '@/api/event.api'
import CalendarObject from '@/components/event/calendar-object.vue'

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
</script>
