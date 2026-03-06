import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createHeldPaymentIntent } from '@/lib/payments';
import { createAuditLog } from '@/lib/events';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const { bookingId } = await request.json().catch(() => ({ bookingId: '' }));
  if (!bookingId) return NextResponse.json({ error: 'bookingId is required.' }, { status: 400 });

  const booking = await prisma.booking.findUnique({ where: { id: String(bookingId) }, include: { payment: true, customer: true } });
  if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  if (user.role === 'CUSTOMER' && booking.customer.userId !== user.id) {
    return NextResponse.json({ error: 'This booking does not belong to you.' }, { status: 403 });
  }

  const paymentIntent = createHeldPaymentIntent(booking.payment?.amountHeld ?? booking.estimatedAmount, booking.id);
  if (booking.payment) {
    await prisma.payment.update({
      where: { bookingId: booking.id },
      data: {
        provider: paymentIntent.provider,
        providerOrderId: paymentIntent.orderId
      }
    });
  }

  await createAuditLog({ actorUserId: user.id, action: 'payment.order_created', entityType: 'booking', entityId: booking.id, metadata: paymentIntent });
  return NextResponse.json({ paymentIntent });
}
