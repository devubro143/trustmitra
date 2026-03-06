import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const [workers, completedJobs, payments, categories] = await Promise.all([
    prisma.worker.count(),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.payment.findMany(),
    prisma.serviceCategory.count()
  ]);
  const payout = payments.reduce((sum, payment) => sum + payment.workerPayout, 0);
  return NextResponse.json({ workers, completedJobs, payout, categories });
}
