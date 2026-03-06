import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const workers = await prisma.worker.findMany({
    include: { user: true, skills: { include: { service: true } } }
  });
  return NextResponse.json(workers);
}
