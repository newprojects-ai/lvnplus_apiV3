import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/error';
import winston from 'winston';
import { LoginUserDTO, RegisterUserDTO, AuthResponse } from '../types/auth';

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

export class AuthService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async login(credentials: LoginUserDTO): Promise<AuthResponse> {
    try {
      // Validate required fields
      if (!credentials.email) {
        throw new AppError(400, 'Email is required');
      }
      
      if (!credentials.password) {
        throw new AppError(400, 'Password is required');
      }
      
      if (!credentials.role) {
        throw new AppError(400, 'Role is required');
      }

      const user = await this.prisma.users.findUnique({
        where: { email: credentials.email },
        include: {
          user_roles: {
            include: {
              roles: true,
            },
          },
        },
      });

      if (!user) {
        logger.warn(`Login attempt failed: User not found for email ${credentials.email}`);
        throw new AppError(401, 'Invalid email or password');
      }

      const isValidPassword = await bcrypt.compare(
        credentials.password,
        user.password
      );

      if (!isValidPassword) {
        logger.warn(`Login attempt failed: Invalid password for email ${credentials.email}`);
        throw new AppError(401, 'Invalid email or password');
      }

      // Always store and compare roles in lowercase
      const requestedRole = credentials.role.toLowerCase();
      const userRoles = user.user_roles.map(ur => ur.roles.role_name.toLowerCase());
      
      if (!userRoles.includes(requestedRole)) {
        logger.warn(`Login attempt failed: User ${credentials.email} attempted to login with invalid role ${credentials.role}`);
        throw new AppError(403, `Access denied. Required role: ${credentials.role}`);
      }

      const token = jwt.sign(
        {
          userId: user.user_id.toString(),
          email: user.email,
          roles: userRoles, // Store all user roles in token
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      logger.info(`User ${credentials.email} logged in successfully with roles: ${userRoles.join(', ')}`);

      return {
        token,
        user: {
          id: user.user_id.toString(),
          email: user.email,
          roles: userRoles,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Login error:', error);
      throw new AppError(500, 'An error occurred during login');
    }
  }

  async register(data: RegisterUserDTO): Promise<AuthResponse> {
    try {
      const existingUser = await this.prisma.users.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        logger.warn(`Registration failed: Email ${data.email} already exists`);
        throw new AppError(400, 'Email already registered');
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const requestedRole = data.role.toLowerCase();

      const user = await this.prisma.users.create({
        data: {
          email: data.email,
          password: hashedPassword,
          first_name: data.first_name,
          last_name: data.last_name,
          user_roles: {
            create: [{
              roles: {
                connect: {
                  role_name: requestedRole,
                },
              },
            }],
          },
        },
        include: {
          user_roles: {
            include: {
              roles: true,
            },
          },
        },
      });

      const userRoles = user.user_roles.map(ur => ur.roles.role_name.toLowerCase());

      const token = jwt.sign(
        {
          userId: user.user_id.toString(),
          email: user.email,
          roles: userRoles, // Store all user roles in token
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      logger.info(`User ${data.email} successfully registered with roles: ${userRoles.join(', ')}`);

      return {
        token,
        user: {
          id: user.user_id.toString(),
          email: user.email,
          roles: userRoles,
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Registration error:', error);
      throw new AppError(500, 'An unexpected error occurred');
    }
  }
}