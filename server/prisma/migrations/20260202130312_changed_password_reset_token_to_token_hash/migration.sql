/*
  Warnings:

  - You are about to drop the column `token` on the `password_reset` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenHash]` on the table `password_reset` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tokenHash` to the `password_reset` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "password_reset_token_key";

-- AlterTable
ALTER TABLE "password_reset" DROP COLUMN "token",
ADD COLUMN     "tokenHash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokenHash_key" ON "password_reset"("tokenHash");
