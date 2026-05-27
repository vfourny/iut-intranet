-- DropForeignKey
ALTER TABLE "EventInvitation" DROP CONSTRAINT "EventInvitation_event_id_fkey";

-- AddForeignKey
ALTER TABLE "EventInvitation" ADD CONSTRAINT "EventInvitation_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
