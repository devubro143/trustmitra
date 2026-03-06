import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { Navbar } from '@/components/navbar';
import { Badge, Button, Card, Container, SectionTitle } from '@/components/ui';
import { ServiceCard } from '@/components/service-card';
import { StatCard } from '@/components/stat-card';
import { ArrowRight, CheckCircle2, Landmark, Shield, Smartphone, Wallet } from 'lucide-react';

export default async function HomePage() {
  const categories = await prisma.serviceCategory.findMany({
    include: { services: true }
  });
  const workers = await prisma.worker.count();
  const completedJobs = await prisma.booking.count({ where: { status: 'COMPLETED' } });
  const payments = await prisma.payment.findMany();
  const payout = payments.reduce((sum, item) => sum + item.workerPayout, 0);

  return (
    <main>
      <Navbar />
      <section className="grid-bg border-b border-slate-800">
        <Container className="grid gap-12 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
          <div className="space-y-8">
            <Badge className="border-trust-500/20 bg-trust-500/10 text-trust-200">Trust Layer for Daily-Life Services</Badge>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
                Right worker. Right job. Secure payout. Proof-based completion.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                TrustMitra is a managed marketplace for clearly defined cleaning, plumbing, and electrical jobs. Customers book simple service templates, the platform auto-matches verified workers, job starts with OTP, and payouts release only after completion.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href="/book">Book a trusted service</Button>
              <Button href="/worker-onboarding" variant="secondary">Join as worker</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label="Verified workers" value={String(workers)} hint="Only approved skills are matched." />
              <StatCard label="Completed jobs" value={String(completedJobs)} hint="Jobs close only after confirmation." />
              <StatCard label="Worker payouts" value={formatCurrency(payout)} hint="Held first, then released fairly." />
            </div>
          </div>

          <Card className="relative overflow-hidden p-0">
            <div className="border-b border-slate-800 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Live trust workflow</p>
                  <p className="text-xl font-semibold text-white">Managed job control</p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-300">Platform-held payment</Badge>
              </div>
            </div>
            <div className="space-y-4 p-5">
              {[
                ['1', 'Service template selected', 'Customer books a defined job, not a vague worker request.'],
                ['2', 'Best worker assigned', 'Match score uses skill, trust, area, and completion history.'],
                ['3', 'OTP-based start', 'Job becomes official only after customer OTP.'],
                ['4', 'Proof-based completion', 'Photo/test/checklist depends on the service.'],
                ['5', 'Payout release', 'Worker payout unlocks after confirmation or support resolution.']
              ].map((step) => (
                <div key={step[0]} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-trust-500/15 text-sm font-semibold text-trust-300">{step[0]}</div>
                    <div>
                      <p className="font-medium text-white">{step[1]}</p>
                      <p className="mt-1 text-sm text-slate-300">{step[2]}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Container>
      </section>

      <section className="border-b border-slate-800 py-20">
        <Container className="space-y-10">
          <SectionTitle
            eyebrow="Service design"
            title="Start narrow, stay reliable"
            description="TrustMitra only supports jobs where fairness, pricing, and completion can be judged clearly."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {categories.flatMap((category) =>
              category.services.map((service) => (
                <ServiceCard
                  key={service.id}
                  category={category.name}
                  name={service.name}
                  description={service.description}
                  duration={service.expectedDurationMin}
                  basePrice={service.basePrice}
                  maxPrice={service.maxPrice}
                  serviceId={service.id}
                />
              ))
            )}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: Shield,
              title: 'Trust engine',
              text: 'Identity verified workers, approved skill tags, complaint control, and rework support.'
            },
            {
              icon: Smartphone,
              title: 'Simple UX',
              text: 'Customer books the problem, not the complexity. Worker sees clear job, earnings, and payout status.'
            },
            {
              icon: Wallet,
              title: 'Secure payouts',
              text: 'Advance or held payment logic protects both customer and worker.'
            },
            {
              icon: Landmark,
              title: 'Operator control',
              text: 'Admin dashboard monitors jobs, status logs, ratings, payouts, and worker quality.'
            }
          ].map((item) => (
            <Card key={item.title} className="space-y-4">
              <item.icon className="h-8 w-8 text-trust-300" />
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="text-sm leading-6 text-slate-300">{item.text}</p>
            </Card>
          ))}
        </Container>
      </section>

      <section className="border-t border-slate-800 py-12">
        <Container className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-2xl font-semibold text-white">Built for Jaipur pilot. Ready for stronger trust operations.</p>
            <p className="mt-2 text-slate-400">Customer path, worker path, and admin control are already wired in this prototype.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/customer">Customer dashboard</Button>
            <Button href="/worker" variant="secondary">Worker dashboard</Button>
            <Button href="/admin" variant="secondary">Admin dashboard</Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
