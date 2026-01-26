-- CreateEnum
CREATE TYPE "UserClasses" AS ENUM ('NORMAL', 'ADMIN', 'DEMO');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "class" "UserClasses" NOT NULL DEFAULT 'NORMAL';
