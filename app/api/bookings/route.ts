import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bookingSchema } from '@/lib/validation';
import { findBestWorker } from '@/lib/matching';
import { createHeldPaymentIntent } from '@/lib/payments';
import { getCurrentUser } from '@/lib/auth';
import { createAuditLog, queueNotification } from '@/lib/events';

export async function GET() {
  const bookings = await prisma.booking.findMany({
    include: {
      service: true,
      customer: { include: { user: true } },
      worker: { include: { user: true } },
      payment: true,
      reviews: true
    },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Customer login required.' }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({ where: { userId: user.id } });
    if (!customer) return NextResponse.json({ error: 'Customer profile missing.' }, { status: 400 });

    const json = await request.json();
    const data = bookingSchema.parse(json);

    const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
    if (!service) return NextResponse.json({ error: 'Service not found.' }, { status: 404 });

    const worker = await findBestWorker(data.serviceId, data.address);
    if (!worker) return NextResponse.json({ error: 'No verified worker available for this service yet.' }, { status: 400 });

    const otpCode = String(Math.floor(1000 + Math.random() * 9000));
    const estimatedAmount = service.basePrice + Math.round((service.maxPrice - service.basePrice) * 0.3);
    const platformFee = Math.round(estimatedAmount * 0.1);

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        workerId: worker.id,
        serviceId: data.serviceId,
        issue: data.issue,
        address: data.address,
        preferredTime: new Date(data.preferredTime),
        notes: data.notes,
        issuePhotoUrl: data.issuePhotoUrl,
        estimatedAmount,
        otpCode,
        status: 'ASSIGNED',
        statusLogs: {
          create: {
            status: 'ASSIGNED',
            note: 'Auto-matched using skill, trust score, and area fit.'
          }
        },
        payment: {
          create: {
            amountHeld: estimatedAmount,
            platformFee,
            workerPayout: estimatedAmount - platformFee,
            provider: process.env.PAYMENT_PROVIDER || 'mock',
            status: 'HELD'
          }
        }
      },
      include: {
        service: true,
        worker: { include: { user: true } },
        payment: true
      }
    });

    await Promise.all([
      createAuditLog({ actorUserId: user.id, action: 'booking.created', entityType: 'booking', entityId: booking.id, metadata: { serviceId: booking.serviceId, workerId: booking.workerId } }),
      queueNotification({ userId: user.id, bookingId: booking.id, template: 'booking_created', message: `Booking created for ${booking.service.name}. Worker auto-matched.` }),
      booking.worker?.user?.id ? queueNotification({ userId: booking.worker.user.id, bookingId: booking.id, template: 'worker_assigned', message: `You have a new ${booking.service.name} job assigned.` }) : Promise.resolve(null)
    ]);

    const paymentIntent = createHeldPaymentIntent(estimatedAmount, booking.id);
    return NextResponse.json({ booking, paymentIntent, message: 'Booking created and worker auto-assigned.' });
  } catch (_error) {
    return NextResponse.json({ error: 'Invalid booking data.' }, { status: 400 });
  }
}
