import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import { notificationService } from '../services/notification.service';
import { UserRole } from '@prisma/client';

const buildDocumentUrl = (id: string) => `/api/notifications/${id}`;

export const notificationController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const { unreadOnly, limit, since } = req.query;
      const sinceDate = since && !Number.isNaN(Date.parse(String(since)))
        ? new Date(String(since))
        : undefined;
      const parsedLimit = limit ? Number(limit) : undefined;
      const filters = {
        onlyUnread: unreadOnly === 'true',
        limit: parsedLimit && parsedLimit > 0 ? parsedLimit : undefined,
        since: sinceDate,
      };

      const { notifications, unreadCount } = await notificationService.listForUser(
        req.user.userId,
        filters
      );

      res.status(200).json({
        notifications,
        unreadCount,
        lastSyncAt: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.DOCTOR)) {
        res.status(403).json({ error: 'Accès refusé' });
        return;
      }

      const notification = await notificationService.createNotification(req.body);

      res.status(201).json({
        message: 'Notification créée',
        notification,
        links: { self: buildDocumentUrl(notification.id) },
      });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const { id } = req.params;
      const { isRead = true } = req.body as { isRead?: boolean };

      const notification = await notificationService.markAsRead(
        req.user.userId,
        id,
        Boolean(isRead)
      );

      res.status(200).json({
        message: `Notification ${isRead ? 'marquée comme lue' : 'marquée comme non lue'}`,
        notification,
      });
    } catch (error: any) {
      if (error.message === 'NOTIFICATION_NOT_FOUND') {
        res.status(404).json({ error: 'Notification introuvable' });
        return;
      }
      if (error.message === 'NOTIFICATION_FORBIDDEN') {
        res.status(403).json({ error: 'Accès refusé' });
        return;
      }
      next(error);
    }
  },

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      await notificationService.markAllAsRead(req.user.userId);

      res.status(200).json({ message: 'Toutes les notifications ont été marquées comme lues' });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const { id } = req.params;

      await notificationService.deleteNotification(req.user.userId, id);

      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'NOTIFICATION_NOT_FOUND') {
        res.status(404).json({ error: 'Notification introuvable' });
        return;
      }
      if (error.message === 'NOTIFICATION_FORBIDDEN') {
        res.status(403).json({ error: 'Accès refusé' });
        return;
      }
      next(error);
    }
  },

  async clear(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const { scope } = req.query;
      const allowedScopes = new Set(['all', 'read']);
      const resolvedScope = allowedScopes.has(String(scope)) ? (scope as 'all' | 'read') : 'read';

      await notificationService.clearNotifications(req.user.userId, resolvedScope);

      res.status(200).json({ message: 'Notifications supprimées' });
    } catch (error) {
      next(error);
    }
  },
};
