/*
  Warnings:

  - You are about to drop the column `ban_expires` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `ban_reason` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "session" ADD COLUMN     "active_organization_id" TEXT;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "ban_expires",
DROP COLUMN "ban_reason",
ADD COLUMN     "banExpires" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT;
