import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import { UserRole } from '@prisma/client';

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Accès refusé : permissions insuffisantes' });
      return;
    }

    next();
  };
};
