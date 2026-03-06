import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setSessionCookie } from '@/lib/auth';
import { createAuditLog } from '@/lib/events';

export async function POST(request: Request) {
  const { role } = await request.json().catch(() => ({ role: undefined }));
  if (!['CUSTOMER', 'WORKER', 'ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
  }

  const user = await prisma.user.findFirst({ where: { role } });
  if (!user) return NextResponse.json({ error: 'Demo user not found.' }, { status: 404 });

  const session = await prisma.authSession.create({
    data: {
      userId: user.id,
      token: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    }
  });

  await setSessionCookie(session.token);
  await createAuditLog({ actorUserId: user.id, action: 'auth.demo_login', entityType: 'session', entityId: session.id, metadata: { role } });
  return NextResponse.json({ message: `Logged in as ${role}.`, role, userId: user.id });
}
