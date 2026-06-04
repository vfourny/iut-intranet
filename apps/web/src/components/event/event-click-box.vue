<template>
  <PrimePopover ref="popover">
    <div class="min-w-52 max-w-80">
      <h3 class="font-semibold text-gray-800 mb-2">{{ event?.title }}</h3>
      <p class="text-sm text-gray-600">{{ event?.location }}</p>
      <p class="text-sm text-gray-600">
        {{ formatTime(event?.startAt) }} – {{ formatTime(event?.endAt) }}
      </p>
      <p class="text-sm text-gray-600">{{ event?.description }}</p>
      <p class="text-sm text-gray-600">{{ organizerName }}</p>
      <PrimeButton
        v-if="canEdit"
        class="mt-3 w-full"
        icon="pi pi-pencil"
        :label="t('event.updateEvent')"
        size="small"
        @click="navigateToUpdate"
      />
      <PrimeButton
        v-if="canEdit"
        class="mt-2 w-full"
        icon="pi pi-trash"
        :label="t('event.deleteEvent')"
        severity="danger"
        size="small"
        @click="confirmDelete"
      />
      <PrimeConfirmDialog />
    </div>
  </PrimePopover>
  <Toast />
</template>

<script lang="ts" setup>
import { isAdminRole } from '@iut-intranet/helpers/utils/role'
import type { TrpcOutput } from '@iut-intranet/trpc'
import PrimeButton from 'primevue/button'
import PrimeConfirmDialog from 'primevue/confirmdialog'
import PrimePopover from 'primevue/popover'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useSession } from '@/api/auth.api'
import { useDeleteEvent } from '@/api/event.api'
import { useI18n } from '@/composables/use-i18n'
import { RouteNames } from '@/router'

type VisibleEvent = TrpcOutput['event']['listVisible'][number]

const { event } = defineProps<{ event: null | VisibleEvent }>()

const router = useRouter()
const { t } = useI18n()
const { currentSession } = useSession()
const popover = ref<InstanceType<typeof PrimePopover> | null>(null)
const toast = useToast()

const confirm = useConfirm()
const { mutateAsync: deleteEvent } = useDeleteEvent()

const organizerName = computed(() =>
  event ? `${event.organizer.firstName} ${event.organizer.lastName}` : '',
)

const canEdit = computed(
  () =>
    event &&
    currentSession.value &&
    (event.organizerId === currentSession.value.user.id ||
      isAdminRole(currentSession.value.user.role)),
)

function confirmDelete() {
  confirm.require({
    accept: async () => {
      if (!event) return
      popover.value?.hide()
      try {
        await deleteEvent({ eventId: event.id })
        toast.add({
          detail: t('event.toast.deleted'),
          life: 3000,
          severity: 'success',
          summary: t('layout.success'),
        })
      } catch {
        toast.add({
          detail: t('event.toast.error'),
          life: 3000,
          severity: 'error',
          summary: t('layout.error'),
        })
      }
    },
    acceptLabel: t('event.deleteConfirm.confirm'),
    header: t('event.deleteConfirm.header'),
    message: t('event.deleteConfirm.message'),
    rejectLabel: t('event.deleteConfirm.cancel'),
  })
}

function formatTime(date: Date | null | string | undefined) {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function navigateToUpdate() {
  if (!event) return
  popover.value?.hide()
  router.push({ name: RouteNames.event.update, params: { id: event.id } })
}

defineExpose({
  hide: () => popover.value?.hide(),
  show: (domEvent: Event, target?: HTMLElement) =>
    popover.value?.show(domEvent, target),
})
</script>
