/*
  Warnings:

  - Added the required column `description` to the `Thread` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Thread` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Thread` ADD COLUMN `description` VARCHAR(191) NOT NULL,
    ADD COLUMN `image` VARCHAR(191) NOT NULL,
    ADD COLUMN `tags` JSON NULL;

-- AlterTable
ALTER TABLE `ThreadPost` ADD COLUMN `locked` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `pinned` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `tags` JSON NULL;
