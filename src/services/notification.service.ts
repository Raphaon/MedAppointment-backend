import prisma from '../utils/prisma';
import {
  notificationCreateSchema,
  notificationUpdateSchema,
} from '../utils/validation';
import { NotificationType } from '@prisma/client';

export interface NotificationFilters {
  onlyUnread?: boolean;
  limit?: number;
  since?: Date;
}

export const notificationService = {
  async listForUser(userId: string, filters: NotificationFilters = {}) {
    const where = {
      userId,
      isRead: filters.onlyUnread ? false : undefined,
      createdAt: filters.since ? { gt: filters.since } : undefined,
    };

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit && filters.limit > 0 ? filters.limit : undefined,
      }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, unreadCount };
  },

  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
    metadata?: Record<string, unknown>;
    expiresAt?: string;
  }) {
    const { expiresAt, ...rest } = notificationCreateSchema.parse(data);

    const notification = await prisma.notification.create({
      data: {
        ...rest,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
    });

    return notification;
  },

  async updateNotification(notificationId: string, data: { isRead?: boolean }) {
    const validated = notificationUpdateSchema.parse(data);

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        title: validated.title,
        message: validated.message,
        type: validated.type,
        link: validated.link,
        metadata: validated.metadata,
        isRead:
          typeof validated.isRead === 'boolean'
            ? validated.isRead
            : undefined,
        readAt:
          typeof validated.isRead === 'boolean'
            ? validated.isRead
              ? new Date()
              : null
            : undefined,
      },
    });

    return notification;
  },

  async markAsRead(userId: string, notificationId: string, isRead: boolean) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('NOTIFICATION_NOT_FOUND');
    }

    if (notification.userId !== userId) {
      throw new Error('NOTIFICATION_FORBIDDEN');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead,
        readAt: isRead ? new Date() : null,
      },
    });
  },

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  },

  async deleteNotification(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('NOTIFICATION_NOT_FOUND');
    }

    if (notification.userId !== userId) {
      throw new Error('NOTIFICATION_FORBIDDEN');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });
  },

  async clearNotifications(userId: string, scope: 'all' | 'read' = 'read') {
    await prisma.notification.deleteMany({
      where: {
        userId,
        isRead: scope === 'read' ? true : undefined,
      },
    });
  },
};
