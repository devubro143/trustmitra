import { NotificationChannel, NotificationStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function queueNotification(input: {
  userId?: string | null;
  bookingId?: string | null;
  channel?: NotificationChannel;
  template: string;
  message: string;
  status?: NotificationStatus;
}) {
  return prisma.notificationEvent.create({
    data: {
      userId: input.userId ?? undefined,
      bookingId: input.bookingId ?? undefined,
      channel: input.channel ?? 'APP',
      template: input.template,
      message: input.message,
      status: input.status ?? 'PENDING'
    }
  });
}

export async function createAuditLog(input: {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue | string | null;
}) {
  return prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId ?? undefined,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: typeof input.metadata === 'string' ? input.metadata : input.metadata ? JSON.stringify(input.metadata) : undefined
    }
  });
}
