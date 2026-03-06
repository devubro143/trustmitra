import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createAuditLog } from '@/lib/events';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Admin login required.' }, { status: 401 });

  const { id } = await params;
  await prisma.supportTicket.update({ where: { id }, data: { status: 'IN_REVIEW' } });
  await createAuditLog({ actorUserId: user.id, action: 'ticket.reviewed', entityType: 'ticket', entityId: id });
  return NextResponse.json({ message: 'Ticket moved to in-review.' });
}
