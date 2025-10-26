import prisma from '../utils/prisma';
import { createAppointmentSchema, updateAppointmentSchema } from '../utils/validation';
import { AppointmentStatus, UserRole } from '@prisma/client';

export const appointmentService = {
  async createAppointment(data: {
    doctorId: string;
    patientId: string;
    appointmentDate: string;
    duration?: number;
    reason: string;
    notes?: string;
  }) {
    const validatedData = createAppointmentSchema.parse(data);

    // Vérifier que le médecin existe et est bien un médecin
    const doctor = await prisma.user.findUnique({
      where: { id: validatedData.doctorId },
    });

    if (!doctor || doctor.role !== UserRole.DOCTOR) {
      throw new Error('INVALID_DOCTOR');
    }

    // Vérifier que le patient existe et est bien un patient
    const patient = await prisma.user.findUnique({
      where: { id: validatedData.patientId },
    });

    if (!patient || patient.role !== UserRole.PATIENT) {
      throw new Error('INVALID_PATIENT');
    }

    // Vérifier la disponibilité (pas de rendez-vous existant à la même date)
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: validatedData.doctorId,
        appointmentDate: new Date(validatedData.appointmentDate),
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      },
    });

    if (existingAppointment) {
      throw new Error('TIME_SLOT_NOT_AVAILABLE');
    }

    const appointment = await prisma.appointment.create({
      data: {
        doctorId: validatedData.doctorId,
        patientId: validatedData.patientId,
        appointmentDate: new Date(validatedData.appointmentDate),
        duration: validatedData.duration || 30,
        reason: validatedData.reason,
        notes: validatedData.notes,
      },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            doctorProfile: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return appointment;
  },

  async getAppointmentById(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            doctorProfile: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new Error('APPOINTMENT_NOT_FOUND');
    }

    return appointment;
  },

  async getAppointmentsByDoctor(doctorId: string, status?: AppointmentStatus) {
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        status: status ? status : undefined,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { appointmentDate: 'asc' },
    });

    return appointments;
  },

  async getAppointmentsByPatient(patientId: string, status?: AppointmentStatus) {
    const appointments = await prisma.appointment.findMany({
      where: {
        patientId,
        status: status ? status : undefined,
      },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            doctorProfile: true,
          },
        },
      },
      orderBy: { appointmentDate: 'asc' },
    });

    return appointments;
  },

  async getAllAppointments(status?: AppointmentStatus) {
    const appointments = await prisma.appointment.findMany({
      where: status ? { status } : undefined,
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { appointmentDate: 'asc' },
    });

    return appointments;
  },

  async updateAppointment(
    appointmentId: string,
    data: {
      appointmentDate?: string;
      duration?: number;
      reason?: string;
      notes?: string;
      status?: AppointmentStatus;
    }
  ) {
    const validatedData = updateAppointmentSchema.parse(data);

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        appointmentDate: validatedData.appointmentDate
          ? new Date(validatedData.appointmentDate)
          : undefined,
        duration: validatedData.duration,
        reason: validatedData.reason,
        notes: validatedData.notes,
        status: validatedData.status,
      },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return appointment;
  },

  async cancelAppointment(appointmentId: string) {
    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.CANCELLED },
    });

    return appointment;
  },

  async deleteAppointment(appointmentId: string) {
    await prisma.appointment.delete({
      where: { id: appointmentId },
    });

    return { message: 'Rendez-vous supprimé avec succès' };
  },
};
