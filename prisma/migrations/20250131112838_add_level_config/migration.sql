/*
  Warnings:

  - You are about to drop the column `perks` on the `level_config` table. All the data in the column will be lost.
  - Made the column `created_at` on table `level_config` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `level_config` DROP COLUMN `perks`,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);
