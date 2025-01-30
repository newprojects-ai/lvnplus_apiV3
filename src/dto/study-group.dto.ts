import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudyGroupDto {
  @ApiProperty({
    description: 'Name of the study group',
    example: 'Advanced Mathematics Group'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the study group',
    example: 'Group for advanced mathematics students preparing for competitions',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateStudyGroupDto {
  @ApiProperty({
    description: 'Updated name of the study group',
    example: 'Advanced Mathematics Group 2025',
    required: false
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Updated description of the study group',
    example: 'Group for advanced mathematics students preparing for 2025 competitions',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class AddStudentToGroupDto {
  @ApiProperty({
    description: 'ID of the student to add to the group',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  studentId: string;
}
