<script setup="ts">
import { createCalendar } from '@schedule-x/calendar'
import { ScheduleXCalendar } from '@schedule-x/vue'
import { Temporal } from 'temporal-polyfill'

const calendar = createCalendar({
  selectedDate: Temporal.PlainDate.from(DatetimeFormat),
})
</script>

<template>
  <ScheduleXCalendar :calendar-app="calendar" />
</template>
