<template>
  <div>
    <FullCalendar :options="calendar" />
    <EventClickBox ref="clickBox" :event="selectedEvent" />
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

type VisibleEvent = TrpcOutput['event']['listVisibleEventsForUser'][number]

interface CalendarObjectProps {
  events: TrpcOutput['event']['listVisibleEventsForUser']
}

const { events } = defineProps<CalendarObjectProps>()

function getDepartmentColor(code: DepartmentCode) {
  const specialty = SPECIALTY_BY_DEPARTMENT[code]
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-dept-${specialty}-500`)
    .trim()
}

const isMobile = window.innerWidth < 768

const selectedEvent = ref<null | VisibleEvent>(null)
const clickBox = ref<InstanceType<typeof EventClickBox> | null>(null)

const calendar = computed(() => ({
  editable: true,
  eventClick: (info: EventClickArg) => {
    selectedEvent.value = info.event.extendedProps.source as VisibleEvent
    clickBox.value?.show(info.jsEvent, info.el)
  },
  events: events.map((event) => ({
    backgroundColor: getDepartmentColor(event.department.code),
    end: event.endAt,
    extendedProps: { source: event },
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
