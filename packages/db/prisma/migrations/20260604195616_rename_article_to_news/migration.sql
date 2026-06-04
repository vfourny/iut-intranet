/*
  Warnings:

  - You are about to drop the `_ArticleToDepartment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `article` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "NewsStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED');

-- DropForeignKey
ALTER TABLE "_ArticleToDepartment" DROP CONSTRAINT "_ArticleToDepartment_A_fkey";

-- DropForeignKey
ALTER TABLE "_ArticleToDepartment" DROP CONSTRAINT "_ArticleToDepartment_B_fkey";

-- DropForeignKey
ALTER TABLE "article" DROP CONSTRAINT "article_author_id_fkey";

-- DropTable
DROP TABLE "_ArticleToDepartment";

-- DropTable
DROP TABLE "article";

-- DropEnum
DROP TYPE "ArticleStatus";

-- CreateTable
CREATE TABLE "news" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "excerpt" TEXT,
    "coverUrl" TEXT,
    "author_id" TEXT NOT NULL,
    "status" "NewsStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DepartmentToNews" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DepartmentToNews_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DepartmentToNews_B_index" ON "_DepartmentToNews"("B");

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepartmentToNews" ADD CONSTRAINT "_DepartmentToNews_A_fkey" FOREIGN KEY ("A") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepartmentToNews" ADD CONSTRAINT "_DepartmentToNews_B_fkey" FOREIGN KEY ("B") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;
