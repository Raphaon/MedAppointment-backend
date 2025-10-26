import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Routes pour les admins uniquement
router.get('/', requireRole(UserRole.ADMIN), userController.getAllUsers);
router.get('/doctors', userController.getDoctors);
router.get('/patients', requireRole(UserRole.ADMIN, UserRole.DOCTOR), userController.getPatients);
router.get('/:id', userController.getUserById);
router.put('/:id', requireRole(UserRole.ADMIN), userController.updateUser);
router.delete('/:id', requireRole(UserRole.ADMIN), userController.deleteUser);

export default router;
