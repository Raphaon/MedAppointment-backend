import prisma from '../utils/prisma';
import path from 'path';
import {
  medicalRecordCreateSchema,
  medicalRecordUpdateSchema,
} from '../utils/validation';
import { UPLOAD_ROOT } from '../config/storage';
import { buildAbsolutePath, deleteFileIfExists, toPosixPath } from '../utils/file';
import { Prisma, UserRole } from '@prisma/client';
import { UploadedFile } from '../types/express';

const baseRecordInclude = {
  patient: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
    },
  },
  doctor: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
    },
  },
  documents: true,
} as const;

export type MedicalRecordWithRelations = Prisma.MedicalRecordGetPayload<{
  include: typeof baseRecordInclude;
}>;

export type MedicalDocumentEntity = Prisma.MedicalDocumentGetPayload<{}>;

export const medicalRecordService = {
  async createRecord(data: {
    patientId: string;
    doctorId?: string;
    title: string;
    diagnosis?: string;
    treatment?: string;
    notes?: string;
    followUpDate?: string | null;
  }): Promise<MedicalRecordWithRelations> {
    const validated = medicalRecordCreateSchema.parse(data);

    const patient = await prisma.user.findUnique({ where: { id: validated.patientId } });
    if (!patient || patient.role !== UserRole.PATIENT) {
      throw new Error('INVALID_PATIENT');
    }

    if (validated.doctorId) {
      const doctor = await prisma.user.findUnique({ where: { id: validated.doctorId } });
      if (!doctor || doctor.role !== UserRole.DOCTOR) {
        throw new Error('INVALID_DOCTOR');
      }
    }

    const record = await prisma.medicalRecord.create({
      data: {
        patientId: validated.patientId,
        doctorId: validated.doctorId,
        title: validated.title,
        diagnosis: validated.diagnosis,
        treatment: validated.treatment,
        notes: validated.notes,
        followUpDate: validated.followUpDate
          ? new Date(validated.followUpDate)
          : validated.followUpDate === null
            ? null
            : undefined,
      },
      include: baseRecordInclude,
    });

    return record;
  },

  async getRecordById(recordId: string): Promise<MedicalRecordWithRelations> {
    const record = await prisma.medicalRecord.findUnique({
      where: { id: recordId },
      include: baseRecordInclude,
    });

    if (!record) {
      throw new Error('MEDICAL_RECORD_NOT_FOUND');
    }

    return record;
  },

  async getRecordsByPatient(patientId: string): Promise<MedicalRecordWithRelations[]> {
    const records = await prisma.medicalRecord.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: baseRecordInclude,
    });

    return records;
  },

  async updateRecord(
    recordId: string,
    data: {
      doctorId?: string;
      title?: string;
      diagnosis?: string;
      treatment?: string;
      notes?: string;
      followUpDate?: string | null;
    }
  ): Promise<MedicalRecordWithRelations> {
    const validated = medicalRecordUpdateSchema.parse(data);

    if (validated.doctorId) {
      const doctor = await prisma.user.findUnique({ where: { id: validated.doctorId } });
      if (!doctor || doctor.role !== UserRole.DOCTOR) {
        throw new Error('INVALID_DOCTOR');
      }
    }

    const existing = await prisma.medicalRecord.findUnique({ where: { id: recordId } });

    if (!existing) {
      throw new Error('MEDICAL_RECORD_NOT_FOUND');
    }

    const record = await prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        doctorId: validated.doctorId ?? existing.doctorId,
        title: validated.title,
        diagnosis: validated.diagnosis,
        treatment: validated.treatment,
        notes: validated.notes,
        followUpDate: validated.followUpDate
          ? new Date(validated.followUpDate)
          : validated.followUpDate === undefined
            ? existing.followUpDate
            : null,
      },
      include: baseRecordInclude,
    });

    return record;
  },

  async deleteRecord(recordId: string): Promise<void> {
    const existing = await prisma.medicalRecord.findUnique({
      where: { id: recordId },
      select: { id: true },
    });

    if (!existing) {
      throw new Error('MEDICAL_RECORD_NOT_FOUND');
    }

    const documents = await prisma.medicalDocument.findMany({
      where: { recordId },
    });

    await prisma.medicalRecord.delete({ where: { id: recordId } });

    await Promise.all(
      documents.map((doc) =>
        deleteFileIfExists(buildAbsolutePath(UPLOAD_ROOT, doc.filePath))
      )
    );

  },

  async addDocument(options: {
    recordId: string;
    file: UploadedFile;
    uploaderId?: string;
  }): Promise<MedicalDocumentEntity> {
    const record = await prisma.medicalRecord.findUnique({ where: { id: options.recordId } });

    if (!record) {
      throw new Error('MEDICAL_RECORD_NOT_FOUND');
    }

    const relativePath = toPosixPath(
      path.relative(UPLOAD_ROOT, options.file.path)
    );

    const document = await prisma.medicalDocument.create({
      data: {
        recordId: record.id,
        fileName: options.file.originalname,
        filePath: relativePath,
        mimeType: options.file.mimetype,
        fileSize: options.file.size,
        uploaderId: options.uploaderId,
      },
    });

    return document;
  },

  async getDocuments(recordId: string): Promise<MedicalDocumentEntity[]> {
    const documents = await prisma.medicalDocument.findMany({
      where: { recordId },
      orderBy: { uploadedAt: 'desc' },
    });

    return documents;
  },

  async getDocument(documentId: string): Promise<MedicalDocumentEntity> {
    const document = await prisma.medicalDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error('MEDICAL_DOCUMENT_NOT_FOUND');
    }

    return document;
  },

  async deleteDocument(documentId: string): Promise<MedicalDocumentEntity> {
    const document = await prisma.medicalDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error('MEDICAL_DOCUMENT_NOT_FOUND');
    }

    await prisma.medicalDocument.delete({ where: { id: documentId } });

    await deleteFileIfExists(buildAbsolutePath(UPLOAD_ROOT, document.filePath));

    return document;
  },
};
