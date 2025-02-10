import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TutorService } from '../services/tutor.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Student, StudyGroup, TestPlan, TestExecution, PerformanceData } from '../types';

@ApiTags('Tutors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/tutors')
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  // Student Management
  @Get('students')
  @ApiOperation({ summary: 'Get all linked students' })
  @ApiResponse({ status: 200, description: 'List of linked students', type: [Student] })
  async getLinkedStudents(@Request() req: Request) {
    const tutorId = BigInt(req.user!.id);
    return this.tutorService.getLinkedStudents(tutorId);
  }

  @Post('students/link')
  @ApiOperation({ summary: 'Link a student' })
  @ApiResponse({ status: 200, description: 'Student linked successfully', type: Student })
  async linkStudent(@Request() req: Request, @Body() body: { studentId: string }) {
    const tutorId = BigInt(req.user!.id);
    if (!body.studentId) {
      throw new Error('Student ID is required');
    }
    return this.tutorService.linkStudent(tutorId, BigInt(body.studentId));
  }

  @Delete('students/:id')
  @ApiOperation({ summary: 'Unlink a student' })
  @ApiResponse({ status: 204, description: 'Student unlinked successfully' })
  async unlinkStudent(@Request() req: Request, @Param('id') id: string) {
    const tutorId = BigInt(req.user!.id);
    await this.tutorService.unlinkStudent(tutorId, BigInt(id));
    return null;
  }

  // Group Management
  @Post('groups')
  @ApiOperation({ summary: 'Create a study group' })
  @ApiResponse({ status: 201, description: 'Group created successfully', type: StudyGroup })
  async createGroup(@Request() req: Request, @Body() body: { name: string; description?: string; studentIds: string[] }) {
    const tutorId = BigInt(req.user!.id);
    if (!body.name || !body.studentIds || !Array.isArray(body.studentIds)) {
      throw new Error('Name and student IDs array are required');
    }
    return this.tutorService.createGroup(tutorId, {
      name: body.name,
      description: body.description,
      studentIds: body.studentIds.map(id => BigInt(id))
    });
  }

  @Get('groups')
  @ApiOperation({ summary: 'Get all study groups' })
  @ApiResponse({ status: 200, description: 'List of study groups', type: [StudyGroup] })
  async getGroups(@Request() req: Request) {
    const tutorId = BigInt(req.user!.id);
    return this.tutorService.getGroups(tutorId);
  }

  @Get('groups/:id')
  @ApiOperation({ summary: 'Get a study group by ID' })
  @ApiResponse({ status: 200, description: 'Study group details', type: StudyGroup })
  async getGroup(@Request() req: Request, @Param('id') id: string) {
    const tutorId = BigInt(req.user!.id);
    return this.tutorService.getGroup(tutorId, BigInt(id));
  }

  @Put('groups/:id')
  @ApiOperation({ summary: 'Update a study group' })
  @ApiResponse({ status: 200, description: 'Study group updated successfully', type: StudyGroup })
  async updateGroup(@Request() req: Request, @Param('id') id: string, @Body() body: { name: string; description?: string }) {
    const tutorId = BigInt(req.user!.id);
    return this.tutorService.updateGroup(tutorId, BigInt(id), {
      name: body.name,
      description: body.description
    });
  }

  @Delete('groups/:id')
  @ApiOperation({ summary: 'Delete a study group' })
  @ApiResponse({ status: 204, description: 'Study group deleted successfully' })
  async deleteGroup(@Request() req: Request, @Param('id') id: string) {
    const tutorId = BigInt(req.user!.id);
    await this.tutorService.deleteGroup(tutorId, BigInt(id));
    return null;
  }

  @Post('groups/:id/students')
  @ApiOperation({ summary: 'Add students to a study group' })
  @ApiResponse({ status: 200, description: 'Students added to study group successfully', type: StudyGroup })
  async addStudentsToGroup(@Request() req: Request, @Param('id') id: string, @Body() body: { studentIds: string[] }) {
    const tutorId = BigInt(req.user!.id);
    if (!body.studentIds || !Array.isArray(body.studentIds)) {
      throw new Error('Student IDs array is required');
    }
    return this.tutorService.addStudentsToGroup(tutorId, BigInt(id), body.studentIds.map(id => BigInt(id)));
  }

  @Delete('groups/:id/students/:studentId')
  @ApiOperation({ summary: 'Remove a student from a study group' })
  @ApiResponse({ status: 204, description: 'Student removed from study group successfully' })
  async removeStudentFromGroup(@Request() req: Request, @Param('id') id: string, @Param('studentId') studentId: string) {
    const tutorId = BigInt(req.user!.id);
    await this.tutorService.removeStudentFromGroup(tutorId, BigInt(id), BigInt(studentId));
    return null;
  }

  // Test Plans
  @Post('test-plans')
  @ApiOperation({ summary: 'Create a test plan' })
  @ApiResponse({ status: 201, description: 'Test plan created', type: TestPlan })
  async createTestPlan(@Request() req: Request, @Body() testPlan: Partial<TestPlan>) {
    const tutorId = BigInt(req.user!.id);
    return this.tutorService.createTestPlan(tutorId, testPlan);
  }

  @Get('test-plans')
  @ApiOperation({ summary: 'Get all test plans' })
  @ApiResponse({ status: 200, description: 'List of test plans', type: [TestPlan] })
  async getTestPlans(@Request() req: Request) {
    const tutorId = BigInt(req.user!.id);
    return this.tutorService.getTestPlans(tutorId);
  }

  @Get('test-plans/:id')
  @ApiOperation({ summary: 'Get a test plan by ID' })
  @ApiResponse({ status: 200, description: 'Test plan details', type: TestPlan })
  async getTestPlan(@Request() req: Request, @Param('id') id: string) {
    const tutorId = BigInt(req.user!.id);
    return this.tutorService.getTestPlanById(tutorId, BigInt(id));
  }

  @Put('test-plans/:id')
  @ApiOperation({ summary: 'Update a test plan' })
  @ApiResponse({ status: 200, description: 'Test plan updated successfully', type: TestPlan })
  async updateTestPlan(@Request() req: Request, @Param('id') id: string, @Body() body: { title: string; description?: string; timeLimit?: number }) {
    const tutorId = BigInt(req.user!.id);
    return this.tutorService.updateTestPlan(tutorId, BigInt(id), {
      title: body.title,
      description: body.description,
      timeLimit: body.timeLimit
    });
  }

  @Delete('test-plans/:id')
  @ApiOperation({ summary: 'Delete a test plan' })
  @ApiResponse({ status: 204, description: 'Test plan deleted successfully' })
  async deleteTestPlan(@Request() req: Request, @Param('id') id: string) {
    const tutorId = BigInt(req.user!.id);
    await this.tutorService.deleteTestPlan(tutorId, BigInt(id));
    return null;
  }

  // Performance
  @Get('students/:id/performance')
  @ApiOperation({ summary: 'Get student performance' })
  @ApiResponse({ status: 200, description: 'Student performance data', type: PerformanceData })
  async getStudentPerformance(@Request() req: Request, @Param('id') id: string) {
    const tutorId = BigInt(req.user!.id);
    return this.tutorService.getStudentPerformance(tutorId, BigInt(id));
  }

  @Get('groups/:id/performance')
  @ApiOperation({ summary: 'Get group performance' })
  @ApiResponse({ status: 200, description: 'Group performance data', type: PerformanceData })
  async getGroupPerformance(@Request() req: Request, @Param('id') id: string) {
    const tutorId = BigInt(req.user!.id);
    return this.tutorService.getGroupPerformance(tutorId, BigInt(id));
  }

  @Get('students/:id/test-history')
  @ApiOperation({ summary: 'Get student test history' })
  @ApiResponse({ status: 200, description: 'Student test history', type: [TestExecution] })
  async getStudentTestHistory(@Request() req: Request, @Param('id') id: string) {
    const tutorId = BigInt(req.user!.id);
    return this.tutorService.getStudentTestHistory(tutorId, BigInt(id));
  }
}
