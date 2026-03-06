import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createAuditLog, queueNotification } from '@/lib/events';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'WORKER') return NextResponse.json({ error: 'Worker login required.' }, { status: 401 });

  const { id } = await params;
  const booking = await prisma.booking.findUnique({ where: { id }, include: { worker: { include: { user: true } }, customer: { include: { user: true } } } });
  if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  if (booking.worker?.userId !== user.id) return NextResponse.json({ error: 'This booking is not assigned to you.' }, { status: 403 });

  await prisma.booking.update({
    where: { id },
    data: {
      status: 'ARRIVED',
      statusLogs: {
        create: { status: 'ARRIVED', note: 'Worker marked arrival at customer location.' }
      }
    }
  });

  await Promise.all([
    createAuditLog({ actorUserId: user.id, action: 'booking.arrived', entityType: 'booking', entityId: id }),
    queueNotification({ userId: booking.customer.user.id, bookingId: id, template: 'worker_arrived', message: `Your worker ${booking.worker?.user.name ?? ''} has arrived. Share OTP to start.` })
  ]);

  return NextResponse.json({ message: 'Arrival marked. Customer can now share OTP.' });
}
