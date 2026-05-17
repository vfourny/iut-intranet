<template>
  <div>
    <CalendarObject :events="events ?? []" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useSession } from '@/api/auth.api'
import { useVisibleEvents } from '@/api/event.api'
import CalendarObject from '@/components/event/calendar-object.vue'

const { currentSession } = useSession()
const userId = computed(() => currentSession.value?.user.id ?? '')
const { data: events } = useVisibleEvents(userId.value)
</script>
