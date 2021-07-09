/*
  Warnings:

  - Added the required column `description` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `homePageUrl` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Client` ADD COLUMN `description` VARCHAR(191) NOT NULL,
    ADD COLUMN `homePageUrl` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `department` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Department.department_unique`(`department`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
