import { Request } from 'express';

export type Role = 'admin' | 'tutor' | 'parent' | 'student';

export interface UserRequest extends Request {
  user?: {
    id: string;
    roles: string[];
  };
}

export interface LoginUserDTO {
  email: string;
  password: string;
  role: string;
}

export interface RegisterUserDTO extends LoginUserDTO {
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}
