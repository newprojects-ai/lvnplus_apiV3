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
exports.CompleteAssignmentDto = exports.AssignTestDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class AssignTestDto {
    testId;
    dueDate;
    instructions;
}
exports.AssignTestDto = AssignTestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the test to assign',
        example: '123e4567-e89b-12d3-a456-426614174000'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AssignTestDto.prototype, "testId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Due date for the test',
        example: '2025-02-01T00:00:00Z'
    }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], AssignTestDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Additional instructions for the test',
        example: 'Please complete all sections. Take your time and show your work.',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AssignTestDto.prototype, "instructions", void 0);
class CompleteAssignmentDto {
    score;
}
exports.CompleteAssignmentDto = CompleteAssignmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Score achieved in the test',
        example: 85
    }),
    __metadata("design:type", Number)
], CompleteAssignmentDto.prototype, "score", void 0);
