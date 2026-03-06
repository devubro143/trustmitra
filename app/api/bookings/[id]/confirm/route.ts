import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createAuditLog, queueNotification } from '@/lib/events';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CUSTOMER') return NextResponse.json({ error: 'Customer login required.' }, { status: 401 });

  const { id } = await params;
  const booking = await prisma.booking.findUnique({ where: { id }, include: { payment: true, customer: true, worker: { include: { user: true } } } });
  if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  if (booking.customer.userId !== user.id) return NextResponse.json({ error: 'This booking does not belong to you.' }, { status: 403 });
  if (booking.status !== 'COMPLETED') return NextResponse.json({ error: 'Only completed bookings can be confirmed.' }, { status: 400 });

  await prisma.booking.update({
    where: { id },
    data: {
      customerConfirmed: true,
      statusLogs: {
        create: { status: 'COMPLETED', note: 'Customer confirmed job completion and payout release.' }
      },
      payment: booking.payment ? {
        update: {
          status: 'RELEASED',
          releaseDueAt: new Date()
        }
      } : undefined
    }
  });

  await Promise.all([
    createAuditLog({ actorUserId: user.id, action: 'booking.confirmed', entityType: 'booking', entityId: id }),
    booking.worker ? queueNotification({ userId: booking.worker.user.id, bookingId: id, template: 'payout_released', message: 'Customer confirmed completion. Your payout is released.' }) : Promise.resolve(null)
  ]);

  return NextResponse.json({ message: 'Completion confirmed. Worker payout released.' });
}
