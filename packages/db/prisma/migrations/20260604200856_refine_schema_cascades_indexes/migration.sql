/*
  Warnings:

  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventInvitation` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EventInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_department_id_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_user_id_fkey";

-- DropForeignKey
ALTER TABLE "EventInvitation" DROP CONSTRAINT "EventInvitation_event_id_fkey";

-- DropForeignKey
ALTER TABLE "EventInvitation" DROP CONSTRAINT "EventInvitation_user_id_fkey";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "verification" ALTER COLUMN "updated_at" DROP DEFAULT;

-- DropTable
DROP TABLE "Event";

-- DropTable
DROP TABLE "EventInvitation";

-- DropEnum
DROP TYPE "Status";

-- CreateTable
CREATE TABLE "event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_invitation" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "EventInvitationStatus" NOT NULL,

    CONSTRAINT "event_invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_user_id_idx" ON "event"("user_id");

-- CreateIndex
CREATE INDEX "event_department_id_idx" ON "event"("department_id");

-- CreateIndex
CREATE INDEX "event_invitation_user_id_idx" ON "event_invitation"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_invitation_event_id_user_id_key" ON "event_invitation"("event_id", "user_id");

-- CreateIndex
CREATE INDEX "account_user_id_idx" ON "account"("user_id");

-- CreateIndex
CREATE INDEX "news_author_id_idx" ON "news"("author_id");

-- CreateIndex
CREATE INDEX "session_user_id_idx" ON "session"("user_id");

-- CreateIndex
CREATE INDEX "user_department_id_idx" ON "user"("department_id");

-- CreateIndex
CREATE INDEX "user_manager_id_idx" ON "user"("manager_id");

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_invitation" ADD CONSTRAINT "event_invitation_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_invitation" ADD CONSTRAINT "event_invitation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
