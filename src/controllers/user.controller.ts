import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import { userService } from '../services/user.service';

export const userController = {
  async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { role } = req.query;
      const users = await userService.getAllUsers(role as any);
      res.status(200).json({ users, count: users.length });
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      res.status(200).json({ user });
    } catch (error: any) {
      if (error.message === 'USER_NOT_FOUND') {
        res.status(404).json({ error: 'Utilisateur introuvable' });
        return;
      }
      next(error);
    }
  },

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.updateUser(id, req.body);
      res.status(200).json({ message: 'Utilisateur mis à jour', user });
    } catch (error: any) {
      if (error.message === 'USER_NOT_FOUND') {
        res.status(404).json({ error: 'Utilisateur introuvable' });
        return;
      }
      next(error);
    }
  },

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await userService.deleteUser(id);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'USER_NOT_FOUND') {
        res.status(404).json({ error: 'Utilisateur introuvable' });
        return;
      }
      next(error);
    }
  },

  async getDoctors(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const doctors = await userService.getDoctors();
      res.status(200).json({ doctors, count: doctors.length });
    } catch (error) {
      next(error);
    }
  },

  async getPatients(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const patients = await userService.getPatients();
      res.status(200).json({ patients, count: patients.length });
    } catch (error) {
      next(error);
    }
  },
};
