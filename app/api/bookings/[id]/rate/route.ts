import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ratingSchema } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { createAuditLog, queueNotification } from '@/lib/events';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CUSTOMER') return NextResponse.json({ error: 'Customer login required.' }, { status: 401 });

  const { id } = await params;
  const json = await request.json();
  const data = ratingSchema.parse({
    reviewerId: json.reviewerId,
    rating: Number(json.rating),
    feedback: json.feedback
  });

  if (data.reviewerId !== user.id) {
    return NextResponse.json({ error: 'You can only rate from your own account.' }, { status: 403 });
  }

  const booking = await prisma.booking.findUnique({ where: { id }, include: { worker: { include: { user: true } }, customer: true } });
  if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  if (booking.customer.userId !== user.id) return NextResponse.json({ error: 'This booking does not belong to you.' }, { status: 403 });

  await prisma.review.create({
    data: {
      bookingId: id,
      reviewerId: data.reviewerId,
      rating: data.rating,
      feedback: data.feedback
    }
  });

  if (booking.workerId) {
    const reviews = await prisma.review.findMany({ where: { booking: { workerId: booking.workerId } } });
    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    const trustScore = Math.min(98, Math.round(avgRating * 18 + 8));
    await prisma.worker.update({
      where: { id: booking.workerId },
      data: { trustScore }
    });
  }

  await Promise.all([
    createAuditLog({ actorUserId: user.id, action: 'booking.rated', entityType: 'booking', entityId: id, metadata: { rating: data.rating } }),
    booking.worker ? queueNotification({ userId: booking.worker.user.id, bookingId: id, template: 'new_review', message: `You received a ${data.rating}-star review.` }) : Promise.resolve(null)
  ]);

  return NextResponse.json({ message: 'Rating submitted successfully.' });
}
