/*
  Warnings:

  - You are about to alter the column `banned` on the `User` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `UnsignedTinyInt`.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `banned` TINYINT UNSIGNED NOT NULL DEFAULT 0;
