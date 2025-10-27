import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', error);

  // Erreurs de validation Zod
  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Validation échouée',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
    return;
  }

  // Erreurs Prisma
  if (error.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({ error: 'Erreur de base de données', message: error.message });
    return;
  }

  // Erreur générique
  res.status(500).json({ error: 'Erreur serveur interne', message: error.message });
};
