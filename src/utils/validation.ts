import { z } from 'zod';
import { UserRole, MedicalSpecialty, AppointmentStatus } from '@prisma/client';

// Validation pour l'inscription
export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
});

// Validation pour la connexion
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

// Validation pour la mise à jour d'un utilisateur
export const updateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Validation pour le profil médecin
export const doctorProfileSchema = z.object({
  licenseNumber: z.string().min(5, 'Le numéro de licence doit contenir au moins 5 caractères'),
  specialty: z.nativeEnum(MedicalSpecialty),
  yearsExperience: z.number().min(0, 'L\'expérience ne peut pas être négative'),
  bio: z.string().optional(),
  consultationFee: z.number().min(0).optional(),
  availableFrom: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:mm requis').optional(),
  availableTo: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:mm requis').optional(),
});

// Validation pour le profil patient
export const patientProfileSchema = z.object({
  dateOfBirth: z.string().datetime().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  emergencyContact: z.string().optional(),
});

// Validation pour la création d'un rendez-vous
export const createAppointmentSchema = z.object({
  doctorId: z.string().uuid('ID médecin invalide'),
  patientId: z.string().uuid('ID patient invalide'),
  appointmentDate: z.string().datetime('Date invalide'),
  duration: z.number().min(15).max(180).optional(),
  reason: z.string().min(5, 'La raison doit contenir au moins 5 caractères'),
  notes: z.string().optional(),
});

// Validation pour la mise à jour d'un rendez-vous
export const updateAppointmentSchema = z.object({
  appointmentDate: z.string().datetime().optional(),
  duration: z.number().min(15).max(180).optional(),
  reason: z.string().min(5).optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
});
