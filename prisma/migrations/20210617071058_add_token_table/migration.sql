/*
  Warnings:

  - The primary key for the `Client` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `clientId` on the `Code` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to drop the `authorisedApps` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[clientId]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expireAt` to the `Code` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Code` DROP FOREIGN KEY `Code_ibfk_2`;

-- DropForeignKey
ALTER TABLE `authorisedApps` DROP FOREIGN KEY `authorisedApps_ibfk_1`;

-- DropForeignKey
ALTER TABLE `authorisedApps` DROP FOREIGN KEY `authorisedApps_ibfk_2`;

-- AlterTable
ALTER TABLE `Client` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Code` ADD COLUMN `expireAt` DATETIME(3) NOT NULL,
    MODIFY `clientId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `authorisedApps`;

-- CreateTable
CREATE TABLE `Token` (
    `accessToken` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expireAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,
    `clientId` INTEGER NOT NULL,

    UNIQUE INDEX `Token.accessToken_unique`(`accessToken`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuthorisedApps` (
    `clientId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`clientId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Client.clientId_unique` ON `Client`(`clientId`);

-- AddForeignKey
ALTER TABLE `Code` ADD FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Token` ADD FOREIGN KEY (`userId`) REFERENCES `ResourceOwner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Token` ADD FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuthorisedApps` ADD FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuthorisedApps` ADD FOREIGN KEY (`userId`) REFERENCES `ResourceOwner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
