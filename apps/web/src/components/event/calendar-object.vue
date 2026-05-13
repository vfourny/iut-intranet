<script lang="ts" setup>
import type { EventClickArg } from '@fullcalendar/core/index.js'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import FullCalendar from '@fullcalendar/vue3'
import type { EventWithDepartment } from '@iut-intranet/helpers/types/event'
import PrimeButton from 'primevue/button'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import EventClickBox from '@/components/event/event-click-box.vue'
import { useI18n } from '@/composables/use-i18n'
import { RouteNames } from '@/router'

function defineColor(code: string) {
  switch (code) {
    case 'GACO':
    case 'GEA':
    case 'TC':
      return '#e6197a'
    case 'INFO':
    case 'GEII':
      return '#00a0d2'
    case 'GIM':
      return '#4d5f6e'
    case 'GB':
      return '#4dab1a'
    case 'GTE':
      return '#ff7300'
    default:
      return '#4d5f6e'
  }
}

const router = useRouter()
const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    events?: EventWithDepartment[]
  }>(),
  {
    events: () => [],
  },
)

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
  events: props.events.map((event) => ({
    backgroundColor: defineColor(event.department.code),
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

<template>
  <div style="position: relative">
    <div class="mb-4 flex justify-end">
      <PrimeButton
        icon="pi pi-plus"
        :label="t('event.addEvent')"
        @click="router.push({ name: RouteNames.event.create })"
      />
    </div>
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
