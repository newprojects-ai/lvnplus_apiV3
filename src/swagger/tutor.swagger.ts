/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Student ID
 *         firstName:
 *           type: string
 *           description: Student's first name
 *         lastName:
 *           type: string
 *           description: Student's last name
 *         email:
 *           type: string
 *           format: email
 *           description: Student's email address
 *         grade:
 *           type: integer
 *           description: Student's grade level
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     StudyGroup:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         students:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Student'
 * 
 *     TestPlan:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         subjectId:
 *           type: integer
 *         studentId:
 *           type: integer
 *         groupId:
 *           type: integer
 *         timeLimit:
 *           type: integer
 *         configuration:
 *           type: object
 *           properties:
 *             questionSetIds:
 *               type: array
 *               items:
 *                 type: integer
 *             questionsPerSet:
 *               type: integer
 *         status:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED]
 * 
 *     TestExecution:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         testPlanId:
 *           type: integer
 *         studentId:
 *           type: integer
 *         startedAt:
 *           type: string
 *           format: date-time
 *         completedAt:
 *           type: string
 *           format: date-time
 *         score:
 *           type: number
 *         duration:
 *           type: integer
 *         answers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: integer
 *               answer:
 *                 type: string
 *               isCorrect:
 *                 type: boolean
 * 
 *     PerformanceData:
 *       type: object
 *       properties:
 *         progress:
 *           type: object
 *           properties:
 *             overallProgress:
 *               type: number
 *             subjectProgress:
 *               type: object
 *               additionalProperties:
 *                 type: number
 *             improvementAreas:
 *               type: array
 *               items:
 *                 type: string
 *             strengthAreas:
 *               type: array
 *               items:
 *                 type: string
 */

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 * 
 *   post:
 *     summary: Create a new student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       201:
 *         description: Created student
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 * 
 * /api/students/{id}:
 *   get:
 *     summary: Get student by ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 * 
 *   put:
 *     summary: Update student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       200:
 *         description: Updated student
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 * 
 *   delete:
 *     summary: Delete student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Student deleted
 */

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Get all study groups
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of study groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudyGroup'
 * 
 *   post:
 *     summary: Create a new study group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudyGroup'
 *     responses:
 *       201:
 *         description: Created study group
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudyGroup'
 */

/**
 * @swagger
 * /api/test-plans:
 *   get:
 *     summary: Get all test plans
 *     tags: [Test Plans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of test plans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TestPlan'
 * 
 *   post:
 *     summary: Create a new test plan
 *     tags: [Test Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TestPlan'
 *     responses:
 *       201:
 *         description: Created test plan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestPlan'
 */

/**
 * @swagger
 * /api/test-executions:
 *   get:
 *     summary: Get all test executions
 *     tags: [Test Executions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of test executions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TestExecution'
 * 
 *   post:
 *     summary: Start a new test execution
 *     tags: [Test Executions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               testPlanId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Started test execution
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestExecution'
 */
