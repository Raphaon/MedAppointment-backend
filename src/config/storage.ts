import path from 'path';

// Racine des fichiers uploadés (partagée entre les modules)
export const UPLOAD_ROOT = path.resolve(__dirname, '../../uploads');

// Dossier dédié aux documents médicaux
export const MEDICAL_DOCUMENTS_DIR = path.join(UPLOAD_ROOT, 'medical-documents');
