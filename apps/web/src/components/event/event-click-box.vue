<script lang="ts" setup>
defineProps<{
  description: string
  end: Date
  location: string
  organizer: string
  start: Date
  title: string
  x: number
  y: number
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div
    class="bg-white border border-gray-200 rounded-xl shadow-lg p-4 min-w-52"
    :style="{
      left: x + 'px',
      position: 'absolute',
      top: y + 'px',
      transform: 'translateY(-100%)',
      zIndex: 1000,
    }"
    @click.stop
  >
    <button
      class="float-right text-gray-400 hover:text-gray-600 cursor-pointer"
      @click="emit('close')"
    >
      <i class="pi pi-times" />
    </button>
    <h3 class="font-semibold text-gray-800 mb-2">{{ title }}</h3>
    <p class="text-sm text-gray-600">{{ location }}</p>
    <p class="text-sm text-gray-600">
      {{ start.toLocaleTimeString() }} – {{ end.toLocaleTimeString() }}
    </p>
    <p class="text-sm text-gray-600">{{ description }}</p>
    <p class="text-sm text-gray-600">{{ organizer }}</p>
  </div>
</template>
