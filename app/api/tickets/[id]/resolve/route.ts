import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createAuditLog, queueNotification } from '@/lib/events';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Admin login required.' }, { status: 401 });

  const { id } = await params;
  const { resolution } = await request.json().catch(() => ({ resolution: 'Resolved by admin.' }));
  const ticket = await prisma.supportTicket.findUnique({ where: { id }, include: { booking: { include: { payment: true, customer: { include: { user: true } }, worker: { include: { user: true } } } } } });
  if (!ticket) return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });

  await prisma.supportTicket.update({
    where: { id },
    data: { status: 'RESOLVED', resolution: resolution || 'Resolved by admin.' }
  });

  if (ticket.booking.payment) {
    await prisma.payment.update({
      where: { bookingId: ticket.bookingId },
      data: { status: 'RELEASED', releaseDueAt: new Date() }
    });
  }

  await Promise.all([
    createAuditLog({ actorUserId: user.id, action: 'ticket.resolved', entityType: 'ticket', entityId: id, metadata: { releasePayout: Boolean(ticket.booking.payment) } }),
    queueNotification({ userId: ticket.booking.customer.user.id, bookingId: ticket.bookingId, template: 'ticket_resolved', message: 'Your support ticket was resolved by TrustMitra Ops.' }),
    ticket.booking.worker ? queueNotification({ userId: ticket.booking.worker.user.id, bookingId: ticket.bookingId, template: 'ticket_resolved', message: 'Support ticket resolved. Check final payout status.' }) : Promise.resolve(null)
  ]);

  return NextResponse.json({ message: 'Ticket resolved and payout released if applicable.' });
}
