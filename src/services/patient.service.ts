import prisma from '../utils/prisma';
import { patientProfileSchema } from '../utils/validation';

export const patientService = {
  async createPatientProfile(
    userId: string,
    data: {
      dateOfBirth?: string;
      bloodGroup?: string;
      allergies?: string;
      medicalHistory?: string;
      emergencyContact?: string;
    }
  ) {
    const validatedData = patientProfileSchema.parse(data);

    // Vérifier si le profil existe déjà
    const existingProfile = await prisma.patientProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new Error('PATIENT_PROFILE_ALREADY_EXISTS');
    }

    const profile = await prisma.patientProfile.create({
      data: {
        userId,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : undefined,
        bloodGroup: validatedData.bloodGroup,
        allergies: validatedData.allergies,
        medicalHistory: validatedData.medicalHistory,
        emergencyContact: validatedData.emergencyContact,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    return profile;
  },

  async updatePatientProfile(
    userId: string,
    data: {
      dateOfBirth?: string;
      bloodGroup?: string;
      allergies?: string;
      medicalHistory?: string;
      emergencyContact?: string;
    }
  ) {
    const validatedData = patientProfileSchema.parse(data);

    const profile = await prisma.patientProfile.update({
      where: { userId },
      data: {
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : undefined,
        bloodGroup: validatedData.bloodGroup,
        allergies: validatedData.allergies,
        medicalHistory: validatedData.medicalHistory,
        emergencyContact: validatedData.emergencyContact,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    return profile;
  },

  async getPatientProfile(userId: string) {
    const profile = await prisma.patientProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            isActive: true,
          },
        },
      },
    });

    if (!profile) {
      throw new Error('PATIENT_PROFILE_NOT_FOUND');
    }

    return profile;
  },

  async getAllPatients() {
    const patients = await prisma.patientProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return patients;
  },
};
