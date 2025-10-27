import { Request } from 'express';
import { UserRole } from '@prisma/client';

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  mimetype: string;
  size: number;
  filename: string;
  path: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
  file?: UploadedFile;
  files?: UploadedFile[];
}
