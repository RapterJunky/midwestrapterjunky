-- AlterTable
ALTER TABLE `ThreadPost` ADD COLUMN `content` JSON NULL,
    MODIFY `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
