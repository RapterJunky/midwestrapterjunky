/*
  Warnings:

  - You are about to drop the `Likes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Likes`;

-- CreateTable
CREATE TABLE `Like` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('Comment', 'Post') NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `commentId` VARCHAR(191) NULL,
    `threadPostId` VARCHAR(191) NULL,

    INDEX `Like_userId_idx`(`userId`),
    INDEX `Like_commentId_idx`(`commentId`),
    INDEX `Like_threadPostId_idx`(`threadPostId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
