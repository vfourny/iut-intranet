import { createEventProcedure } from '@/modules/event/procedures/create-event.procedure'
import { deleteEventProcedure } from '@/modules/event/procedures/delete-event.procedure'
import { listVisibleEventsProcedure } from '@/modules/event/procedures/list-visible-events.procedure'
import { updateEventProcedure } from '@/modules/event/procedures/update-event.procedure'
import { router } from '@/trpc'

export const eventRouter = router({
  create: createEventProcedure,
  delete: deleteEventProcedure,
  listVisible: listVisibleEventsProcedure,
  update: updateEventProcedure,
})
