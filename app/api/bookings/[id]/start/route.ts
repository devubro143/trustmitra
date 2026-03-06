import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createAuditLog, queueNotification } from '@/lib/events';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CUSTOMER') return NextResponse.json({ error: 'Customer login required.' }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({ otpCode: '' }));
  const booking = await prisma.booking.findUnique({ where: { id }, include: { customer: true, worker: { include: { user: true } } } });

  if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  if (booking.customer.userId !== user.id) return NextResponse.json({ error: 'This booking does not belong to you.' }, { status: 403 });
  if (!['ARRIVED', 'ASSIGNED'].includes(booking.status)) return NextResponse.json({ error: 'Booking is not ready to start.' }, { status: 400 });
  if (booking.otpCode !== body.otpCode) return NextResponse.json({ error: 'Incorrect OTP.' }, { status: 400 });

  await prisma.booking.update({
    where: { id },
    data: {
      status: 'IN_PROGRESS',
      otpVerifiedAt: new Date(),
      statusLogs: {
        create: [
          { status: 'OTP_VERIFIED', note: 'Customer OTP verified.' },
          { status: 'IN_PROGRESS', note: 'Job moved to in-progress state.' }
        ]
      }
    }
  });

  await Promise.all([
    createAuditLog({ actorUserId: user.id, action: 'booking.started', entityType: 'booking', entityId: id }),
    booking.worker ? queueNotification({ userId: booking.worker.user.id, bookingId: id, template: 'job_started', message: 'Customer OTP verified. Job is now in progress.' }) : Promise.resolve(null)
  ]);

  return NextResponse.json({ message: 'Job started successfully. Payout protection remains active.' });
}
