import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { MEDICAL_DOCUMENTS_DIR } from '../config/storage';
import { UploadedFile } from '../types/express';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
]);

fs.mkdirSync(MEDICAL_DOCUMENTS_DIR, { recursive: true });

const parseContentDisposition = (headerLine: string) => {
  const filenameMatch = headerLine.match(/filename="(.+?)"/i);
  const nameMatch = headerLine.match(/name="(.+?)"/i);
  return {
    fieldName: nameMatch ? nameMatch[1] : undefined,
    fileName: filenameMatch ? filenameMatch[1] : undefined,
  };
};

const sanitizeFileName = (fileName: string) =>
  fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

export const medicalDocumentUpload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const contentType = req.headers['content-type'];

  if (!contentType || !contentType.startsWith('multipart/form-data')) {
    res.status(400).json({ error: 'Type de contenu non supporté' });
    return;
  }

  const boundaryMatch = contentType.match(/boundary=(.+)$/);

  if (!boundaryMatch) {
    res.status(400).json({ error: 'Données multipart invalides' });
    return;
  }

  const boundary = `--${boundaryMatch[1]}`;
  const chunks: Buffer[] = [];
  let totalSize = 0;

  if (typeof req.body !== 'object' || req.body === null) {
    (req as any).body = {};
  }

  req.on('data', (chunk: Buffer) => {
    totalSize += chunk.length;
    if (totalSize > MAX_FILE_SIZE * 2) {
      req.pause();
      res.status(413).json({ error: 'Le fichier est trop volumineux' });
      req.removeAllListeners('data');
      req.removeAllListeners('end');
      return;
    }
    chunks.push(chunk);
  });

  req.on('end', () => {
    const buffer = Buffer.concat(chunks);
    const parts = buffer
      .toString('binary')
      .split(boundary)
      .map(part => part.trim())
      .filter(part => part && part !== '--');

    let uploadedFile: UploadedFile | undefined;

    for (const part of parts) {
      const headerEndIndex = part.indexOf('\r\n\r\n');
      if (headerEndIndex === -1) {
        continue;
      }

      const rawHeaders = part.slice(0, headerEndIndex).split('\r\n');
      const bodyBinary = part.slice(headerEndIndex + 4);
      const contentDisposition = rawHeaders.find(header =>
        header.toLowerCase().startsWith('content-disposition')
      );

      if (!contentDisposition) {
        continue;
      }

      const { fieldName, fileName } = parseContentDisposition(contentDisposition);

      if (!fieldName) {
        continue;
      }

      if (fieldName !== 'file' || !fileName) {
        // Inject text fields into req.body
        const value = bodyBinary.replace(/\r\n$/, '');
        (req.body as Record<string, unknown>)[fieldName] = value;
        continue;
      }

      const contentTypeHeader = rawHeaders.find(header =>
        header.toLowerCase().startsWith('content-type')
      );

      const mimeType = contentTypeHeader
        ? contentTypeHeader.split(':')[1]?.trim()
        : 'application/octet-stream';

      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        res
          .status(400)
          .json({ error: `Type de fichier non supporté (${mimeType})` });
        return;
      }

      const fileBuffer = Buffer.from(bodyBinary.replace(/\r\n$/, ''), 'binary');

      if (fileBuffer.length > MAX_FILE_SIZE) {
        res.status(413).json({ error: 'Le fichier est trop volumineux' });
        return;
      }

      const sanitizedOriginal = sanitizeFileName(fileName);
      const extension = path.extname(sanitizedOriginal);
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
      const fullPath = path.join(MEDICAL_DOCUMENTS_DIR, uniqueName);

      fs.writeFileSync(fullPath, fileBuffer);

      uploadedFile = {
        fieldname: fieldName,
        originalname: sanitizedOriginal,
        mimetype: mimeType,
        size: fileBuffer.length,
        filename: uniqueName,
        path: fullPath,
      };
    }

    if (!uploadedFile) {
      res.status(400).json({ error: 'Aucun fichier trouvé dans la requête' });
      return;
    }

    (req as any).file = uploadedFile;
    next();
  });

  req.on('error', (error) => {
    next(error);
  });
};
