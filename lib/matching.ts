import { prisma } from '@/lib/prisma';

export async function findBestWorker(serviceId: string, address: string) {
  const area = address.split(',')[0]?.trim().toLowerCase();

  const skills = await prisma.workerSkill.findMany({
    where: {
      serviceId,
      approved: true,
      worker: {
        identityStatus: 'VERIFIED',
        skillStatus: 'VERIFIED'
      }
    },
    include: {
      worker: {
        include: {
          user: true
        }
      },
      service: true
    }
  });

  const ranked = skills
    .map((entry) => {
      const worker = entry.worker;
      const areaFit = worker.area.toLowerCase().includes(area) ? 20 : 10;
      const score =
        35 +
        areaFit +
        Math.round(worker.trustScore * 0.25) +
        Math.round(worker.completionRate * 0.15) +
        Math.round(worker.onTimeScore * 0.15) -
        Math.round(worker.complaintRate * 0.6) -
        Math.round(worker.cancellationRate * 0.5) +
        entry.experienceY;

      return { worker, score };
    })
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.worker ?? null;
}
