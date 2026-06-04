<template>
  <div>
    <div class="mb-4 flex justify-end">
      <PrimeButton
        icon="pi pi-plus"
        :label="t('event.addEvent')"
        @click="router.push({ name: RouteNames.event.create })"
      />
    </div>
    <FullCalendar :options="calendar" />
    <EventClickBox ref="clickBox" :event="selectedEvent" />

    <PrimePopover ref="datePopover">
      <div class="min-w-52">
        <p class="mb-3 text-sm text-gray-600">
          {{ formatClickedDate(clickedDate) }}
        </p>
        <PrimeButton
          class="w-full"
          icon="pi pi-plus"
          :label="t('event.addEvent')"
          size="small"
          @click="navigateToCreate"
        />
      </div>
    </PrimePopover>
  </div>
</template>

<script lang="ts" setup>
import type { EventClickArg, EventDropArg } from '@fullcalendar/core/index.js'
import frLocale from '@fullcalendar/core/locales/fr'
import dayGridPlugin from '@fullcalendar/daygrid'
import { type DateClickArg } from '@fullcalendar/interaction'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import FullCalendar from '@fullcalendar/vue3'
import type { DepartmentCode } from '@iut-intranet/db/enums'
import type { TrpcOutput } from '@iut-intranet/trpc'
import PrimeButton from 'primevue/button'
import PrimePopover from 'primevue/popover'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useUpdateEvent } from '@/api/event.api'
import EventClickBox from '@/components/event/event-click-box.vue'
import { useI18n } from '@/composables/use-i18n'
import { SPECIALTY_BY_DEPARTMENT, SPECIALTY_COLORS } from '@/lib/department'
import { RouteNames } from '@/router'

type VisibleEvent = TrpcOutput['event']['listVisibleEventsForUser'][number]

interface CalendarObjectProps {
  events: TrpcOutput['event']['listVisibleEventsForUser']
}

const { events } = defineProps<CalendarObjectProps>()
const { mutate: updateEvent } = useUpdateEvent()

const router = useRouter()
const { t } = useI18n()

function getDepartmentColor(code: DepartmentCode) {
  return SPECIALTY_COLORS[SPECIALTY_BY_DEPARTMENT[code]]
}

const isMobile = window.innerWidth < 768

const selectedEvent = ref<null | VisibleEvent>(null)
const clickBox = ref<InstanceType<typeof EventClickBox> | null>(null)

const datePopover = ref<InstanceType<typeof PrimePopover> | null>(null)
const clickedDate = ref<Date | null>(null)

function formatClickedDate(date: Date | null) {
  if (!date) return ''
  return date.toLocaleString('fr-FR', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'long',
    weekday: 'long',
  })
}

function navigateToCreate() {
  datePopover.value?.hide()
  router.push({
    name: RouteNames.event.create,
    query: { startAt: clickedDate.value?.toISOString() },
  })
}

const calendar = computed(() => ({
  dateClick: (info: DateClickArg) => {
    clickedDate.value = info.date
    datePopover.value?.show(info.jsEvent, info.jsEvent.target as HTMLElement)
  },
  editable: true,
  eventClick: (info: EventClickArg) => {
    selectedEvent.value = info.event.extendedProps.source as VisibleEvent
    clickBox.value?.show(info.jsEvent, info.el)
  },
  eventDrop: (info: EventDropArg) => {
    updateEvent({
      endAt: info.event.end ?? undefined,
      id: info.event.id,
      startAt: info.event.start ?? undefined,
    })
  },
  events: events.map((event) => ({
    backgroundColor: getDepartmentColor(event.departments[0]?.code),
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
  locale: frLocale,
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  scrollTime: '08:00:00',
  selectable: true,
  slotMaxTime: '20:00:00',
  slotMinTime: '07:00:00',
}))
</script>
