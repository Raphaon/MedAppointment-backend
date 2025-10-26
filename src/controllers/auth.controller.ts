import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import { authService } from '../services/auth.service';

export const authController = {
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        message: 'Inscription réussie',
        user: result.user,
        token: result.token,
      });
    } catch (error: any) {
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        res.status(409).json({ error: 'Cet email est déjà utilisé' });
        return;
      }
      next(error);
    }
  },

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        message: 'Connexion réussie',
        user: result.user,
        token: result.token,
      });
    } catch (error: any) {
      if (error.message === 'INVALID_CREDENTIALS') {
        res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        return;
      }
      if (error.message === 'ACCOUNT_DISABLED') {
        res.status(403).json({ error: 'Ce compte a été désactivé' });
        return;
      }
      next(error);
    }
  },

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const user = await authService.getProfile(req.user.userId);
      res.status(200).json({ user });
    } catch (error: any) {
      if (error.message === 'USER_NOT_FOUND') {
        res.status(404).json({ error: 'Utilisateur introuvable' });
        return;
      }
      next(error);
    }
  },
};
