import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setSessionCookie } from '@/lib/auth';
import { createAuditLog } from '@/lib/events';
import { verifyOtpSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, code } = verifyOtpSchema.parse(body);

    const otp = await prisma.otpCode.findFirst({
      where: { phone, code, purpose: 'LOGIN', verified: false },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });

    if (!otp || otp.expiresAt < new Date()) {
      return NextResponse.json({ error: 'OTP invalid or expired.' }, { status: 400 });
    }

    await prisma.otpCode.update({ where: { id: otp.id }, data: { verified: true } });
    const session = await prisma.authSession.create({
      data: {
        userId: otp.userId,
        token: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
      }
    });

    await setSessionCookie(session.token);
    await createAuditLog({ actorUserId: otp.userId, action: 'auth.otp_verified', entityType: 'session', entityId: session.id });
    return NextResponse.json({ message: 'OTP verified.', role: otp.user.role, userId: otp.userId });
  } catch (error) {
    return NextResponse.json({ error: 'OTP invalid or expired.' }, { status: 400 });
  }
}
