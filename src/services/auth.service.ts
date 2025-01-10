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
        password_hash: hashedPassword,
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

      console.log('User found:', {
        user: user ? {
          id: user.user_id,
          email: user.email,
          roles: user.user_roles.map(ur => ur.roles.role_name.toUpperCase()) // Normalize to uppercase
        } : null
      });

      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }

      if (!user.active) {
        throw new UnauthorizedError('Account is inactive');
      }

      const isValidPassword = await bcrypt.compare(
        credentials.password,
        user.password_hash
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
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private generateToken(user: any, role: string): string {
    try {
      return jwt.sign(
        {
          userId: user.user_id.toString(),
          email: user.email,
          role, // Include only the specific role being used for this session
        },
        process.env.JWT_SECRET!,
        { 
          expiresIn: '24h',
          algorithm: 'HS256'
        }
      );
    } catch (error) {
      console.error('Error generating token:', error);
      throw new Error('Failed to generate authentication token');
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