-- CreateTable
CREATE TABLE "question_sets" (
    "set_id" BIGSERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_by" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB
);

-- CreateTable
CREATE TABLE "question_set_items" (
    "item_id" BIGSERIAL PRIMARY KEY,
    "set_id" BIGINT NOT NULL,
    "question_id" BIGINT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("set_id") REFERENCES "question_sets"("set_id") ON DELETE CASCADE,
    FOREIGN KEY ("question_id") REFERENCES "questions"("question_id") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "test_plan_question_sets" (
    "link_id" BIGSERIAL PRIMARY KEY,
    "test_plan_id" BIGINT NOT NULL,
    "set_id" BIGINT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("test_plan_id") REFERENCES "test_plans"("test_plan_id") ON DELETE CASCADE,
    FOREIGN KEY ("set_id") REFERENCES "question_sets"("set_id") ON DELETE CASCADE
);

-- CreateIndex
CREATE INDEX "idx_question_sets_created_by" ON "question_sets"("created_by");
CREATE INDEX "idx_question_set_items_set_id" ON "question_set_items"("set_id");
CREATE INDEX "idx_question_set_items_question_id" ON "question_set_items"("question_id");
CREATE INDEX "idx_test_plan_question_sets_test_plan_id" ON "test_plan_question_sets"("test_plan_id");
CREATE INDEX "idx_test_plan_question_sets_set_id" ON "test_plan_question_sets"("set_id");
