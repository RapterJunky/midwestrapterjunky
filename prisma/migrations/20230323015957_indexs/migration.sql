-- CreateIndex
CREATE INDEX `Report_commentId_idx` ON `Report`(`commentId`);

-- CreateIndex
CREATE INDEX `Report_postId_idx` ON `Report`(`postId`);

-- RenameIndex
ALTER TABLE `Account` RENAME INDEX `Account_userId_fkey` TO `Account_userId_idx`;

-- RenameIndex
ALTER TABLE `Comment` RENAME INDEX `Comment_ownerId_fkey` TO `Comment_ownerId_idx`;

-- RenameIndex
ALTER TABLE `Comment` RENAME INDEX `Comment_threadPostId_fkey` TO `Comment_threadPostId_idx`;

-- RenameIndex
ALTER TABLE `Report` RENAME INDEX `Report_ownerId_fkey` TO `Report_ownerId_idx`;

-- RenameIndex
ALTER TABLE `Session` RENAME INDEX `Session_userId_fkey` TO `Session_userId_idx`;

-- RenameIndex
ALTER TABLE `ThreadPost` RENAME INDEX `ThreadPost_ownerId_fkey` TO `ThreadPost_ownerId_idx`;

-- RenameIndex
ALTER TABLE `ThreadPost` RENAME INDEX `ThreadPost_threadId_fkey` TO `ThreadPost_threadId_idx`;
