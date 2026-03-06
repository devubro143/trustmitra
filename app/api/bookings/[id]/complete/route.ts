import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { completeSchema } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { createAuditLog, queueNotification } from '@/lib/events';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'WORKER') return NextResponse.json({ error: 'Worker login required.' }, { status: 401 });

  const { id } = await params;
  const booking = await prisma.booking.findUnique({ where: { id }, include: { payment: true, worker: { include: { user: true } }, customer: { include: { user: true } } } });
  if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  if (booking.worker?.userId !== user.id) return NextResponse.json({ error: 'This booking is not assigned to you.' }, { status: 403 });
  if (!['OTP_VERIFIED', 'IN_PROGRESS'].includes(booking.status)) return NextResponse.json({ error: 'Booking is not ready for completion.' }, { status: 400 });

  try {
    const json = await request.json();
    const data = completeSchema.parse({
      ...json,
      finalAmount: json.finalAmount ? Number(json.finalAmount) : undefined
    });
    const finalAmount = data.finalAmount ?? booking.estimatedAmount;
    const platformFee = Math.round(finalAmount * 0.1);

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        finalAmount,
        completionNote: data.completionNote,
        completionPhotoUrl: data.completionPhotoUrl,
        status: 'COMPLETED',
        reworkEligibleUntil: new Date(Date.now() + 1000 * 60 * 60 * 24),
        statusLogs: { create: { status: 'COMPLETED', note: 'Worker submitted completion. Awaiting customer confirmation.' } },
        payment: booking.payment
          ? {
              update: {
                amountHeld: finalAmount,
                platformFee,
                workerPayout: finalAmount - platformFee,
                status: 'HELD'
              }
            }
          : undefined
      },
      include: { payment: true }
    });

    await Promise.all([
      createAuditLog({ actorUserId: user.id, action: 'booking.completed_submitted', entityType: 'booking', entityId: id, metadata: { finalAmount } }),
      queueNotification({ userId: booking.customer.user.id, bookingId: id, template: 'job_completed_pending_confirmation', message: 'Worker marked the job complete. Confirm completion or raise support.' })
    ]);

    return NextResponse.json({ booking: updated, message: 'Completion submitted. Payment remains held until confirmation.' });
  } catch (_error) {
    return NextResponse.json({ error: 'Invalid completion payload.' }, { status: 400 });
  }
}
