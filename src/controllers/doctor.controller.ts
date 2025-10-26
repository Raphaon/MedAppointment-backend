import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import { doctorService } from '../services/doctor.service';

export const doctorController = {
  async createDoctorProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const profile = await doctorService.createDoctorProfile(req.user.userId, req.body);
      res.status(201).json({ message: 'Profil médecin créé', profile });
    } catch (error: any) {
      if (error.message === 'DOCTOR_PROFILE_ALREADY_EXISTS') {
        res.status(409).json({ error: 'Ce profil médecin existe déjà' });
        return;
      }
      if (error.message === 'LICENSE_NUMBER_ALREADY_EXISTS') {
        res.status(409).json({ error: 'Ce numéro de licence est déjà utilisé' });
        return;
      }
      next(error);
    }
  },

  async updateDoctorProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const profile = await doctorService.updateDoctorProfile(req.user.userId, req.body);
      res.status(200).json({ message: 'Profil médecin mis à jour', profile });
    } catch (error: any) {
      if (error.message === 'DOCTOR_PROFILE_NOT_FOUND') {
        res.status(404).json({ error: 'Profil médecin introuvable' });
        return;
      }
      next(error);
    }
  },

  async getDoctorProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const profile = await doctorService.getDoctorProfile(userId);
      res.status(200).json({ profile });
    } catch (error: any) {
      if (error.message === 'DOCTOR_PROFILE_NOT_FOUND') {
        res.status(404).json({ error: 'Profil médecin introuvable' });
        return;
      }
      next(error);
    }
  },

  async getMyDoctorProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const profile = await doctorService.getDoctorProfile(req.user.userId);
      res.status(200).json({ profile });
    } catch (error: any) {
      if (error.message === 'DOCTOR_PROFILE_NOT_FOUND') {
        res.status(404).json({ error: 'Profil médecin introuvable' });
        return;
      }
      next(error);
    }
  },

  async getAllDoctors(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { specialty } = req.query;
      const doctors = await doctorService.getAllDoctors(specialty as any);
      res.status(200).json({ doctors, count: doctors.length });
    } catch (error) {
      next(error);
    }
  },
};
