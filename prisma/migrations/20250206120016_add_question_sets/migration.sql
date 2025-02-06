/*
  Warnings:

  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.
  - Made the column `created_at` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `active` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `question_set_items` DROP FOREIGN KEY `question_set_items_ibfk_1`;

-- DropForeignKey
ALTER TABLE `question_set_items` DROP FOREIGN KEY `question_set_items_ibfk_2`;

-- DropForeignKey
ALTER TABLE `test_plan_question_sets` DROP FOREIGN KEY `test_plan_question_sets_ibfk_1`;

-- DropForeignKey
ALTER TABLE `test_plan_question_sets` DROP FOREIGN KEY `test_plan_question_sets_ibfk_2`;

-- DropForeignKey
ALTER TABLE `test_plans` DROP FOREIGN KEY `test_plans_ibfk_1`;

-- DropForeignKey
ALTER TABLE `test_plans` DROP FOREIGN KEY `test_plans_ibfk_2`;

-- DropForeignKey
ALTER TABLE `test_plans` DROP FOREIGN KEY `test_plans_ibfk_3`;

-- DropForeignKey
ALTER TABLE `test_plans` DROP FOREIGN KEY `test_plans_ibfk_4`;

-- AlterTable
ALTER TABLE `question_sets` MODIFY `metadata` TEXT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `updated_at`,
    ADD COLUMN `last_login` TIMESTAMP(0) NULL,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `active` BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX `group_members_group_id_idx` ON `group_members`(`group_id`);

-- AddForeignKey
ALTER TABLE `question_set_items` ADD CONSTRAINT `question_set_items_set_id_fkey` FOREIGN KEY (`set_id`) REFERENCES `question_sets`(`set_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_set_items` ADD CONSTRAINT `question_set_items_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions`(`question_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_sets` ADD CONSTRAINT `question_sets_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `test_plan_question_sets` ADD CONSTRAINT `test_plan_question_sets_test_plan_id_fkey` FOREIGN KEY (`test_plan_id`) REFERENCES `test_plans`(`test_plan_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_plan_question_sets` ADD CONSTRAINT `test_plan_question_sets_set_id_fkey` FOREIGN KEY (`set_id`) REFERENCES `question_sets`(`set_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_plans` ADD CONSTRAINT `test_plans_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `test_templates`(`template_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `test_plans` ADD CONSTRAINT `test_plans_board_id_fkey` FOREIGN KEY (`board_id`) REFERENCES `exam_boards`(`board_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `test_plans` ADD CONSTRAINT `test_plans_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `test_plans` ADD CONSTRAINT `test_plans_planned_by_fkey` FOREIGN KEY (`planned_by`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- RedefineIndex
CREATE INDEX `question_set_items_question_id_idx` ON `question_set_items`(`question_id`);
DROP INDEX `idx_question_set_items_question_id` ON `question_set_items`;

-- RedefineIndex
CREATE INDEX `question_set_items_set_id_idx` ON `question_set_items`(`set_id`);
DROP INDEX `idx_question_set_items_set_id` ON `question_set_items`;

-- RedefineIndex
CREATE INDEX `question_sets_created_by_idx` ON `question_sets`(`created_by`);
DROP INDEX `idx_question_sets_created_by` ON `question_sets`;

-- RedefineIndex
CREATE INDEX `test_plan_question_sets_set_id_idx` ON `test_plan_question_sets`(`set_id`);
DROP INDEX `idx_test_plan_question_sets_set_id` ON `test_plan_question_sets`;

-- RedefineIndex
CREATE INDEX `test_plan_question_sets_test_plan_id_idx` ON `test_plan_question_sets`(`test_plan_id`);
DROP INDEX `idx_test_plan_question_sets_test_plan_id` ON `test_plan_question_sets`;

-- RedefineIndex
CREATE INDEX `test_plans_board_id_idx` ON `test_plans`(`board_id`);
DROP INDEX `board_id` ON `test_plans`;

-- RedefineIndex
CREATE INDEX `test_plans_student_id_idx` ON `test_plans`(`student_id`);
DROP INDEX `idx_test_plans_student` ON `test_plans`;

-- RedefineIndex
CREATE INDEX `test_plans_planned_by_idx` ON `test_plans`(`planned_by`);
DROP INDEX `planned_by` ON `test_plans`;

-- RedefineIndex
CREATE INDEX `test_plans_template_id_idx` ON `test_plans`(`template_id`);
DROP INDEX `template_id` ON `test_plans`;

-- RedefineIndex
CREATE UNIQUE INDEX `users_email_key` ON `users`(`email`);
DROP INDEX `email` ON `users`;
