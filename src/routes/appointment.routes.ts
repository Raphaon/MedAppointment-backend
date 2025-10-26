import { Router } from 'express';
import { appointmentController } from '../controllers/appointment.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Routes communes
router.post('/', appointmentController.createAppointment);
router.get('/my-appointments', appointmentController.getMyAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.patch('/:id/cancel', appointmentController.cancelAppointment);

// Routes pour médecins et admins
router.get('/doctor/:doctorId', appointmentController.getAppointmentsByDoctor);
router.get('/patient/:patientId', requireRole(UserRole.ADMIN, UserRole.DOCTOR), appointmentController.getAppointmentsByPatient);

// Routes pour admins uniquement
router.get('/', requireRole(UserRole.ADMIN), appointmentController.getAllAppointments);
router.delete('/:id', requireRole(UserRole.ADMIN), appointmentController.deleteAppointment);

export default router;
