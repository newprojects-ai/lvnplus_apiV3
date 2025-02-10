/**
 * @swagger
 * /api/parents/children:
 *   get:
 *     summary: Get all linked children
 *     tags: [Parents]
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
 * /api/parents/children/link:
 *   post:
 *     summary: Link a child using code
 *     tags: [Parents]
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
 *         description: Linked child details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 * 
 * /api/parents/children/{childId}:
 *   delete:
 *     summary: Unlink a child
 *     tags: [Parents]
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
 * /api/parents/test-plans:
 *   get:
 *     summary: Get test plans for linked children
 *     tags: [Parents]
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
 *     tags: [Parents]
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
 * 
 * /api/parents/test-executions:
 *   get:
 *     summary: Get test executions for linked children
 *     tags: [Parents]
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
 * /api/parents/children/{childId}/performance:
 *   get:
 *     summary: Get performance data for a linked child
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: childId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Child's performance data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PerformanceData'
 */
