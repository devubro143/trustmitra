import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/events';
import { requestOtpSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = requestOtpSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return NextResponse.json({ error: 'No user found for this phone.' }, { status: 404 });

    const code = process.env.NODE_ENV === 'production' ? String(Math.floor(100000 + Math.random() * 900000)) : '123456';
    await prisma.otpCode.create({
      data: {
        userId: user.id,
        phone: user.phone,
        purpose: 'LOGIN',
        code,
        expiresAt: new Date(Date.now() + 1000 * 60 * 10)
      }
    });

    await createAuditLog({ actorUserId: user.id, action: 'auth.otp_requested', entityType: 'user', entityId: user.id, metadata: { phone } });
    return NextResponse.json({ message: 'OTP generated.', demoOtp: process.env.NODE_ENV === 'production' ? undefined : code, userId: user.id, role: user.role });
  } catch (error) {
    return NextResponse.json({ error: 'Valid phone required.' }, { status: 400 });
  }
}
