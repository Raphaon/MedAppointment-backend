import jwt from 'jsonwebtoken';
import { AuthPayload } from '../types/express';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || '24h';

export const generateAccessToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
};

export const verifyToken = (token: string): AuthPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
