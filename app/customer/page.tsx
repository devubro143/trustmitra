import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/navbar';
import { Badge, Card, Container, SectionTitle } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CustomerActions } from './page-actions';
import { requireRole } from '@/lib/auth';

export default async function CustomerPage({ searchParams }: { searchParams?: Promise<{ bookingId?: string }> }) {
  const params = await searchParams;
  const user = await requireRole('CUSTOMER');
  const customer = await prisma.customer.findUnique({ where: { userId: user.id }, include: { user: true } });
  if (!customer) return null;

  const bookings = await prisma.booking.findMany({
    where: { customerId: customer.id },
    include: {
      service: { include: { category: true } },
      worker: { include: { user: true } },
      payment: true,
      reviews: true,
      statusLogs: { orderBy: { createdAt: 'desc' }, take: 6 },
      tickets: { orderBy: { createdAt: 'desc' }, take: 5 },
      notifications: { orderBy: { createdAt: 'desc' }, take: 5 }
    },
    orderBy: { createdAt: 'desc' }
  });

  const active = params?.bookingId ? bookings.find((item) => item.id === params.bookingId) ?? bookings[0] : bookings[0];

  return (
    <main>
      <Navbar />
      <Container className="grid gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <SectionTitle eyebrow="Customer dashboard" title={`Welcome, ${customer.user.name}`} description="Track active booking, OTP flow, held payment, completion confirmation, support, and notification history from one place." />
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className={booking.id === active?.id ? 'border-trust-500/40' : ''}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{booking.service.name}</p>
                    <p className="text-sm text-slate-400">{booking.worker?.user.name ?? 'Unassigned'} · {formatDate(booking.preferredTime)}</p>
                  </div>
                  <Badge>{booking.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {active ? (
          <div className="space-y-6">
            <Card className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Current booking</p>
                  <h2 className="text-2xl font-semibold text-white">{active.service.name}</h2>
                </div>
                <Badge className="bg-trust-500/10 text-trust-200">{active.status}</Badge>
              </div>

              <div className="grid gap-4 text-sm text-slate-300 md:grid-cols-2">
                <div><p className="text-slate-400">Issue</p><p className="mt-1">{active.issue}</p></div>
                <div><p className="text-slate-400">Assigned worker</p><p className="mt-1">{active.worker?.user.name ?? 'Pending'}{active.worker ? ` · Trust score ${active.worker.trustScore}` : ''}</p></div>
                <div><p className="text-slate-400">Address</p><p className="mt-1">{active.address}</p></div>
                <div><p className="text-slate-400">Held amount</p><p className="mt-1">{active.payment ? formatCurrency(active.payment.amountHeld) : '-'}</p></div>
              </div>

              {active.issuePhotoUrl ? <a href={active.issuePhotoUrl} target="_blank" className="text-sm text-trust-300 underline">Open issue photo</a> : null}
              {active.completionPhotoUrl ? <a href={active.completionPhotoUrl} target="_blank" className="text-sm text-emerald-300 underline">Open completion proof</a> : null}

              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-300">
                <p className="font-medium text-white">Customer OTP for this booking</p>
                <p className="mt-2 text-3xl font-semibold tracking-[0.3em] text-trust-300">{active.otpCode}</p>
                <p className="mt-2 text-slate-400">Share only after the worker arrives and the correct service is confirmed.</p>
              </div>
            </Card>

            <CustomerActions booking={active} customerUserId={customer.userId} />

            <Card className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Status timeline</h3>
              <div className="space-y-3">
                {active.statusLogs.map((log) => (
                  <div key={log.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Badge>{log.status}</Badge>
                      <p className="text-xs text-slate-500">{formatDate(log.createdAt)}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{log.note ?? 'No note available.'}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Support and rework</h3>
              {active.tickets.length === 0 ? (
                <p className="text-sm text-slate-400">No open support tickets for this booking.</p>
              ) : (
                active.tickets.map((ticket) => (
                  <div key={ticket.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{ticket.title}</p>
                        <p className="text-sm text-slate-400">{ticket.type}</p>
                      </div>
                      <Badge>{ticket.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{ticket.description}</p>
                    {ticket.resolution ? <p className="mt-2 text-sm text-emerald-300">Resolution: {ticket.resolution}</p> : null}
                  </div>
                ))
              )}
            </Card>

            <Card className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Recent notifications</h3>
              {active.notifications.length === 0 ? <p className="text-sm text-slate-400">No notifications yet.</p> : active.notifications.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                  <div className="flex items-center justify-between gap-3"><Badge>{item.template}</Badge><p className="text-xs text-slate-500">{formatDate(item.createdAt)}</p></div>
                  <p className="mt-2">{item.message}</p>
                </div>
              ))}
            </Card>
          </div>
        ) : null}
      </Container>
    </main>
  );
}
