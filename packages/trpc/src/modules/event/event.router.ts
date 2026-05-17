import { getEventByIdProcedure } from '@/modules/event/procedure/get-event-by-id.procedure'
import { listEventsProcedure } from '@/modules/event/procedure/list-events.procedure'
import { listVisibleEventsForUserProcedure } from '@/modules/event/procedure/list-visible-events-for-user.procedure'
import { router } from '@/trpc'

export const eventRouter = router({
  getById: getEventByIdProcedure,
  list: listEventsProcedure,
  listVisibleEventsForUser: listVisibleEventsForUserProcedure,
})
