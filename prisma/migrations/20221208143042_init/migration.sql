-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "UserOnOrg" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;
