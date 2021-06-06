-- CreateTable
CREATE TABLE `authorisedApps` (
    `clientId` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`clientId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `authorisedApps` ADD FOREIGN KEY (`clientId`) REFERENCES `Client`(`clientId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `authorisedApps` ADD FOREIGN KEY (`userId`) REFERENCES `ResourceOwner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
