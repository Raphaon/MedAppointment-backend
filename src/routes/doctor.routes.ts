import { Router } from 'express';
import { doctorController } from '../controllers/doctor.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Routes publiques (authentifiées)
router.get('/', doctorController.getAllDoctors);
router.get('/:userId', doctorController.getDoctorProfile);

// Routes pour médecins uniquement
router.post('/profile', requireRole(UserRole.DOCTOR), doctorController.createDoctorProfile);
router.put('/profile', requireRole(UserRole.DOCTOR), doctorController.updateDoctorProfile);
router.get('/profile/me', requireRole(UserRole.DOCTOR), doctorController.getMyDoctorProfile);

export default router;
