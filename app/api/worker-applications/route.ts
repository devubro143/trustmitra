import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { workerApplicationSchema } from '@/lib/validation';
import { createAuditLog } from '@/lib/events';

export async function GET() {
  const applications = await prisma.workerApplication.findMany({
    include: { skills: { include: { service: true } } },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(applications);
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = workerApplicationSchema.parse({
      ...json,
      experienceY: Number(json.experienceY),
      serviceIds: Array.isArray(json.serviceIds) ? json.serviceIds : []
    });

    const application = await prisma.workerApplication.create({
      data: {
        name: data.name,
        phone: data.phone,
        city: data.city,
        area: data.area,
        experienceY: data.experienceY,
        availability: data.availability,
        bio: data.bio,
        idDocumentUrl: data.idDocumentUrl,
        sampleWorkUrl: data.sampleWorkUrl,
        skills: {
          create: data.serviceIds.map((serviceId) => ({ serviceId, experienceY: data.experienceY }))
        }
      },
      include: { skills: { include: { service: true } } }
    });

    await createAuditLog({ actorUserId: null, action: 'worker_application.created', entityType: 'workerApplication', entityId: application.id, metadata: { phone: data.phone, city: data.city } });
    return NextResponse.json({ application, message: 'Application submitted. Ops team can verify and activate trial jobs.' });
  } catch (_error) {
    return NextResponse.json({ error: 'Invalid application data.' }, { status: 400 });
  }
}
