import fs from 'fs';
import path from 'path';

export const toPosixPath = (value: string): string => value.replace(/\\/g, '/');

export const deleteFileIfExists = async (absolutePath: string): Promise<void> => {
  try {
    await fs.promises.access(absolutePath, fs.constants.F_OK);
    await fs.promises.unlink(absolutePath);
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return;
    }
    console.error(`Impossible de supprimer le fichier ${absolutePath}:`, error);
  }
};

export const buildAbsolutePath = (baseDir: string, relativePath: string): string => {
  return path.resolve(baseDir, relativePath);
};
