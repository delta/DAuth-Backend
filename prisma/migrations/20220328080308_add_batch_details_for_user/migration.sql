-- DropForeignKey
ALTER TABLE `AuthorisedApps` DROP FOREIGN KEY `AuthorisedApps_ibfk_1`;

-- DropForeignKey
ALTER TABLE `AuthorisedApps` DROP FOREIGN KEY `AuthorisedApps_ibfk_2`;

-- DropForeignKey
ALTER TABLE `Client` DROP FOREIGN KEY `Client_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Code` DROP FOREIGN KEY `Code_ibfk_2`;

-- DropForeignKey
ALTER TABLE `Code` DROP FOREIGN KEY `Code_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Codechallenge` DROP FOREIGN KEY `Codechallenge_ibfk_1`;

-- DropForeignKey
ALTER TABLE `ResourceOwner` DROP FOREIGN KEY `ResourceOwner_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Token` DROP FOREIGN KEY `Token_ibfk_2`;

-- DropForeignKey
ALTER TABLE `Token` DROP FOREIGN KEY `Token_ibfk_1`;

-- AlterTable
ALTER TABLE `ResourceOwner` ADD COLUMN `batch` VARCHAR(191) NOT NULL DEFAULT 'NULL';

-- CreateTable
CREATE TABLE `Batch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `batch` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Batch_batch_key`(`batch`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ResourceOwner` ADD CONSTRAINT `ResourceOwner_emailId_fkey` FOREIGN KEY (`emailId`) REFERENCES `Email`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `ResourceOwner`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Code` ADD CONSTRAINT `Code_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `ResourceOwner`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Code` ADD CONSTRAINT `Code_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Token` ADD CONSTRAINT `Token_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `ResourceOwner`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Token` ADD CONSTRAINT `Token_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuthorisedApps` ADD CONSTRAINT `AuthorisedApps_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `ResourceOwner`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuthorisedApps` ADD CONSTRAINT `AuthorisedApps_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Codechallenge` ADD CONSTRAINT `Codechallenge_codeId_fkey` FOREIGN KEY (`codeId`) REFERENCES `Code`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RedefineIndex
CREATE UNIQUE INDEX `Client_clientId_key` ON `Client`(`clientId`);
DROP INDEX `Client.clientId_unique` ON `Client`;

-- RedefineIndex
CREATE UNIQUE INDEX `Code_code_key` ON `Code`(`code`);
DROP INDEX `Code.code_unique` ON `Code`;

-- RedefineIndex
CREATE UNIQUE INDEX `Codechallenge_codeChallenge_key` ON `Codechallenge`(`codeChallenge`);
DROP INDEX `Codechallenge.codeChallenge_unique` ON `Codechallenge`;

-- RedefineIndex
CREATE UNIQUE INDEX `Codechallenge_codeId_key` ON `Codechallenge`(`codeId`);
DROP INDEX `Codechallenge_codeId_unique` ON `Codechallenge`;

-- RedefineIndex
CREATE UNIQUE INDEX `Email_activationCode_key` ON `Email`(`activationCode`);
DROP INDEX `Email.activationCode_unique` ON `Email`;

-- RedefineIndex
CREATE UNIQUE INDEX `Email_email_key` ON `Email`(`email`);
DROP INDEX `Email.email_unique` ON `Email`;

-- RedefineIndex
CREATE UNIQUE INDEX `ResourceOwner_emailId_key` ON `ResourceOwner`(`emailId`);
DROP INDEX `ResourceOwner_emailId_unique` ON `ResourceOwner`;

-- RedefineIndex
CREATE UNIQUE INDEX `Token_accessToken_key` ON `Token`(`accessToken`);
DROP INDEX `Token.accessToken_unique` ON `Token`;
