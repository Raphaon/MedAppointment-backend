import { Router } from 'express';
import { patientController } from '../controllers/patient.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Routes pour médecins et admins
router.get('/', requireRole(UserRole.ADMIN, UserRole.DOCTOR), patientController.getAllPatients);
router.get('/:userId', requireRole(UserRole.ADMIN, UserRole.DOCTOR), patientController.getPatientProfile);

// Routes pour patients uniquement
router.post('/profile', requireRole(UserRole.PATIENT), patientController.createPatientProfile);
router.put('/profile', requireRole(UserRole.PATIENT), patientController.updatePatientProfile);
router.get('/profile/me', requireRole(UserRole.PATIENT), patientController.getMyPatientProfile);

export default router;
