/*
  Warnings:

  - You are about to drop the column `department_id` on the `Event` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_department_id_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "department_id";

-- CreateTable
CREATE TABLE "_EventDepartments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventDepartments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EventDepartments_B_index" ON "_EventDepartments"("B");

-- AddForeignKey
ALTER TABLE "_EventDepartments" ADD CONSTRAINT "_EventDepartments_A_fkey" FOREIGN KEY ("A") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventDepartments" ADD CONSTRAINT "_EventDepartments_B_fkey" FOREIGN KEY ("B") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
