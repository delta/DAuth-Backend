-- AlterTable
ALTER TABLE `ResourceOwner` ADD COLUMN `gender` ENUM('MALE', 'FEMALE') NOT NULL DEFAULT 'MALE';
