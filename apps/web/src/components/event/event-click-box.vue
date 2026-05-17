<template>
  <PrimePopover ref="popover">
    <div class="min-w-52 max-w-80">
      <h3 class="font-semibold text-gray-800 mb-2">{{ event?.titre }}</h3>
      <p class="text-sm text-gray-600">{{ event?.location }}</p>
      <p class="text-sm text-gray-600">
        {{ formatTime(event?.startAt) }} – {{ formatTime(event?.endAt) }}
      </p>
      <p class="text-sm text-gray-600">{{ event?.description }}</p>
      <p class="text-sm text-gray-600">{{ organizerName }}</p>
    </div>
  </PrimePopover>
</template>

<script lang="ts" setup>
import type { TrpcOutput } from '@iut-intranet/trpc'
import PrimePopover from 'primevue/popover'
import { computed, ref } from 'vue'

type VisibleEvent = TrpcOutput['event']['listVisibleEventsForUser'][number]

const { event } = defineProps<{ event: null | VisibleEvent }>()

const popover = ref<InstanceType<typeof PrimePopover> | null>(null)

const organizerName = computed(() =>
  event ? `${event.organizer.firstName} ${event.organizer.lastName}` : '',
)

function formatTime(date: Date | null | string | undefined) {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

defineExpose({
  hide: () => popover.value?.hide(),
  show: (domEvent: Event, target?: HTMLElement) =>
    popover.value?.show(domEvent, target),
})
</script>
