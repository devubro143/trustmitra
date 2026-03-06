import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { disputeSchema } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { createAuditLog, queueNotification } from '@/lib/events';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Login required.' }, { status: 401 });

  try {
    const { id } = await params;
    const json = await request.json();
    const data = disputeSchema.parse(json);

    if (data.createdById !== user.id) {
      return NextResponse.json({ error: 'You can only raise tickets from your own session.' }, { status: 403 });
    }

    const booking = await prisma.booking.findUnique({ where: { id }, include: { payment: true, customer: true, worker: { include: { user: true } } } });
    if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });

    const allowed = booking.customer.userId === user.id || booking.worker?.userId === user.id || user.role === 'ADMIN';
    if (!allowed) return NextResponse.json({ error: 'You are not allowed to raise a ticket on this booking.' }, { status: 403 });

    const ticket = await prisma.supportTicket.create({
      data: {
        bookingId: id,
        createdById: data.createdById,
        type: data.type,
        title: data.title,
        description: data.description
      }
    });

    await prisma.booking.update({
      where: { id },
      data: {
        status: 'DISPUTED',
        statusLogs: {
          create: { status: 'DISPUTED', note: `${data.type} ticket raised by user.` }
        },
        payment: booking.payment ? {
          update: { status: 'HELD' }
        } : undefined
      }
    });

    await Promise.all([
      createAuditLog({ actorUserId: user.id, action: 'ticket.created', entityType: 'ticket', entityId: ticket.id, metadata: { bookingId: id, type: data.type } }),
      queueNotification({ userId: booking.customer.userId, bookingId: id, template: 'ticket_opened', message: `Support ticket opened: ${data.title}` }),
      booking.worker ? queueNotification({ userId: booking.worker.user.id, bookingId: id, template: 'ticket_opened', message: `Support ticket opened on your booking: ${data.title}` }) : Promise.resolve(null)
    ]);

    return NextResponse.json({ ticket, message: 'Support ticket created. Payout is held until review.' });
  } catch (_error) {
    return NextResponse.json({ error: 'Invalid dispute data.' }, { status: 400 });
  }
}
