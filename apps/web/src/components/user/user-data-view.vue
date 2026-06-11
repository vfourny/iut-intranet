<template>
  <PrimeDataView
    layout="grid"
    :pt="{
      root: { class: 'bg-transparent border-0' },
      content: { class: 'bg-transparent' },
    }"
    :value="users"
  >
    <template #grid>
      <div class="grid grid-cols-12 gap-4">
        <div
          v-for="user in users"
          :key="user.id"
          class="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-3 p-2"
        >
          <div
            class="h-full p-6 border border-surface-200 bg-surface-0 rounded flex flex-col cursor-pointer hover:shadow-lg"
            @click="
              router.push({ name: RouteNames.home, params: { id: user.id } })
            "
          >
            <div
              class="aspect-square w-full overflow-hidden rounded bg-surface-50"
            >
              <img
                v-if="user.image"
                :alt="`${user.firstName} ${user.lastName}`"
                class="h-full w-full object-cover"
                :src="user.image"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center bg-surface-200 text-4xl font-medium text-surface-700"
              >
                {{ getInitials(user) }}
              </div>
            </div>
            <div class="pt-6">
              <div class="flex flex-row justify-between items-start gap-2">
                <div>
                  <DepartmentTag
                    v-if="user.department?.code"
                    :code="user.department.code"
                  />
                  <div class="text-lg font-medium mt-1">
                    {{ user.firstName }} {{ user.lastName }}
                  </div>
                </div>
              </div>
              <div class="flex flex-col gap-2 mt-4">
                <span class="text-sm text-surface-600">
                  {{ user.jobTitle }}
                </span>
                <span
                  v-if="user.email"
                  class="flex items-center gap-2 text-sm text-surface-600"
                >
                  <i class="pi pi-envelope" />
                  {{ user.email }}
                </span>
                <span
                  v-if="user.phone"
                  class="flex items-center gap-2 text-sm text-surface-600"
                >
                  <i class="pi pi-phone" />
                  {{ user.phone }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </PrimeDataView>
  <div ref="sentinelRef" class="h-8" />
  <div v-if="loading" class="flex justify-center py-4 text-surface-500">
    <i class="pi pi-spinner pi-spin text-2xl" />
  </div>
</template>

<script setup lang="ts">
import type { TrpcOutput } from '@iut-intranet/trpc'
import PrimeDataView from 'primevue/dataview'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import DepartmentTag from '@/components/department/department-tag.vue'
import { RouteNames, router } from '@/router'

type User = TrpcOutput['user']['list']['items'][number]

interface UserDataViewProps {
  hasNextPage: boolean
  loading: boolean
  users: User[]
}

const props = defineProps<UserDataViewProps>()
const emit = defineEmits<{ 'load-more': [] }>()

const getInitials = (user: User) => `${user.firstName[0]}${user.lastName[0]}`

const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const handleIntersect = (entries: IntersectionObserverEntry[]) => {
  if (entries[0].isIntersecting && props.hasNextPage && !props.loading) {
    emit('load-more')
  }
}

onMounted(() => {
  observer = new IntersectionObserver(handleIntersect, { rootMargin: '200px' })
  if (sentinelRef.value) observer.observe(sentinelRef.value)
})

onBeforeUnmount(() => observer?.disconnect())

watch(
  () => props.hasNextPage,
  (hasNext) => {
    if (hasNext && sentinelRef.value && observer) {
      observer.observe(sentinelRef.value)
    }
  },
)
</script>
