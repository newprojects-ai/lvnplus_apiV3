import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ParentService } from '../services/parent.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Student, TestPlan, TestExecution, PerformanceData } from '../types';

@ApiTags('Parents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/parents')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Get('children')
  @ApiOperation({ summary: 'Get all linked children' })
  @ApiResponse({ status: 200, description: 'List of linked children', type: [Student] })
  async getLinkedChildren(@Request() req: Request) {
    const parentId = BigInt(req.user!.id);
    const children = await this.parentService.getLinkedChildren(parentId);
    return children;
  }

  @Post('children/link')
  @ApiOperation({ summary: 'Link a child using code' })
  @ApiResponse({ status: 200, description: 'Child linked successfully', type: Student })
  async linkChild(@Request() req: Request, @Body() body: { studentId: string }) {
    const parentId = BigInt(req.user!.id);
    if (!body.studentId) {
      throw new Error('Student ID is required');
    }
    const result = await this.parentService.linkChild(parentId, BigInt(body.studentId));
    return result;
  }

  @Delete('children/:id')
  @ApiOperation({ summary: 'Unlink a child' })
  @ApiResponse({ status: 204, description: 'Child unlinked successfully' })
  async unlinkChild(@Request() req: Request, @Param('id') id: string) {
    const parentId = BigInt(req.user!.id);
    await this.parentService.unlinkChild(parentId, BigInt(id));
    return null;
  }

  @Post('test-plans')
  @ApiOperation({ summary: 'Create a test plan for a child' })
  @ApiResponse({ status: 201, description: 'Test plan created', type: TestPlan })
  async createTestPlan(@Request() req: Request, @Body() body: {
    studentId: string,
    title: string,
    description: string,
    subjectId: string,
    questionSetIds: string,
    questionsPerSet: string,
    timeLimit: string
  }) {
    const parentId = BigInt(req.user!.id);
    if (!body.studentId || !body.title || !body.subjectId || !body.questionSetIds || !body.questionsPerSet) {
      throw new Error('Missing required fields');
    }
    const plan = await this.parentService.createTestPlan(parentId, {
      studentId: BigInt(body.studentId),
      title: body.title,
      description: body.description,
      subjectId: body.subjectId,
      questionSetIds: body.questionSetIds,
      questionsPerSet: body.questionsPerSet,
      timeLimit: body.timeLimit
    });
    return plan;
  }

  @Get('test-plans')
  @ApiOperation({ summary: 'Get all test plans for linked children' })
  @ApiResponse({ status: 200, description: 'List of test plans', type: [TestPlan] })
  async getTestPlans(@Request() req: Request) {
    const parentId = BigInt(req.user!.id);
    const plans = await this.parentService.getTestPlans(parentId);
    return plans;
  }

  @Get('test-plans/:id')
  @ApiOperation({ summary: 'Get a specific test plan' })
  @ApiResponse({ status: 200, description: 'Test plan', type: TestPlan })
  async getTestPlan(@Request() req: Request, @Param('id') id: string) {
    const parentId = BigInt(req.user!.id);
    const testPlanId = BigInt(id);
    const plan = await this.parentService.getTestPlanById(parentId, testPlanId);
    return plan;
  }

  @Put('test-plans/:id')
  @ApiOperation({ summary: 'Update a test plan' })
  @ApiResponse({ status: 200, description: 'Test plan updated', type: TestPlan })
  async updateTestPlan(@Request() req: Request, @Param('id') id: string, @Body() body: {
    title: string,
    description: string,
    timeLimit: string
  }) {
    const parentId = BigInt(req.user!.id);
    const testPlanId = BigInt(id);
    const plan = await this.parentService.updateTestPlan(parentId, testPlanId, {
      title: body.title,
      description: body.description,
      timeLimit: body.timeLimit
    });
    return plan;
  }

  @Delete('test-plans/:id')
  @ApiOperation({ summary: 'Delete a test plan' })
  @ApiResponse({ status: 204, description: 'Test plan deleted' })
  async deleteTestPlan(@Request() req: Request, @Param('id') id: string) {
    const parentId = BigInt(req.user!.id);
    const testPlanId = BigInt(id);
    await this.parentService.deleteTestPlan(parentId, testPlanId);
    return null;
  }

  @Get('test-executions')
  @ApiOperation({ summary: 'Get test executions for linked children' })
  @ApiResponse({ status: 200, description: 'List of test executions', type: [TestExecution] })
  async getTestExecutions(@Request() req: Request) {
    const parentId = BigInt(req.user!.id);
    const executions = await this.parentService.getTestExecutions(parentId);
    return executions;
  }

  @Get('children/:id/performance')
  @ApiOperation({ summary: 'Get performance data for a child' })
  @ApiResponse({ status: 200, description: 'Child performance data', type: PerformanceData })
  async getChildPerformance(@Request() req: Request, @Param('id') id: string) {
    const parentId = BigInt(req.user!.id);
    const studentId = BigInt(id);
    const performance = await this.parentService.getChildPerformance(parentId, studentId);
    return performance;
  }

  @Get('children/:id/test-history')
  @ApiOperation({ summary: 'Get test history for a child' })
  @ApiResponse({ status: 200, description: 'Child test history', type: [TestExecution] })
  async getChildTestHistory(@Request() req: Request, @Param('id') id: string) {
    const parentId = BigInt(req.user!.id);
    const studentId = BigInt(id);
    const history = await this.parentService.getChildTestHistory(parentId, studentId);
    return history;
  }
}
