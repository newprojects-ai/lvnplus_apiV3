import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import type { RegisterUserDTO, LoginUserDTO } from '../types/index';

const authService = new AuthService();

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userData: RegisterUserDTO = req.body;
    const { user, token } = await authService.register(userData);
    
    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const credentials: LoginUserDTO = req.body;
    const { user, token } = await authService.login(credentials);
    
    res.json({
      message: 'Login successful',
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};