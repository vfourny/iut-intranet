import { getEventByIdProcedure } from '@/modules/event/procedure/get-event-by-id.procedure'
import { listEventProcedure } from '@/modules/event/procedure/list-event.procedure'
import { router } from '@/trpc'

export const eventRouter = router({
  getEventByIdProcedure,
  listEventProcedure,
})
