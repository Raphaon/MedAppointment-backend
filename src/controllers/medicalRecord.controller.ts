import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import {
  medicalRecordService,
  type MedicalDocumentEntity,
  type MedicalRecordWithRelations,
} from '../services/medicalRecord.service';
import { UserRole } from '@prisma/client';
import { UPLOAD_ROOT } from '../config/storage';
import { buildAbsolutePath } from '../utils/file';

const mapDocument = (doc: MedicalDocumentEntity) => ({
  ...doc,
  fileUrl: `/uploads/${doc.filePath}`,
  downloadUrl: `/api/medical-records/${doc.recordId}/documents/${doc.id}`,
});

const mapRecord = (record: MedicalRecordWithRelations) => ({
  ...record,
  documents: record.documents ? record.documents.map(mapDocument) : [],
});

const ensureAccessToRecord = (
  req: AuthRequest,
  record: MedicalRecordWithRelations
) => {
  if (!req.user) {
    return false;
  }

  if (req.user.role === UserRole.ADMIN) {
    return true;
  }

  if (req.user.role === UserRole.DOCTOR) {
    return !record.doctorId || record.doctorId === req.user.userId;
  }

  if (req.user.role === UserRole.PATIENT) {
    return record.patientId === req.user.userId;
  }

  return false;
};

export const medicalRecordController = {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.DOCTOR)) {
        res.status(403).json({ error: 'Accès refusé' });
        return;
      }

      if (req.user.role === UserRole.DOCTOR && !req.body.doctorId) {
        req.body.doctorId = req.user.userId;
      }

      const record = await medicalRecordService.createRecord(req.body);
      res.status(201).json({ message: 'Dossier médical créé', record: mapRecord(record) });
    } catch (error: any) {
      if (error.message === 'INVALID_PATIENT') {
        res.status(400).json({ error: 'Patient invalide' });
        return;
      }
      if (error.message === 'INVALID_DOCTOR') {
        res.status(400).json({ error: 'Médecin invalide' });
        return;
      }
      next(error);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const { id } = req.params;
      const record = await medicalRecordService.getRecordById(id);

      if (!ensureAccessToRecord(req, record)) {
        res.status(403).json({ error: 'Accès refusé' });
        return;
      }

      res.status(200).json({ record: mapRecord(record) });
    } catch (error: any) {
      if (error.message === 'MEDICAL_RECORD_NOT_FOUND') {
        res.status(404).json({ error: 'Dossier médical introuvable' });
        return;
      }
      next(error);
    }
  },

  async getByPatient(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const { patientId } = req.params;

      if (req.user.role === UserRole.PATIENT && req.user.userId !== patientId) {
        res.status(403).json({ error: 'Accès refusé' });
        return;
      }

      const records = await medicalRecordService.getRecordsByPatient(patientId);
      const filteredRecords =
        req.user.role === UserRole.DOCTOR
          ? records.filter(
              (record: MedicalRecordWithRelations) =>
                !record.doctorId || record.doctorId === req.user?.userId
            )
          : records;

      res
        .status(200)
        .json({ records: filteredRecords.map(mapRecord), count: filteredRecords.length });
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.DOCTOR)) {
        res.status(403).json({ error: 'Accès refusé' });
        return;
      }

      const { id } = req.params;
      const existing = await medicalRecordService.getRecordById(id);

      if (
        req.user.role === UserRole.DOCTOR &&
        existing.doctorId &&
        existing.doctorId !== req.user.userId
      ) {
        res.status(403).json({ error: 'Accès refusé' });
        return;
      }

      const record = await medicalRecordService.updateRecord(id, req.body);

      res.status(200).json({ message: 'Dossier médical mis à jour', record: mapRecord(record) });
    } catch (error: any) {
      if (error.message === 'MEDICAL_RECORD_NOT_FOUND') {
        res.status(404).json({ error: 'Dossier médical introuvable' });
        return;
      }
      if (error.message === 'INVALID_DOCTOR') {
        res.status(400).json({ error: 'Médecin invalide' });
        return;
      }
      next(error);
    }
  },

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Accès refusé' });
        return;
      }

      const { id } = req.params;
      await medicalRecordService.deleteRecord(id);

      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'MEDICAL_RECORD_NOT_FOUND') {
        res.status(404).json({ error: 'Dossier médical introuvable' });
        return;
      }
      next(error);
    }
  },

  async uploadDocument(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const { recordId } = req.params;

      if (!req.file) {
        res.status(400).json({ error: 'Aucun fichier reçu' });
        return;
      }

      const record = await medicalRecordService.getRecordById(recordId);

      if (!ensureAccessToRecord(req, record)) {
        res.status(403).json({ error: 'Accès refusé' });
        return;
      }

      const document = await medicalRecordService.addDocument({
        recordId,
        file: req.file,
        uploaderId: req.user.userId,
      });

      res.status(201).json({
        message: 'Document ajouté',
        document: mapDocument(document),
      });
    } catch (error: any) {
      if (error.message === 'MEDICAL_RECORD_NOT_FOUND') {
        res.status(404).json({ error: 'Dossier médical introuvable' });
        return;
      }
      next(error);
    }
  },

  async listDocuments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const { recordId } = req.params;
      const record = await medicalRecordService.getRecordById(recordId);

      if (!ensureAccessToRecord(req, record)) {
        res.status(403).json({ error: 'Accès refusé' });
        return;
      }

      const documents = await medicalRecordService.getDocuments(recordId);
      res.status(200).json({ documents: documents.map(mapDocument), count: documents.length });
    } catch (error: any) {
      if (error.message === 'MEDICAL_RECORD_NOT_FOUND') {
        res.status(404).json({ error: 'Dossier médical introuvable' });
        return;
      }
      next(error);
    }
  },

  async downloadDocument(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const { recordId, documentId } = req.params;
      const record = await medicalRecordService.getRecordById(recordId);

      if (!ensureAccessToRecord(req, record)) {
        res.status(403).json({ error: 'Accès refusé' });
        return;
      }

      const document = await medicalRecordService.getDocument(documentId);

      if (document.recordId !== recordId) {
        res.status(404).json({ error: 'Document introuvable' });
        return;
      }

      const absolutePath = buildAbsolutePath(UPLOAD_ROOT, document.filePath);
      res.download(absolutePath, document.fileName);
    } catch (error: any) {
      if (
        error.message === 'MEDICAL_RECORD_NOT_FOUND' ||
        error.message === 'MEDICAL_DOCUMENT_NOT_FOUND'
      ) {
        res.status(404).json({ error: 'Document introuvable' });
        return;
      }
      next(error);
    }
  },

  async deleteDocument(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const { recordId, documentId } = req.params;
      const record = await medicalRecordService.getRecordById(recordId);

      if (!ensureAccessToRecord(req, record) && req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Accès refusé' });
        return;
      }

      const document = await medicalRecordService.getDocument(documentId);

      if (document.recordId !== recordId) {
        res.status(404).json({ error: 'Document introuvable' });
        return;
      }

      await medicalRecordService.deleteDocument(documentId);

      res.status(204).send();
    } catch (error: any) {
      if (
        error.message === 'MEDICAL_RECORD_NOT_FOUND' ||
        error.message === 'MEDICAL_DOCUMENT_NOT_FOUND'
      ) {
        res.status(404).json({ error: 'Document introuvable' });
        return;
      }
      next(error);
    }
  },
};
