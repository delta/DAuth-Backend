/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `ResourceOwner` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `department` to the `ResourceOwner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `ResourceOwner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `ResourceOwner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ResourceOwner` ADD COLUMN `department` VARCHAR(191) NOT NULL,
    ADD COLUMN `phoneNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `year` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ResourceOwner.phoneNumber_unique` ON `ResourceOwner`(`phoneNumber`);
