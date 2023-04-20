-- AlterTable
ALTER TABLE `Comment` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `ThreadPost` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `Likes` (
    `userId` VARCHAR(191) NOT NULL,
    `commentId` VARCHAR(191) NOT NULL,
    `threadPostId` VARCHAR(191) NOT NULL,

    INDEX `Likes_userId_idx`(`userId`),
    INDEX `Likes_commentId_idx`(`commentId`),
    INDEX `Likes_threadPostId_idx`(`threadPostId`),
    PRIMARY KEY (`userId`, `commentId`, `threadPostId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
