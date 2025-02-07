-- CreateTable
CREATE TABLE `exam_boards` (
    `board_id` INTEGER NOT NULL AUTO_INCREMENT,
    `board_name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `input_type` ENUM('NUMERIC', 'MCQ') NOT NULL,

    UNIQUE INDEX `board_name`(`board_name`),
    PRIMARY KEY (`board_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questions` (
    `question_id` BIGINT NOT NULL AUTO_INCREMENT,
    `subtopic_id` INTEGER NOT NULL,
    `question_text` TEXT NOT NULL,
    `question_text_plain` TEXT NOT NULL,
    `options` LONGTEXT NOT NULL,
    `correct_answer` VARCHAR(255) NOT NULL,
    `correct_answer_plain` VARCHAR(255) NOT NULL,
    `solution` TEXT NOT NULL,
    `solution_plain` TEXT NOT NULL,
    `difficulty_level` TINYINT NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` BIGINT NOT NULL,
    `active` BOOLEAN NULL DEFAULT true,

    INDEX `created_by`(`created_by`),
    INDEX `idx_questions_difficulty`(`difficulty_level`),
    INDEX `subtopic_id`(`subtopic_id`),
    PRIMARY KEY (`question_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_set_items` (
    `item_id` BIGINT NOT NULL AUTO_INCREMENT,
    `set_id` BIGINT NOT NULL,
    `question_id` BIGINT NOT NULL,
    `sequence` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `question_set_items_set_id_idx`(`set_id`),
    INDEX `question_set_items_question_id_idx`(`question_id`),
    PRIMARY KEY (`item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_sets` (
    `set_id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `created_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `metadata` TEXT NULL,

    INDEX `question_sets_created_by_idx`(`created_by`),
    PRIMARY KEY (`set_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `role_id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_name` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,

    UNIQUE INDEX `role_name`(`role_name`),
    PRIMARY KEY (`role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subjects` (
    `subject_id` INTEGER NOT NULL AUTO_INCREMENT,
    `subject_name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,

    UNIQUE INDEX `subject_name`(`subject_name`),
    PRIMARY KEY (`subject_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subtopics` (
    `subtopic_id` INTEGER NOT NULL AUTO_INCREMENT,
    `topic_id` INTEGER NOT NULL,
    `subtopic_name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,

    UNIQUE INDEX `unique_subtopic`(`topic_id`, `subtopic_name`),
    PRIMARY KEY (`subtopic_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_executions` (
    `execution_id` BIGINT NOT NULL AUTO_INCREMENT,
    `test_plan_id` BIGINT NOT NULL,
    `student_id` BIGINT NOT NULL,
    `status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED') NOT NULL,
    `started_at` TIMESTAMP(0) NULL,
    `completed_at` TIMESTAMP(0) NULL,
    `test_data` LONGTEXT NOT NULL,
    `score` INTEGER NULL,

    INDEX `idx_test_executions_status`(`status`),
    INDEX `test_plan_id`(`test_plan_id`),
    INDEX `idx_test_executions_student`(`student_id`),
    PRIMARY KEY (`execution_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_plan_question_sets` (
    `link_id` BIGINT NOT NULL AUTO_INCREMENT,
    `test_plan_id` BIGINT NOT NULL,
    `set_id` BIGINT NOT NULL,
    `sequence` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `test_plan_question_sets_test_plan_id_idx`(`test_plan_id`),
    INDEX `test_plan_question_sets_set_id_idx`(`set_id`),
    PRIMARY KEY (`link_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_plans` (
    `test_plan_id` BIGINT NOT NULL AUTO_INCREMENT,
    `template_id` BIGINT NULL,
    `board_id` INTEGER NOT NULL,
    `test_type` ENUM('TOPIC', 'MIXED', 'MENTAL_ARITHMETIC') NOT NULL,
    `timing_type` ENUM('TIMED', 'UNTIMED') NOT NULL,
    `time_limit` INTEGER NULL,
    `student_id` BIGINT NOT NULL,
    `planned_by` BIGINT NOT NULL,
    `planned_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `configuration` LONGTEXT NOT NULL,

    INDEX `test_plans_template_id_idx`(`template_id`),
    INDEX `test_plans_board_id_idx`(`board_id`),
    INDEX `test_plans_student_id_idx`(`student_id`),
    INDEX `test_plans_planned_by_idx`(`planned_by`),
    PRIMARY KEY (`test_plan_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_templates` (
    `template_id` BIGINT NOT NULL AUTO_INCREMENT,
    `template_name` VARCHAR(255) NOT NULL,
    `source` ENUM('SYSTEM', 'USER') NOT NULL,
    `created_by` BIGINT NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `board_id` INTEGER NOT NULL,
    `test_type` ENUM('TOPIC', 'MIXED', 'MENTAL_ARITHMETIC') NOT NULL,
    `timing_type` ENUM('TIMED', 'UNTIMED') NOT NULL,
    `time_limit` INTEGER NULL,
    `configuration` LONGTEXT NOT NULL,
    `active` BOOLEAN NULL DEFAULT true,

    INDEX `board_id`(`board_id`),
    INDEX `created_by`(`created_by`),
    INDEX `idx_templates_source`(`source`),
    PRIMARY KEY (`template_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `topics` (
    `topic_id` INTEGER NOT NULL AUTO_INCREMENT,
    `subject_id` INTEGER NOT NULL,
    `topic_name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,

    UNIQUE INDEX `unique_topic`(`subject_id`, `topic_name`),
    PRIMARY KEY (`topic_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `user_id` BIGINT NOT NULL,
    `role_id` INTEGER NOT NULL,

    INDEX `role_id`(`role_id`),
    PRIMARY KEY (`user_id`, `role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `user_id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `last_login` TIMESTAMP(0) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `difficulty_levels` (
    `level_id` INTEGER NOT NULL AUTO_INCREMENT,
    `level_name` VARCHAR(50) NOT NULL,
    `level_value` INTEGER NOT NULL,
    `subject_id` INTEGER NOT NULL,
    `purpose` TEXT NOT NULL,
    `characteristics` TEXT NOT NULL,
    `focus_area` TEXT NOT NULL,
    `steps_required` VARCHAR(50) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `active` BOOLEAN NULL DEFAULT true,

    UNIQUE INDEX `level_name`(`level_name`),
    UNIQUE INDEX `level_value`(`level_value`),
    INDEX `difficulty_levels_subject_id_idx`(`subject_id`),
    PRIMARY KEY (`level_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_progress` (
    `user_id` BIGINT NOT NULL,
    `level` INTEGER NOT NULL DEFAULT 1,
    `current_xp` INTEGER NOT NULL DEFAULT 0,
    `next_level_xp` INTEGER NOT NULL DEFAULT 1000,
    `streak_days` INTEGER NOT NULL DEFAULT 0,
    `last_activity_date` TIMESTAMP(0) NULL,
    `total_points` INTEGER NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `student_progress_user_id_idx`(`user_id`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `achievements` (
    `achievement_id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `points` INTEGER NOT NULL,
    `icon` VARCHAR(100) NULL,
    `required_criteria` TEXT NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `achievements_category_idx`(`category`),
    PRIMARY KEY (`achievement_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_achievements` (
    `user_id` BIGINT NOT NULL,
    `achievement_id` BIGINT NOT NULL,
    `unlocked_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `progress` INTEGER NOT NULL DEFAULT 0,

    INDEX `student_achievements_user_id_idx`(`user_id`),
    PRIMARY KEY (`user_id`, `achievement_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rewards` (
    `reward_id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `cost` INTEGER NOT NULL,
    `icon` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `rewards_category_idx`(`category`),
    PRIMARY KEY (`reward_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_rewards` (
    `user_id` BIGINT NOT NULL,
    `reward_id` BIGINT NOT NULL,
    `purchased_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `student_rewards_user_id_idx`(`user_id`),
    PRIMARY KEY (`user_id`, `reward_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_mastery` (
    `user_id` BIGINT NOT NULL,
    `subject_id` INTEGER NOT NULL,
    `mastery_level` INTEGER NOT NULL DEFAULT 0,
    `total_questions_attempted` INTEGER NOT NULL DEFAULT 0,
    `correct_answers` INTEGER NOT NULL DEFAULT 0,
    `last_test_date` TIMESTAMP(0) NULL,

    INDEX `subject_mastery_user_id_idx`(`user_id`),
    PRIMARY KEY (`user_id`, `subject_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_log` (
    `activity_id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `activity_type` VARCHAR(50) NOT NULL,
    `xp_earned` INTEGER NOT NULL DEFAULT 0,
    `details` TEXT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `activity_log_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`activity_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `level_config` (
    `level` INTEGER NOT NULL,
    `xp_required` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`level`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

    INDEX `group_members_group_id_idx`(`group_id`),
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
ALTER TABLE `questions` ADD CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`subtopic_id`) REFERENCES `subtopics`(`subtopic_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `question_set_items` ADD CONSTRAINT `question_set_items_set_id_fkey` FOREIGN KEY (`set_id`) REFERENCES `question_sets`(`set_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_set_items` ADD CONSTRAINT `question_set_items_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions`(`question_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_sets` ADD CONSTRAINT `question_sets_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subtopics` ADD CONSTRAINT `subtopics_ibfk_1` FOREIGN KEY (`topic_id`) REFERENCES `topics`(`topic_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `test_executions` ADD CONSTRAINT `test_executions_ibfk_1` FOREIGN KEY (`test_plan_id`) REFERENCES `test_plans`(`test_plan_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `test_executions` ADD CONSTRAINT `test_executions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

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

-- AddForeignKey
ALTER TABLE `test_templates` ADD CONSTRAINT `test_templates_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `test_templates` ADD CONSTRAINT `test_templates_ibfk_2` FOREIGN KEY (`board_id`) REFERENCES `exam_boards`(`board_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `topics` ADD CONSTRAINT `topics_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`subject_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles`(`role_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `difficulty_levels` ADD CONSTRAINT `difficulty_levels_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`subject_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `student_progress` ADD CONSTRAINT `student_progress_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_achievements` ADD CONSTRAINT `student_achievements_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_achievements` ADD CONSTRAINT `student_achievements_achievement_id_fkey` FOREIGN KEY (`achievement_id`) REFERENCES `achievements`(`achievement_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_rewards` ADD CONSTRAINT `student_rewards_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_rewards` ADD CONSTRAINT `student_rewards_reward_id_fkey` FOREIGN KEY (`reward_id`) REFERENCES `rewards`(`reward_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subject_mastery` ADD CONSTRAINT `subject_mastery_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subject_mastery` ADD CONSTRAINT `subject_mastery_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`subject_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_log` ADD CONSTRAINT `activity_log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
