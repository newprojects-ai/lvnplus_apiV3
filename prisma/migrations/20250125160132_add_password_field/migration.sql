/*
  Warnings:

  - You are about to drop the column `password_hash` on the `users` table. All the data in the column will be lost.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `first_name` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `last_name` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `password_hash`,
    ADD COLUMN `password` VARCHAR(255) NOT NULL,
    MODIFY `first_name` VARCHAR(100) NOT NULL,
    MODIFY `last_name` VARCHAR(100) NOT NULL;

-- CreateTable
CREATE TABLE `study_groups` (
    `group_id` BIGINT NOT NULL AUTO_INCREMENT,
    `group_name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `tutor_id` BIGINT NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `study_groups_tutor_id_idx`(`tutor_id`),
    PRIMARY KEY (`group_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_guardians` (
    `relationship_id` BIGINT NOT NULL AUTO_INCREMENT,
    `guardian_id` BIGINT NOT NULL,
    `student_id` BIGINT NOT NULL,
    `relationship_type` ENUM('PARENT', 'TUTOR') NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'PENDING',
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `student_guardians_guardian_id_idx`(`guardian_id`),
    INDEX `student_guardians_student_id_idx`(`student_id`),
    UNIQUE INDEX `unique_guardian_student`(`guardian_id`, `student_id`),
    PRIMARY KEY (`relationship_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_members` (
    `group_id` BIGINT NOT NULL,
    `student_id` BIGINT NOT NULL,
    `joined_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `group_members_student_id_idx`(`student_id`),
    PRIMARY KEY (`group_id`, `student_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_assignments` (
    `assignment_id` BIGINT NOT NULL AUTO_INCREMENT,
    `test_plan_id` BIGINT NOT NULL,
    `assigned_by` BIGINT NOT NULL,
    `group_id` BIGINT NULL,
    `student_id` BIGINT NULL,
    `due_date` TIMESTAMP(0) NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'OVERDUE') NOT NULL DEFAULT 'PENDING',
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `test_assignments_test_plan_id_idx`(`test_plan_id`),
    INDEX `test_assignments_assigned_by_idx`(`assigned_by`),
    INDEX `test_assignments_group_id_idx`(`group_id`),
    INDEX `test_assignments_student_id_idx`(`student_id`),
    PRIMARY KEY (`assignment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_GroupStudents` (
    `A` BIGINT NOT NULL,
    `B` BIGINT NOT NULL,

    UNIQUE INDEX `_GroupStudents_AB_unique`(`A`, `B`),
    INDEX `_GroupStudents_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_GroupTests` (
    `A` BIGINT NOT NULL,
    `B` BIGINT NOT NULL,

    UNIQUE INDEX `_GroupTests_AB_unique`(`A`, `B`),
    INDEX `_GroupTests_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `study_groups` ADD CONSTRAINT `study_groups_tutor_id_fkey` FOREIGN KEY (`tutor_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_guardians` ADD CONSTRAINT `student_guardians_guardian_id_fkey` FOREIGN KEY (`guardian_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_guardians` ADD CONSTRAINT `student_guardians_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_members` ADD CONSTRAINT `group_members_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `study_groups`(`group_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_members` ADD CONSTRAINT `group_members_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_assignments` ADD CONSTRAINT `test_assignments_test_plan_id_fkey` FOREIGN KEY (`test_plan_id`) REFERENCES `test_plans`(`test_plan_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_assignments` ADD CONSTRAINT `test_assignments_assigned_by_fkey` FOREIGN KEY (`assigned_by`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_assignments` ADD CONSTRAINT `test_assignments_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `study_groups`(`group_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_assignments` ADD CONSTRAINT `test_assignments_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GroupStudents` ADD CONSTRAINT `_GroupStudents_A_fkey` FOREIGN KEY (`A`) REFERENCES `study_groups`(`group_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GroupStudents` ADD CONSTRAINT `_GroupStudents_B_fkey` FOREIGN KEY (`B`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GroupTests` ADD CONSTRAINT `_GroupTests_A_fkey` FOREIGN KEY (`A`) REFERENCES `study_groups`(`group_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GroupTests` ADD CONSTRAINT `_GroupTests_B_fkey` FOREIGN KEY (`B`) REFERENCES `test_plans`(`test_plan_id`) ON DELETE CASCADE ON UPDATE CASCADE;
