/*
  Warnings:

  - Added the required column `isDirty` to the `Cache` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Cache` ADD COLUMN `isDirty` BOOLEAN NOT NULL;
