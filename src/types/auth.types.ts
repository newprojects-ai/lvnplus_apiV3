import type { Request } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';
import { Role } from './common.types';

// Auth and User types
export interface UserRequest extends Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>> {
  user?: {
    id: string;
    email: string;
    role?: Role;
    roles: string[];
    iat?: number;
    exp?: number;
  };
}

export interface LoginUserDTO {
  email: string;
  password: string;
}

export interface RegisterUserDTO extends LoginUserDTO {
  firstName: string;
  lastName: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    roles: string[];
  };
}
