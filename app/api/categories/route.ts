import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const categories = await prisma.serviceCategory.findMany({ include: { services: true } });
  return NextResponse.json(categories);
}
