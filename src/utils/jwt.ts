import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { AuthPayload } from '../types/express';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'fallback_secret_key';
const ACCESS_TOKEN_EXPIRES: SignOptions['expiresIn'] =
  (process.env.ACCESS_TOKEN_EXPIRES as SignOptions['expiresIn']) || '24h';

export const generateAccessToken = (payload: AuthPayload): string => {
  const options: SignOptions = { expiresIn: ACCESS_TOKEN_EXPIRES };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): AuthPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
