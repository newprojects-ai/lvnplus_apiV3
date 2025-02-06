import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { RegisterUserDTO, LoginUserDTO, AuthResponse } from '../types';
import { UnauthorizedError, ValidationError } from '../utils/errors';

export class AuthService {
  async register(data: RegisterUserDTO): Promise<AuthResponse> {
    const existingUser = await prisma.users.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Default role if none provided
    const roles = data.roles?.length ? data.roles : ['STUDENT']

    const user = await prisma.users.create({
      data: {
        email: data.email,
        password: hashedPassword,
        first_name: data.firstName,
        last_name: data.lastName,
        user_roles: {
          create: roles.map(role => ({
            roles: {
              connect: {
                role_name: role,
              },
            },
          })),
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

    // Create initial student progress record if user has STUDENT role
    if (roles.includes('STUDENT')) {
      await prisma.student_progress.create({
        data: {
          user_id: user.user_id,
          level: 1,
          current_xp: 0,
          next_level_xp: 1000,
          streak_days: 0,
          last_activity_date: new Date(),
          total_points: 0
        }
      });
    }

    const token = this.generateToken(user);

    return {
      user: this.formatUserResponse(user),
      token,
    };
  }

  async login(credentials: LoginUserDTO): Promise<AuthResponse> {
    try {
      console.log('Login attempt:', {
        email: credentials.email,
        requestedRole: credentials.role.toUpperCase() // Normalize to uppercase
      });

      const user = await prisma.users.findUnique({
        where: { email: credentials.email },
        include: {
          user_roles: {
            include: {
              roles: true,
            },
          },
        },
      });

      console.log('Raw user data:', JSON.stringify(user, null, 2));

      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }

      if (!user.active) {
        throw new UnauthorizedError('Account is inactive');
      }

      console.log('Password verification:', {
        hasPassword: !!credentials.password,
        hasHash: !!user.password,
        passwordLength: credentials.password?.length,
        hashLength: user.password?.length
      });

      if (!credentials.password || !user.password) {
        throw new UnauthorizedError('Invalid email or password');
      }

      const isValidPassword = await bcrypt.compare(
        credentials.password,
        user.password
      );

      if (!isValidPassword) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Check if user has the requested role
      const userRoles = user.user_roles.map(ur => ur.roles.role_name.toUpperCase()); // Normalize to uppercase
      console.log('User roles:', userRoles);
      
      if (!userRoles.includes(credentials.role.toUpperCase())) { // Normalize to uppercase
        throw new UnauthorizedError('User is not authorized for the requested role');
      }

      // Generate token with the specific role
      const token = this.generateToken(user, credentials.role.toUpperCase()); // Normalize to uppercase

      const response = {
        user: this.formatUserResponse(user),
        token,
      };
      console.log('Login response:', {
        userId: response.user.id,
        email: response.user.email,
        roles: response.user.roles
      });

      return response;
    } catch (error) {
      console.error('Login error:', {
        email: credentials.email,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : 'Unknown error'
      });
      throw error;
    }
  }

  private generateToken(user: any, role: string): string {
    try {
      console.log('Generating token with:', {
        userId: user.user_id?.toString(),
        email: user.email,
        role,
        jwtSecret: process.env.JWT_SECRET ? 'present' : 'missing'
      });

      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }

      if (!user.user_id) {
        throw new Error('User ID is missing');
      }

      return jwt.sign(
        {
          userId: user.user_id.toString(),
          email: user.email,
          role,
        },
        process.env.JWT_SECRET,
        { 
          expiresIn: '24h',
          algorithm: 'HS256'
        }
      );
    } catch (error) {
      console.error('Error generating token:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        user: {
          id: user?.user_id,
          email: user?.email
        },
        role
      });
      throw error;
    }
  }

  private formatUserResponse(user: any) {
    return {
      id: user.user_id.toString(),
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      roles: user.user_roles.map((ur: any) => ur.roles.role_name.toUpperCase()), // Normalize to uppercase
    };
  }
}