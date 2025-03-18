import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { LoginUserDTO, RegisterUserDTO, AuthResponse, Role } from '../types';
import { AppError } from '../utils/error';
import winston from 'winston';

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

// Role validation helper
const normalizeRole = (role: string): Role => role.toLowerCase() as Role;

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

      // Normalize the requested role and user roles for consistent comparison
      const requestedRole = normalizeRole(credentials.role);
      const userRoles = user.user_roles.map(ur => normalizeRole(ur.roles.role_name));
      
      if (!userRoles.includes(requestedRole)) {
        logger.warn(`Login attempt failed: User ${credentials.email} attempted to login with invalid role ${credentials.role}`);
        throw new AppError(403, `You do not have permission to login as ${credentials.role}`);
      }

      const token = jwt.sign(
        {
          userId: user.user_id.toString(),
          email: user.email,
          role: requestedRole,
          roles: userRoles,
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      logger.info(`User ${credentials.email} successfully logged in as ${requestedRole}`);

      return {
        token,
        user: {
          id: user.user_id,
          email: user.email,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          roles: userRoles,
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Login error:', {
        email: credentials.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new AppError(500, 'An unexpected error occurred');
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
      const requestedRole = normalizeRole(data.role);

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

      const userRoles = user.user_roles.map(ur => normalizeRole(ur.roles.role_name));

      const token = jwt.sign(
        {
          userId: user.user_id.toString(),
          email: user.email,
          role: requestedRole,
          roles: userRoles,
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      logger.info(`User ${data.email} successfully registered as ${requestedRole}`);

      return {
        token,
        user: {
          id: user.user_id,
          email: user.email,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          roles: userRoles,
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Registration error:', {
        email: data.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new AppError(500, 'An unexpected error occurred');
    }
  }
}