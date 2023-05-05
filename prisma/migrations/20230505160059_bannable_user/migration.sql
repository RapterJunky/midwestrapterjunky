/*
  Warnings:

  - You are about to drop the column `created` on the `ThreadPost` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ThreadPost` DROP COLUMN `created`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `notifyOwner` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `banned` BOOLEAN NOT NULL DEFAULT false;
