<template>
  <EventFormulaire
    v-if="ready"
    :department-code="event?.department?.code"
    :description="event?.description"
    :end-at="endAt"
    :event-id="eventId"
    :is-public="event?.isPublic"
    :location="event?.location"
    :start-at="startAt"
    :title="event?.title"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useGetEventById } from '@/api/event.api'
import EventFormulaire from '@/components/event/event-creation-form.vue'

const route = useRoute()

const eventId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? id : undefined
})

const { data: event } = useGetEventById(eventId.value)

const startAt = computed(() => {
  if (event.value) return new Date(event.value.startAt)
  const raw = route.query.startAt
  if (!raw || typeof raw !== 'string') return undefined
  const date = new Date(raw)
  return isNaN(date.getTime()) ? undefined : date
})

const endAt = computed(() => {
  if (event.value) return new Date(event.value.endAt)
  return undefined
})

const ready = computed(() => {
  if (eventId.value) return !!event.value
  return true
})
</script>
