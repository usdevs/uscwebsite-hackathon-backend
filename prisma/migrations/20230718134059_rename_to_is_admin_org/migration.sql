/*
  Warnings:

  - The values [Inactive] on the enum `IGCategory` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `verified` on the `Organisation` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "IGCategory_new" AS ENUM ('Sports', 'SocioCultural', 'Others', 'Guips');
ALTER TABLE "Organisation" ALTER COLUMN "category" TYPE "IGCategory_new" USING ("category"::text::"IGCategory_new");
ALTER TYPE "IGCategory" RENAME TO "IGCategory_old";
ALTER TYPE "IGCategory_new" RENAME TO "IGCategory";
DROP TYPE "IGCategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "Organisation" DROP COLUMN "verified",
ADD COLUMN     "isAdminOrg" BOOLEAN NOT NULL DEFAULT false;
