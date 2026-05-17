<template>
  <div style="position: relative">
    <FullCalendar :options="calendar" />

    <EventClickBox
      v-if="selectedEvent"
      v-bind="selectedEvent"
      @close="selectedEvent = null"
    />

    <div
      v-if="selectedEvent"
      style="position: fixed; inset: 0; z-index: 999"
      @click="selectedEvent = null"
    />
  </div>
</template>

<script lang="ts" setup>
import type { EventClickArg } from '@fullcalendar/core/index.js'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import FullCalendar from '@fullcalendar/vue3'
import type { DepartmentCode } from '@iut-intranet/db/enums'
import type { TrpcOutput } from '@iut-intranet/trpc'
import { computed, ref } from 'vue'

import EventClickBox from '@/components/event/event-click-box.vue'
import { SPECIALTY_BY_DEPARTMENT } from '@/lib/department'

function getDepartmentColor(code: DepartmentCode) {
  const specialty = SPECIALTY_BY_DEPARTMENT[code]
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-dept-${specialty}-500`)
    .trim()
}

interface CalendarObjectProps {
  events: TrpcOutput['event']['listVisibleEventsForUser']
}

const { events } = defineProps<CalendarObjectProps>()

const isMobile = window.innerWidth < 768

const selectedEvent = ref<null | {
  description: string
  end: Date
  location: string
  organizer: string
  start: Date
  title: string
  x: number
  y: number
}>(null)

const calendar = computed(() => ({
  editable: true,
  eventClick: (info: EventClickArg) => {
    const pos = info.el.getBoundingClientRect()
    selectedEvent.value = {
      description: info.event.extendedProps.description,
      end: info.event.end ?? new Date(),
      location: info.event.extendedProps.location,
      organizer: info.event.extendedProps.organizer,
      start: info.event.start ?? new Date(),
      title: info.event.title,
      x: pos.left + window.scrollX,
      y: pos.top + window.scrollY,
    }
  },
  events: events.map((event) => ({
    backgroundColor: getDepartmentColor(event.department.code),
    end: event.endAt,
    id: event.id,
    start: event.startAt,
    title: event.titre,
  })),
  expandRows: true,
  headerToolbar: isMobile
    ? {
        center: 'title',
        left: 'prev,next',
        right: 'today',
      }
    : {
        center: 'title',
        left: 'prev,next today',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
  height: 'auto',
  initialView: isMobile ? 'timeGridDay' : 'timeGridWeek',
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  scrollTime: '08:00:00',
  slotMaxTime: '20:00:00',
  slotMinTime: '07:00:00',
}))
</script>
