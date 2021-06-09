/*
  Warnings:

  - You are about to drop the column `activationCode` on the `ResourceOwner` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `ResourceOwner` table. All the data in the column will be lost.
  - You are about to drop the column `isActivated` on the `ResourceOwner` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[emailId]` on the table `ResourceOwner` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `department` to the `ResourceOwner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emailId` to the `ResourceOwner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `ResourceOwner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `ResourceOwner` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `ResourceOwner.activationCode_unique` ON `ResourceOwner`;

-- DropIndex
DROP INDEX `ResourceOwner.email_unique` ON `ResourceOwner`;

-- AlterTable
ALTER TABLE `ResourceOwner` DROP COLUMN `activationCode`,
    DROP COLUMN `email`,
    DROP COLUMN `isActivated`,
    ADD COLUMN `department` VARCHAR(191) NOT NULL,
    ADD COLUMN `emailId` INTEGER NOT NULL,
    ADD COLUMN `phoneNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `year` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Email` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `activationCode` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `isActivated` BOOLEAN NOT NULL DEFAULT false,
    `expireAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Email.activationCode_unique`(`activationCode`),
    UNIQUE INDEX `Email.email_unique`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `authorisedApps` (
    `clientId` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`clientId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `ResourceOwner_emailId_unique` ON `ResourceOwner`(`emailId`);

-- AddForeignKey
ALTER TABLE `ResourceOwner` ADD FOREIGN KEY (`emailId`) REFERENCES `Email`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `authorisedApps` ADD FOREIGN KEY (`clientId`) REFERENCES `Client`(`clientId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `authorisedApps` ADD FOREIGN KEY (`userId`) REFERENCES `ResourceOwner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
