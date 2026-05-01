/*
  Warnings:

  - Added the required column `department_id` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Site" AS ENUM ('BOULOGNE', 'CALAIS', 'DUNKERQUE', 'SAINT_OMER');

-- CreateEnum
CREATE TYPE "DepartmentCode" AS ENUM ('GACO', 'GEA', 'TC', 'INFO', 'GEII', 'GIM', 'GB', 'GTE');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'EDITOR';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "department_id" TEXT NOT NULL,
ADD COLUMN     "job_title" TEXT,
ADD COLUMN     "manager_id" TEXT,
ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "department" (
    "id" TEXT NOT NULL,
    "code" "DepartmentCode" NOT NULL,
    "label" TEXT NOT NULL,
    "site" "Site" NOT NULL,

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "department_code_key" ON "department"("code");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
