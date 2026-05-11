<template>
  <div>
    <CalendarObject :events="formattedEvents ?? []" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useSession } from '@/api/auth.api'
import { useVisibleEvents } from '@/api/event.api'
import CalendarObject from '@/components/event/calendar-object.vue'

const { currentSession } = useSession()
const userId = currentSession.value?.user.id ?? ''
const { data: events } = useVisibleEvents(userId)

const formattedEvents = computed(() => {
  if (!events.value) return []

  return events.value.map((event) => ({
    ...event,
    endAt: new Date(event.endAt),
    startAt: new Date(event.startAt),
  }))
})
</script>
