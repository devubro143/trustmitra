import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createAuditLog } from '@/lib/events';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Admin login required.' }, { status: 401 });

  const { id } = await params;
  const { note } = await request.json().catch(() => ({ note: 'Rejected by admin after review.' }));
  await prisma.workerApplication.update({ where: { id }, data: { identityStatus: 'REJECTED', statusNote: note || 'Rejected by admin after review.' } });
  await createAuditLog({ actorUserId: user.id, action: 'worker_application.rejected', entityType: 'workerApplication', entityId: id, metadata: { note } });
  return NextResponse.json({ message: 'Application rejected.' });
}
