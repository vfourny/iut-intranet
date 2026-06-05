<template>
  <div>
    <div class="mb-4 flex justify-end">
      <PrimeButton
        icon="pi pi-plus"
        :label="t('event.addEvent')"
        @click="emit('create')"
      />
    </div>
    <FullCalendar :options="calendar">
      <template #eventContent="arg">
        <span
          v-tooltip="eventTooltip(arg.event.extendedProps.source)"
          class="cursor-pointer"
        >
          {{ arg.event.title }}
        </span>
      </template>
    </FullCalendar>
    <EventClickBox
      ref="clickBox"
      :event="selectedEvent"
      @edit="emit('edit', $event)"
    />

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
import type {
  DatesSetArg,
  EventClickArg,
  EventDropArg,
} from '@fullcalendar/core/index.js'
import frLocale from '@fullcalendar/core/locales/fr'
import dayGridPlugin from '@fullcalendar/daygrid'
import { type DateClickArg } from '@fullcalendar/interaction'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import timeGridPlugin from '@fullcalendar/timegrid'
import FullCalendar from '@fullcalendar/vue3'
import type { DepartmentCode } from '@iut-intranet/db/enums'
import { eventIdSchema } from '@iut-intranet/helpers/schemas/brand'
import type { TrpcOutput } from '@iut-intranet/trpc'
import PrimeButton from 'primevue/button'
import PrimePopover from 'primevue/popover'
import vTooltip from 'primevue/tooltip'
import { computed, ref } from 'vue'

import { useUpdateEvent } from '@/api/event.api'
import EventClickBox from '@/components/event/event-click-box.vue'
import { useI18n } from '@/composables/use-i18n'
import { SPECIALTY_BY_DEPARTMENT, SPECIALTY_COLORS } from '@/lib/department'

type VisibleEvent = TrpcOutput['event']['listVisible'][number]

interface CalendarObjectProps {
  events: TrpcOutput['event']['listVisible']
}

const { events } = defineProps<CalendarObjectProps>()
const { mutate: updateEvent } = useUpdateEvent()

// `rangeChange` : fenêtre visible (recharge des events). `create`/`edit` :
// ouverture de la modale côté page calendrier, avec la date cliquée pour la
// création depuis le calendrier et l'event sélectionné pour l'édition.
const emit = defineEmits<{
  create: [startAt?: Date]
  edit: [VisibleEvent]
  rangeChange: [{ from: Date; to: Date }]
}>()

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

function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Le contenu du tooltip est rendu en HTML (`escape: false`) pour les retours à
// la ligne : on échappe donc chaque valeur dynamique (ex. description libre).
function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function eventTooltip(source: VisibleEvent) {
  const lines = [
    `<strong>${escapeHtml(source.title)}</strong>`,
    source.location && escapeHtml(source.location),
    `${formatTime(source.startAt)} – ${formatTime(source.endAt)}`,
    source.description && escapeHtml(source.description),
    escapeHtml(`${source.organizer.firstName} ${source.organizer.lastName}`),
  ].filter(Boolean)

  return { escape: false, value: lines.join('<br>') }
}

function navigateToCreate() {
  datePopover.value?.hide()
  emit('create', clickedDate.value ?? undefined)
}

const calendar = computed(() => ({
  dateClick: (info: DateClickArg) => {
    clickedDate.value = info.date
    datePopover.value?.show(info.jsEvent, info.jsEvent.target as HTMLElement)
  },
  datesSet: (arg: DatesSetArg) => {
    emit('rangeChange', { from: arg.start, to: arg.end })
  },
  editable: true,
  eventClick: (info: EventClickArg) => {
    selectedEvent.value = info.event.extendedProps.source as VisibleEvent
    clickBox.value?.show(info.jsEvent, info.el)
  },
  eventDrop: (info: EventDropArg) => {
    updateEvent({
      endAt: info.event.end ?? undefined,
      // L'id FullCalendar (cuid) est brandé en `EventId` par parse, sans cast.
      id: eventIdSchema.parse(info.event.id),
      startAt: info.event.start ?? undefined,
    })
  },
  events: events.map((event) => ({
    backgroundColor: getDepartmentColor(event.departments[0]?.code),
    end: event.endAt,
    extendedProps: { source: event },
    id: event.id,
    start: event.startAt,
    title: event.title,
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
        right: 'listDay,listWeek,listMonth',
      },
  height: 'auto',
  initialView: isMobile ? 'listDay' : 'listWeek',
  locale: frLocale,
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
  views: {
    listDay: { buttonText: 'Jour' },
    listMonth: { buttonText: 'Mois' },
    listWeek: { buttonText: 'Semaine' },
  },
  scrollTime: '08:00:00',
  selectable: true,
  slotEventOverlap: false,
  slotMaxTime: '20:00:00',
  slotMinTime: '07:00:00',
}))
</script>
