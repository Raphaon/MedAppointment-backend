import prisma from '../utils/prisma';
import { doctorProfileSchema } from '../utils/validation';
import { MedicalSpecialty } from '@prisma/client';

export const doctorService = {
  async createDoctorProfile(
    userId: string,
    data: {
      licenseNumber: string;
      specialty: MedicalSpecialty;
      yearsExperience: number;
      bio?: string;
      consultationFee?: number;
      availableFrom?: string;
      availableTo?: string;
    }
  ) {
    const validatedData = doctorProfileSchema.parse(data);

    // Vérifier si le profil existe déjà
    const existingProfile = await prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new Error('DOCTOR_PROFILE_ALREADY_EXISTS');
    }

    // Vérifier si le numéro de licence existe déjà
    const existingLicense = await prisma.doctorProfile.findUnique({
      where: { licenseNumber: validatedData.licenseNumber },
    });

    if (existingLicense) {
      throw new Error('LICENSE_NUMBER_ALREADY_EXISTS');
    }

    const profile = await prisma.doctorProfile.create({
      data: {
        userId,
        ...validatedData,
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

  async updateDoctorProfile(
    userId: string,
    data: {
      specialty?: MedicalSpecialty;
      yearsExperience?: number;
      bio?: string;
      consultationFee?: number;
      availableFrom?: string;
      availableTo?: string;
    }
  ) {
    const profile = await prisma.doctorProfile.update({
      where: { userId },
      data,
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

  async getDoctorProfile(userId: string) {
    const profile = await prisma.doctorProfile.findUnique({
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
      throw new Error('DOCTOR_PROFILE_NOT_FOUND');
    }

    return profile;
  },

  async getAllDoctors(specialty?: MedicalSpecialty) {
    const doctors = await prisma.doctorProfile.findMany({
      where: specialty ? { specialty } : undefined,
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

    return doctors;
  },
};
