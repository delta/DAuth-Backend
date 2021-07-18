/*
  Warnings:

  - You are about to drop the column `department` on the `ResourceOwner` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `ResourceOwner` table. All the data in the column will be lost.
  - You are about to drop the `Department` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `ResourceOwner` DROP COLUMN `department`,
    DROP COLUMN `year`;

-- DropTable
DROP TABLE `Department`;
