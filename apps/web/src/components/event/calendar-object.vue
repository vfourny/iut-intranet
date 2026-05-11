<script lang="ts" setup>
import type { Event } from '@iut-intranet/db'
import {
  createCalendar,
  createViewDay,
  createViewWeek,
  createViewWeekAgenda,
} from '@schedule-x/calendar'
import { ScheduleXCalendar } from '@schedule-x/vue'
import { Temporal } from 'temporal-polyfill'

const props = defineProps<{
  events: Event[]
}>()

const calendar = createCalendar({
  events: props.events.map((event) => ({
    description: event.departmentId,
    end: new Date(event.endAt),
    id: event.id,
    location: event.location,
    start: new Date(event.startAt),
    title: event.titre,
  })),
  isResponsive: true,
  selectedDate: Temporal.Now.plainDateISO().toString(),
  views: [createViewDay(), createViewWeekAgenda(), createViewWeek()],
})
</script>

<template>
  <ScheduleXCalendar :calendar-app="calendar" />
</template>
