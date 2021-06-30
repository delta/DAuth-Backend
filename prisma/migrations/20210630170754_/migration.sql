/*
  Warnings:

  - Added the required column `description` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `homePageUrl` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Client` ADD COLUMN `description` VARCHAR(191) NOT NULL,
    ADD COLUMN `homePageUrl` VARCHAR(191) NOT NULL;
