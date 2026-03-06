import { NextResponse } from 'next/server';
import { clearSessionCookie, getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await getCurrentSession();
  if (session) {
    await prisma.authSession.delete({ where: { id: session.id } }).catch(() => null);
  }
  await clearSessionCookie();
  return NextResponse.json({ message: 'Logged out.' });
}
