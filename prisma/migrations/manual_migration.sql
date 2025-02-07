-- Drop existing tables if they exist
DROP TABLE IF EXISTS `test_plan_question_sets`;
DROP TABLE IF EXISTS `question_set_items`;
DROP TABLE IF EXISTS `question_sets`;

-- CreateTable for question_sets
CREATE TABLE `question_sets` (
    `set_id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `created_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `metadata` JSON NULL,
    PRIMARY KEY (`set_id`),
    INDEX `idx_question_sets_created_by`(`created_by`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable for question_set_items
CREATE TABLE `question_set_items` (
    `item_id` BIGINT NOT NULL AUTO_INCREMENT,
    `set_id` BIGINT NOT NULL,
    `question_id` BIGINT NOT NULL,
    `sequence` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`item_id`),
    INDEX `idx_question_set_items_set_id`(`set_id`),
    INDEX `idx_question_set_items_question_id`(`question_id`),
    CONSTRAINT `fk_question_set_items_set` FOREIGN KEY (`set_id`) REFERENCES `question_sets`(`set_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_question_set_items_question` FOREIGN KEY (`question_id`) REFERENCES `questions`(`question_id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable for test_plan_question_sets
CREATE TABLE `test_plan_question_sets` (
    `link_id` BIGINT NOT NULL AUTO_INCREMENT,
    `test_plan_id` BIGINT NOT NULL,
    `set_id` BIGINT NOT NULL,
    `sequence` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`link_id`),
    INDEX `idx_test_plan_question_sets_test_plan_id`(`test_plan_id`),
    INDEX `idx_test_plan_question_sets_set_id`(`set_id`),
    CONSTRAINT `fk_test_plan_question_sets_plan` FOREIGN KEY (`test_plan_id`) REFERENCES `test_plans`(`test_plan_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_test_plan_question_sets_set` FOREIGN KEY (`set_id`) REFERENCES `question_sets`(`set_id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add subject_id to difficulty_levels
ALTER TABLE `difficulty_levels` 
ADD COLUMN `subject_id` INT NOT NULL,
ADD INDEX `idx_difficulty_levels_subject`(`subject_id`),
ADD CONSTRAINT `fk_difficulty_levels_subject` 
FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`subject_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
