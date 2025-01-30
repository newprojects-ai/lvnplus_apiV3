"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddStudentToGroupDto = exports.UpdateStudyGroupDto = exports.CreateStudyGroupDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateStudyGroupDto {
    name;
    description;
}
exports.CreateStudyGroupDto = CreateStudyGroupDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the study group',
        example: 'Advanced Mathematics Group'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStudyGroupDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Description of the study group',
        example: 'Group for advanced mathematics students preparing for competitions',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateStudyGroupDto.prototype, "description", void 0);
class UpdateStudyGroupDto {
    name;
    description;
}
exports.UpdateStudyGroupDto = UpdateStudyGroupDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Updated name of the study group',
        example: 'Advanced Mathematics Group 2025',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateStudyGroupDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Updated description of the study group',
        example: 'Group for advanced mathematics students preparing for 2025 competitions',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateStudyGroupDto.prototype, "description", void 0);
class AddStudentToGroupDto {
    studentId;
}
exports.AddStudentToGroupDto = AddStudentToGroupDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the student to add to the group',
        example: '123e4567-e89b-12d3-a456-426614174000'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddStudentToGroupDto.prototype, "studentId", void 0);
