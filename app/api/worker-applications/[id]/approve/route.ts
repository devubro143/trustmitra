import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createAuditLog, queueNotification } from '@/lib/events';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Admin login required.' }, { status: 401 });

  const { id } = await params;
  const application = await prisma.workerApplication.findUnique({ where: { id }, include: { skills: true } });
  if (!application) return NextResponse.json({ error: 'Application not found.' }, { status: 404 });

  const existingUser = await prisma.user.findUnique({ where: { phone: application.phone } });
  if (existingUser) return NextResponse.json({ error: 'User with this phone already exists.' }, { status: 400 });

  const createdUser = await prisma.user.create({
    data: {
      name: application.name,
      phone: application.phone,
      role: 'WORKER',
      city: application.city,
      worker: {
        create: {
          bio: application.bio,
          area: application.area,
          availability: application.availability,
          level: 'VERIFIED',
          identityStatus: 'VERIFIED',
          skillStatus: 'PENDING',
          trustScore: 72,
          completionRate: 80,
          onTimeScore: 80
        }
      }
    },
    include: { worker: true }
  });

  if (application.skills.length > 0) {
    await prisma.workerSkill.createMany({
      data: application.skills.map((skill) => ({
        workerId: createdUser.worker!.id,
        serviceId: skill.serviceId,
        approved: true,
        experienceY: skill.experienceY
      }))
    });
  }

  await prisma.workerApplication.update({
    where: { id },
    data: {
      workerId: createdUser.worker!.id,
      identityStatus: 'VERIFIED',
      statusNote: 'Approved in phase 3 admin flow and activated for starter jobs.'
    }
  });

  await Promise.all([
    createAuditLog({ actorUserId: user.id, action: 'worker_application.approved', entityType: 'workerApplication', entityId: id, metadata: { workerId: createdUser.worker!.id } }),
    queueNotification({ userId: createdUser.id, template: 'worker_application_approved', message: 'Your TrustMitra worker application is approved. Trial jobs can now be assigned.' })
  ]);

  return NextResponse.json({ message: 'Worker application approved and activated.' });
}
