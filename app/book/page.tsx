import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/navbar';
import { Card, Container, SectionTitle } from '@/components/ui';
import { BookingForm } from './booking-form';
import { requireRole } from '@/lib/auth';

export default async function BookPage({ searchParams }: { searchParams?: Promise<{ serviceId?: string }> }) {
  const params = await searchParams;
  const services = await prisma.service.findMany({
    include: { category: true },
    orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }]
  });
  const user = await requireRole('CUSTOMER');
  const customer = await prisma.customer.findUnique({ where: { userId: user.id }, include: { user: true } });

  return (
    <main>
      <Navbar />
      <Container className="grid gap-8 py-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <SectionTitle
            eyebrow="Customer booking"
            title="Book a defined service, not a vague worker"
            description="TrustMitra only accepts clear service templates. That keeps pricing fair, matching accurate, and completion measurable."
          />
          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Customer protection built in</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>• Worker is matched only if the skill is approved.</li>
              <li>• Job starts only after OTP confirmation.</li>
              <li>• Payment stays held until completion or support review.</li>
              <li>• Rework / dispute route exists for eligible jobs.</li>
            </ul>
          </Card>
        </div>
        <BookingForm services={services} defaultServiceId={params?.serviceId} customerId={customer?.id ?? ''} />
      </Container>
    </main>
  );
}
