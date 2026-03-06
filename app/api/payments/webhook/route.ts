import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/payments';
import { createAuditLog, queueNotification } from '@/lib/events';

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get('x-razorpay-signature');

  if ((process.env.PAYMENT_PROVIDER || 'mock') === 'razorpay' && !verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });
  }

  const body = JSON.parse(payload || '{}');
  const bookingId = body?.payload?.payment?.entity?.notes?.bookingId || body?.bookingId;
  if (!bookingId) return NextResponse.json({ ok: true, ignored: true });

  const booking = await prisma.booking.findUnique({ where: { id: String(bookingId) }, include: { customer: { include: { user: true } } } });
  if (!booking) return NextResponse.json({ ok: true, ignored: true });

  await prisma.payment.updateMany({
    where: { bookingId: booking.id },
    data: { status: 'HELD' }
  });

  await Promise.all([
    createAuditLog({ action: 'payment.webhook_received', entityType: 'booking', entityId: booking.id, metadata: body?.event || 'payment_event' }),
    queueNotification({ userId: booking.customer.user.id, bookingId: booking.id, template: 'payment_received', message: 'Your booking payment is now held safely by TrustMitra.' })
  ]);

  return NextResponse.json({ ok: true });
}
