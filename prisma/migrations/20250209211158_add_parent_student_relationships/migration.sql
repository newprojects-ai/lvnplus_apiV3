/*
  Warnings:

  - The primary key for the `student_guardians` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `relationship_id` on the `student_guardians` table. All the data in the column will be lost.
  - You are about to drop the column `relationship_type` on the `student_guardians` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `student_guardians` table. All the data in the column will be lost.
  - Added the required column `id` to the `student_guardians` table without a default value. This is not possible if the table is not empty.
  - Added the required column `relationship` to the `student_guardians` table without a default value. This is not possible if the table is not empty.
  - Made the column `created_at` on table `student_guardians` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `student_guardians` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `unique_guardian_student` ON `student_guardians`;

-- AlterTable
ALTER TABLE `student_guardians` DROP PRIMARY KEY,
    DROP COLUMN `relationship_id`,
    DROP COLUMN `relationship_type`,
    DROP COLUMN `status`,
    ADD COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD COLUMN `relationship` VARCHAR(191) NOT NULL,
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updated_at` DATETIME(3) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `test_plans` ADD COLUMN `planned_by_type` VARCHAR(191) NULL,
    ADD COLUMN `student_guardian_id` BIGINT NULL,
    ADD COLUMN `tutor_student_id` BIGINT NULL;

-- CreateTable
CREATE TABLE `tutor_students` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tutor_id` BIGINT NOT NULL,
    `student_id` BIGINT NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `tutor_students_tutor_id_idx`(`tutor_id`),
    INDEX `tutor_students_student_id_idx`(`student_id`),
    UNIQUE INDEX `tutor_students_tutor_id_student_id_key`(`tutor_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `test_plans_student_guardian_id_idx` ON `test_plans`(`student_guardian_id`);

-- CreateIndex
CREATE INDEX `test_plans_tutor_student_id_idx` ON `test_plans`(`tutor_student_id`);

-- AddForeignKey
ALTER TABLE `test_plans` ADD CONSTRAINT `test_plans_student_guardian_id_fkey` FOREIGN KEY (`student_guardian_id`) REFERENCES `student_guardians`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_plans` ADD CONSTRAINT `test_plans_tutor_student_id_fkey` FOREIGN KEY (`tutor_student_id`) REFERENCES `tutor_students`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tutor_students` ADD CONSTRAINT `tutor_students_tutor_id_fkey` FOREIGN KEY (`tutor_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tutor_students` ADD CONSTRAINT `tutor_students_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
