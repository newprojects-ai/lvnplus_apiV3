"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class NotificationService {
    transporter;
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }
    async sendEmail(to, subject, html) {
        await this.transporter.sendMail({
            from: process.env.SMTP_FROM,
            to,
            subject,
            html
        });
    }
    async notifyGuardianRequest(studentEmail, guardianName, relationType, relationshipId) {
        const subject = `New ${relationType.toLowerCase()} connection request`;
        const confirmLink = `${process.env.APP_URL}/confirm-guardian/${relationshipId}`;
        const html = `
      <h2>New Connection Request</h2>
      <p>${guardianName} would like to connect with you as a ${relationType.toLowerCase()}.</p>
      <p>Click the link below to confirm this connection:</p>
      <a href="${confirmLink}">Confirm Connection</a>
      <p>If you don't recognize this person, you can safely ignore this email.</p>
    `;
        await this.sendEmail(studentEmail, subject, html);
    }
    async notifyTestAssignment(studentEmail, testName, dueDate, assignerName) {
        const subject = 'New Test Assignment';
        const dueDateTime = dueDate.toLocaleString();
        const html = `
      <h2>New Test Assignment</h2>
      <p>${assignerName} has assigned you a new test: ${testName}</p>
      <p>Due Date: ${dueDateTime}</p>
      <p>Please log in to your account to complete the test.</p>
    `;
        await this.sendEmail(studentEmail, subject, html);
    }
    async notifyTestCompletion(guardianEmail, studentName, testName, score) {
        const subject = 'Test Completion Notification';
        const html = `
      <h2>Test Completion Update</h2>
      <p>${studentName} has completed the test: ${testName}</p>
      <p>Score: ${score}%</p>
      <p>Log in to your account to view detailed performance metrics.</p>
    `;
        await this.sendEmail(guardianEmail, subject, html);
    }
    async notifyLowPerformance(guardianEmail, studentName, testName, score) {
        const subject = 'Low Performance Alert';
        const html = `
      <h2>Performance Alert</h2>
      <p>${studentName} received a low score on the recent test: ${testName}</p>
      <p>Score: ${score}%</p>
      <p>We recommend reviewing the test results and providing additional support in these areas.</p>
      <p>Log in to your account to view detailed performance metrics and recommendations.</p>
    `;
        await this.sendEmail(guardianEmail, subject, html);
    }
    async notifyUpcomingDeadlines(studentEmail, assignments) {
        const subject = 'Upcoming Test Deadlines';
        const assignmentsList = assignments
            .map(a => `
        <li>
          <strong>${a.testName}</strong><br>
          Due: ${a.dueDate.toLocaleString()}<br>
          Assigned by: ${a.assignerName}
        </li>
      `)
            .join('');
        const html = `
      <h2>Upcoming Test Deadlines</h2>
      <p>Here are your upcoming test deadlines:</p>
      <ul>
        ${assignmentsList}
      </ul>
      <p>Please make sure to complete these tests before their due dates.</p>
    `;
        await this.sendEmail(studentEmail, subject, html);
    }
    async notifyGroupPerformance(tutorEmail, groupName, metrics) {
        const subject = `Group Performance Update: ${groupName}`;
        const html = `
      <h2>Group Performance Update</h2>
      <h3>${groupName}</h3>
      <p>Here's a summary of your group's performance:</p>
      <ul>
        <li>Average Score: ${metrics.averageScore.toFixed(1)}%</li>
        <li>Test Completion Rate: ${metrics.completionRate.toFixed(1)}%</li>
        <li>Number of Students: ${metrics.studentCount}</li>
      </ul>
      <p>Log in to your account to view detailed performance metrics for individual students.</p>
    `;
        await this.sendEmail(tutorEmail, subject, html);
    }
}
exports.NotificationService = NotificationService;
