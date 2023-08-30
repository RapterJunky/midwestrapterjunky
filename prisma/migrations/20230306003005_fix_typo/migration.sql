/*
  Warnings:

  - You are about to drop the column `theadId` on the `ThreadPost` table. All the data in the column will be lost.
  - You are about to drop the `Thead` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `threadId` to the `ThreadPost` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ThreadPost` DROP FOREIGN KEY `ThreadPost_theadId_fkey`;

-- AlterTable
ALTER TABLE `ThreadPost` DROP COLUMN `theadId`,
    ADD COLUMN `threadId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `Thead`;

-- CreateTable
CREATE TABLE `Thread` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Thread_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ThreadPost` ADD CONSTRAINT `ThreadPost_threadId_fkey` FOREIGN KEY (`threadId`) REFERENCES `Thread`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
