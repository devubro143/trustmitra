import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/navbar';
import { Card, Container, SectionTitle, Badge } from '@/components/ui';
import { WorkerOnboardingForm } from './form';

export default async function WorkerOnboardingPage() {
  const services = await prisma.service.findMany({ include: { category: true }, orderBy: { name: 'asc' } });
  const applications = await prisma.workerApplication.findMany({ include: { skills: { include: { service: true } } }, orderBy: { createdAt: 'desc' }, take: 5 });

  return (
    <main>
      <Navbar />
      <Container className="grid gap-8 py-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <SectionTitle eyebrow="Worker onboarding" title="Trust first, jobs after" description="Workers join with identity verification, skill tagging, and trial-job progression instead of random open listings." />
          <Card className="space-y-4">
            <p className="font-semibold text-white">Worker lifecycle</p>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>• Register → phone + city</li>
              <li>• Identity verified → safer customer trust</li>
              <li>• Skill tagged → only approved services visible</li>
              <li>• Trial jobs → small, simple work first</li>
              <li>• Trusted / Pro → higher-value jobs later</li>
            </ul>
          </Card>
          <Card className="space-y-4">
            <p className="font-semibold text-white">Recent applications</p>
            {applications.length === 0 ? <p className="text-sm text-slate-400">No applications yet.</p> : applications.map((application) => (
              <div key={application.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{application.name}</p>
                    <p className="text-sm text-slate-400">{application.area}, {application.city}</p>
                  </div>
                  <Badge>{application.identityStatus}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-300">{application.skills.map((skill) => skill.service.name).join(', ')}</p>
              </div>
            ))}
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="space-y-5">
            <h2 className="text-2xl font-semibold text-white">Approved starter services</h2>
            <p className="text-sm text-slate-400">These are the only services this version of TrustMitra accepts, because fairness and completion can be judged cleanly.</p>
            <div className="flex flex-wrap gap-3">
              {services.map((service) => (
                <Badge key={service.id}>{service.category.name} · {service.name}</Badge>
              ))}
            </div>
          </Card>
          <WorkerOnboardingForm services={services} />
        </div>
      </Container>
    </main>
  );
}
