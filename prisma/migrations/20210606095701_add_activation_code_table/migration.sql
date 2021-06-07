/*
  Warnings:

  - You are about to drop the column `activationCode` on the `ResourceOwner` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `ResourceOwner.activationCode_unique` ON `ResourceOwner`;

-- AlterTable
ALTER TABLE `ResourceOwner` DROP COLUMN `activationCode`;

-- CreateTable
CREATE TABLE `ActivationCode` (
    `activationCode` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expireAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ActivationCode.activationCode_unique`(`activationCode`),
    UNIQUE INDEX `ActivationCode_userId_unique`(`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ActivationCode` ADD FOREIGN KEY (`userId`) REFERENCES `ResourceOwner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
