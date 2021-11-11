-- CreateTable
CREATE TABLE `Codechallenge` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codeChallenge` VARCHAR(191) NOT NULL,
    `codeChallengeMethod` VARCHAR(191) NOT NULL,
    `codeId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expireAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Codechallenge.codeChallenge_unique`(`codeChallenge`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Codechallenge` ADD FOREIGN KEY (`codeId`) REFERENCES `Code`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
