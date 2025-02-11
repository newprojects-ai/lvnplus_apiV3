/**
 * @swagger
 * /api/guardians:
 *   get:
 *     summary: Get guardian profile
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Guardian profile details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Guardian'
 * 
 *   put:
 *     summary: Update guardian profile
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated guardian profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Guardian'
 * 
 * /api/guardians/children:
 *   get:
 *     summary: Get all linked children
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of linked children
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 * 
 * /api/guardians/children/link:
 *   post:
 *     summary: Link a child using code
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Unique code to link child
 *     responses:
 *       200:
 *         description: Child linked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 * 
 * /api/guardians/children/{childId}:
 *   delete:
 *     summary: Unlink a child
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: childId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Child unlinked successfully
 * 
 * /api/guardians/test-plans:
 *   get:
 *     summary: Get test plans for linked children
 *     tags: [Guardians]
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
 *     summary: Create a test plan for a linked child
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: integer
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               subjectId:
 *                 type: integer
 *               questionSetIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               questionsPerSet:
 *                 type: integer
 *               timeLimit:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Test plan created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestPlan'
 * 
 * /api/guardians/test-plans/{planId}:
 *   get:
 *     summary: Get test plan details
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Test plan details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestPlan'
 * 
 *   put:
 *     summary: Update test plan
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               timeLimit:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated test plan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestPlan'
 * 
 *   delete:
 *     summary: Delete test plan
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Test plan deleted successfully
 * 
 * components:
 *   schemas:
 *     GuardianLinkRequest:
 *       type: object
 *       required:
 *         - studentEmail
 *         - relationship
 *       properties:
 *         studentEmail:
 *           type: string
 *           format: email
 *           description: Email of the student to link with
 *         relationship:
 *           type: string
 *           enum: [PARENT, GUARDIAN]
 *           description: Type of guardian relationship
 * 
 *     GuardianLinkResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: bigint
 *           description: ID of the created link
 *         studentId:
 *           type: string
 *           format: bigint
 *         guardianId:
 *           type: string
 *           format: bigint
 *         relationship:
 *           type: string
 *           enum: [PARENT, GUARDIAN]
 *         status:
 *           type: string
 *           enum: [PENDING, ACTIVE, INACTIVE]
 *         createdAt:
 *           type: string
 *           format: date-time
 * 
 * /api/guardians/link-request:
 *   post:
 *     summary: Request to link with a student as a guardian
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GuardianLinkRequest'
 *     responses:
 *       201:
 *         description: Link request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GuardianLinkResponse'
 *       400:
 *         description: Invalid request or relationship already exists
 *       404:
 *         description: Student not found
 *       401:
 *         description: Unauthorized
 * 
 * /api/guardians/{guardianId}/students/{studentId}:
 *   delete:
 *     summary: Remove guardian-student relationship
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: guardianId
 *         required: true
 *         schema:
 *           type: string
 *           format: bigint
 *         description: ID of the guardian
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: bigint
 *         description: ID of the student
 *     responses:
 *       200:
 *         description: Relationship removed successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Relationship not found
 *       401:
 *         description: Unauthorized
 * 
 * /api/students/confirm-guardian/{linkId}:
 *   post:
 *     summary: Confirm or reject a guardian link request
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: linkId
 *         required: true
 *         schema:
 *           type: string
 *           format: bigint
 *         description: ID of the guardian link request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accepted
 *             properties:
 *               accepted:
 *                 type: boolean
 *                 description: Whether to accept or reject the link request
 *     responses:
 *       200:
 *         description: Link request processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GuardianLinkResponse'
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Link request not found
 *       401:
 *         description: Unauthorized
