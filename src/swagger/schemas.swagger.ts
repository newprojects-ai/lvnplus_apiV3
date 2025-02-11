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
 *           description: First name
 *         lastName:
 *           type: string
 *           description: Last name
 *         gradeLevel:
 *           type: integer
 *           description: Grade level
 *         linkCode:
 *           type: string
 *           description: Code for linking with parent/guardian
 *     
 *     Parent:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Parent ID
 *         firstName:
 *           type: string
 *           description: First name
 *         lastName:
 *           type: string
 *           description: Last name
 *         email:
 *           type: string
 *           format: email
 *           description: Email address
 *         linkedChildren:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Student'
 *     
 *     TestPlan:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Test plan ID
 *         title:
 *           type: string
 *           description: Test plan title
 *         description:
 *           type: string
 *           description: Test plan description
 *         studentId:
 *           type: integer
 *           description: ID of the student taking the test
 *         subjectId:
 *           type: integer
 *           description: Subject ID
 *         questionSetIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array of question set IDs
 *         questionsPerSet:
 *           type: integer
 *           description: Number of questions per set
 *         timeLimit:
 *           type: integer
 *           description: Time limit in minutes
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Due date for the test
 *         status:
 *           type: string
 *           enum: [not started, in progress, completed]
 *           description: Test plan status
 *     
 *     TestExecution:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Test execution ID
 *         testPlanId:
 *           type: integer
 *           description: Test plan ID
 *         studentId:
 *           type: integer
 *           description: Student ID
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: Test start time
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: Test end time
 *         score:
 *           type: number
 *           description: Test score
 *         status:
 *           type: string
 *           enum: [in progress, completed]
 *           description: Test execution status
 */
