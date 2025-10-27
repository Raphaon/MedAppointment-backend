import { Router } from 'express';
import { medicalRecordController } from '../controllers/medicalRecord.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { medicalDocumentUpload } from '../middlewares/upload.middleware';

const router = Router();

router.use(requireAuth);

router.post('/', medicalRecordController.create);
router.get('/patient/:patientId', medicalRecordController.getByPatient);
router.get('/:id', medicalRecordController.getById);
router.put('/:id', medicalRecordController.update);
router.delete('/:id', medicalRecordController.remove);

router.get('/:recordId/documents', medicalRecordController.listDocuments);
router.post(
  '/:recordId/documents',
  medicalDocumentUpload,
  medicalRecordController.uploadDocument
);
router.get('/:recordId/documents/:documentId', medicalRecordController.downloadDocument);
router.delete('/:recordId/documents/:documentId', medicalRecordController.deleteDocument);

export default router;
