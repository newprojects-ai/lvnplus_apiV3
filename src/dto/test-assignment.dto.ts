import { IsString, IsDate, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AssignTestDto {
  @ApiProperty({
    description: 'ID of the test to assign',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  testId: string;

  @ApiProperty({
    description: 'Due date for the test',
    example: '2025-02-01T00:00:00Z'
  })
  @Type(() => Date)
  @IsDate()
  dueDate: Date;

  @ApiProperty({
    description: 'Additional instructions for the test',
    example: 'Please complete all sections. Take your time and show your work.',
    required: false
  })
  @IsString()
  @IsOptional()
  instructions?: string;
}

export class CompleteAssignmentDto {
  @ApiProperty({
    description: 'Score achieved in the test',
    example: 85
  })
  score: number;
}
