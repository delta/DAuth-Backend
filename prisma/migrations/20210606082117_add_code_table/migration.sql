/*
  Warnings:

  - The primary key for the `ResourceOwner` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `ResourceOwner` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Client` DROP FOREIGN KEY `Client_ibfk_1`;

-- AlterTable
ALTER TABLE `ResourceOwner` DROP PRIMARY KEY,
    DROP COLUMN `userId`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `Code` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `scope` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191),
    `redirectUri` VARCHAR(191) NOT NULL,
    `nonce` VARCHAR(191),
    `userId` INTEGER NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Code.code_unique`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Client` ADD FOREIGN KEY (`userId`) REFERENCES `ResourceOwner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Code` ADD FOREIGN KEY (`userId`) REFERENCES `ResourceOwner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Code` ADD FOREIGN KEY (`clientId`) REFERENCES `Client`(`clientId`) ON DELETE CASCADE ON UPDATE CASCADE;
