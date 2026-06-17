/*
  Warnings:

  - The values [GTE] on the enum `DepartmentCode` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `department_id` on the `user` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DepartmentCode_new" AS ENUM ('GACO', 'GEA', 'TC', 'INFO', 'GEII', 'GIM', 'GB', 'MT2E', 'Administration');
ALTER TABLE "department" ALTER COLUMN "code" TYPE "DepartmentCode_new" USING ("code"::text::"DepartmentCode_new");
ALTER TYPE "DepartmentCode" RENAME TO "DepartmentCode_old";
ALTER TYPE "DepartmentCode_new" RENAME TO "DepartmentCode";
DROP TYPE "public"."DepartmentCode_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_department_id_fkey";

-- DropIndex
DROP INDEX "user_department_id_idx";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "department_id";

-- CreateTable
CREATE TABLE "user_department" (
    "user_id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,

    CONSTRAINT "user_department_pkey" PRIMARY KEY ("user_id","department_id")
);

-- AddForeignKey
ALTER TABLE "user_department" ADD CONSTRAINT "user_department_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_department" ADD CONSTRAINT "user_department_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
