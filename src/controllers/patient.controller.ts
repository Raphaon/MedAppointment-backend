import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import { patientService } from '../services/patient.service';

export const patientController = {
  async createPatientProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const profile = await patientService.createPatientProfile(req.user.userId, req.body);
      res.status(201).json({ message: 'Profil patient créé', profile });
    } catch (error: any) {
      if (error.message === 'PATIENT_PROFILE_ALREADY_EXISTS') {
        res.status(409).json({ error: 'Ce profil patient existe déjà' });
        return;
      }
      next(error);
    }
  },

  async updatePatientProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const profile = await patientService.updatePatientProfile(req.user.userId, req.body);
      res.status(200).json({ message: 'Profil patient mis à jour', profile });
    } catch (error: any) {
      if (error.message === 'PATIENT_PROFILE_NOT_FOUND') {
        res.status(404).json({ error: 'Profil patient introuvable' });
        return;
      }
      next(error);
    }
  },

  async getPatientProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const profile = await patientService.getPatientProfile(userId);
      res.status(200).json({ profile });
    } catch (error: any) {
      if (error.message === 'PATIENT_PROFILE_NOT_FOUND') {
        res.status(404).json({ error: 'Profil patient introuvable' });
        return;
      }
      next(error);
    }
  },

  async getMyPatientProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const profile = await patientService.getPatientProfile(req.user.userId);
      res.status(200).json({ profile });
    } catch (error: any) {
      if (error.message === 'PATIENT_PROFILE_NOT_FOUND') {
        res.status(404).json({ error: 'Profil patient introuvable' });
        return;
      }
      next(error);
    }
  },

  async getAllPatients(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const patients = await patientService.getAllPatients();
      res.status(200).json({ patients, count: patients.length });
    } catch (error) {
      next(error);
    }
  },
};
