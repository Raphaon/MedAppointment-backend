import prisma from '../utils/prisma';
import { updateUserSchema } from '../utils/validation';
import { UserRole } from '@prisma/client';

export const userService = {
  async getAllUsers(role?: UserRole) {
    const users = await prisma.user.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  },

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        doctorProfile: true,
        patientProfile: true,
      },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    return user;
  },

  async updateUser(userId: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    isActive?: boolean;
  }) {
    const validatedData = updateUserSchema.parse(data);

    const user = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return user;
  },

  async deleteUser(userId: string) {
    await prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Utilisateur supprimé avec succès' };
  },

  async getDoctors() {
    const doctors = await prisma.user.findMany({
      where: { role: UserRole.DOCTOR },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        doctorProfile: true,
      },
    });

    return doctors;
  },

  async getPatients() {
    const patients = await prisma.user.findMany({
      where: { role: UserRole.PATIENT },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        patientProfile: true,
      },
    });

    return patients;
  },
};
