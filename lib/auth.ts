import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export const COOKIE_NAME = 'tm_session';

export async function getCurrentSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.authSession.findUnique({
    where: { token },
    include: {
      user: {
        include: { customer: true, worker: true }
      }
    }
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, '', { path: '/', maxAge: 0 });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth');
  return user;
}

export async function requireRole(role: 'CUSTOMER' | 'WORKER' | 'ADMIN') {
  const user = await getCurrentUser();
  if (!user || user.role !== role) redirect('/auth');
  return user;
}
