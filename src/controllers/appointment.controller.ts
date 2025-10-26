import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import { appointmentService } from '../services/appointment.service';
import { UserRole } from '@prisma/client';

export const appointmentController = {
  async createAppointment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const appointment = await appointmentService.createAppointment(req.body);
      res.status(201).json({ message: 'Rendez-vous créé', appointment });
    } catch (error: any) {
      if (error.message === 'INVALID_DOCTOR') {
        res.status(400).json({ error: 'Médecin invalide' });
        return;
      }
      if (error.message === 'INVALID_PATIENT') {
        res.status(400).json({ error: 'Patient invalide' });
        return;
      }
      if (error.message === 'TIME_SLOT_NOT_AVAILABLE') {
        res.status(409).json({ error: 'Ce créneau horaire n\'est pas disponible' });
        return;
      }
      next(error);
    }
  },

  async getAppointmentById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const appointment = await appointmentService.getAppointmentById(id);

      // Vérifier les permissions
      if (req.user && req.user.role !== UserRole.ADMIN) {
        if (
          req.user.userId !== appointment.doctorId &&
          req.user.userId !== appointment.patientId
        ) {
          res.status(403).json({ error: 'Accès refusé' });
          return;
        }
      }

      res.status(200).json({ appointment });
    } catch (error: any) {
      if (error.message === 'APPOINTMENT_NOT_FOUND') {
        res.status(404).json({ error: 'Rendez-vous introuvable' });
        return;
      }
      next(error);
    }
  },

  async getMyAppointments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const { status } = req.query;
      let appointments;

      if (req.user.role === UserRole.DOCTOR) {
        appointments = await appointmentService.getAppointmentsByDoctor(
          req.user.userId,
          status as any
        );
      } else if (req.user.role === UserRole.PATIENT) {
        appointments = await appointmentService.getAppointmentsByPatient(
          req.user.userId,
          status as any
        );
      } else {
        appointments = await appointmentService.getAllAppointments(status as any);
      }

      res.status(200).json({ appointments, count: appointments.length });
    } catch (error) {
      next(error);
    }
  },

  async getAppointmentsByDoctor(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { doctorId } = req.params;
      const { status } = req.query;

      const appointments = await appointmentService.getAppointmentsByDoctor(
        doctorId,
        status as any
      );

      res.status(200).json({ appointments, count: appointments.length });
    } catch (error) {
      next(error);
    }
  },

  async getAppointmentsByPatient(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const { status } = req.query;

      const appointments = await appointmentService.getAppointmentsByPatient(
        patientId,
        status as any
      );

      res.status(200).json({ appointments, count: appointments.length });
    } catch (error) {
      next(error);
    }
  },

  async getAllAppointments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const appointments = await appointmentService.getAllAppointments(status as any);
      res.status(200).json({ appointments, count: appointments.length });
    } catch (error) {
      next(error);
    }
  },

  async updateAppointment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const appointment = await appointmentService.updateAppointment(id, req.body);
      res.status(200).json({ message: 'Rendez-vous mis à jour', appointment });
    } catch (error: any) {
      if (error.message === 'APPOINTMENT_NOT_FOUND') {
        res.status(404).json({ error: 'Rendez-vous introuvable' });
        return;
      }
      next(error);
    }
  },

  async cancelAppointment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const appointment = await appointmentService.cancelAppointment(id);
      res.status(200).json({ message: 'Rendez-vous annulé', appointment });
    } catch (error: any) {
      if (error.message === 'APPOINTMENT_NOT_FOUND') {
        res.status(404).json({ error: 'Rendez-vous introuvable' });
        return;
      }
      next(error);
    }
  },

  async deleteAppointment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await appointmentService.deleteAppointment(id);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'APPOINTMENT_NOT_FOUND') {
        res.status(404).json({ error: 'Rendez-vous introuvable' });
        return;
      }
      next(error);
    }
  },
};
