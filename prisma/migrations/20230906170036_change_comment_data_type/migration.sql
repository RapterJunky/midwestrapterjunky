/*
  Warnings:

  - Made the column `content` on table `ThreadPost` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Comment` MODIFY `content` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `ThreadPost` MODIFY `content` VARCHAR(191) NOT NULL;
