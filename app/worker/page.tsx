import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/navbar';
import { Badge, Card, Container, SectionTitle } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { WorkerActions } from './worker-actions';
import { requireRole } from '@/lib/auth';

export default async function WorkerPage() {
  const user = await requireRole('WORKER');
  const worker = await prisma.worker.findUnique({
    where: { userId: user.id },
    include: {
      user: true,
      skills: { include: { service: true } },
      bookings: {
        include: {
          service: true,
          payment: true,
          customer: { include: { user: true } },
          statusLogs: { orderBy: { createdAt: 'desc' }, take: 5 },
          tickets: { orderBy: { createdAt: 'desc' }, take: 3 },
          notifications: { orderBy: { createdAt: 'desc' }, take: 4 }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!worker) return null;

  const activeBooking = worker.bookings.find((booking) => ['ASSIGNED', 'ARRIVED', 'OTP_VERIFIED', 'IN_PROGRESS'].includes(booking.status));

  return (
    <main>
      <Navbar />
      <Container className="grid gap-8 py-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <SectionTitle eyebrow="Worker dashboard" title={worker.user.name} description="See your approved skills, active job, support issues, payout status, and notification queue." />
          <Card className="space-y-3">
            <p className="text-sm text-slate-400">Worker trust</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div><p className="text-3xl font-semibold text-white">{worker.trustScore}</p><p className="text-sm text-slate-400">Trust score</p></div>
              <div><p className="text-3xl font-semibold text-white">{worker.totalJobs}</p><p className="text-sm text-slate-400">Jobs completed historically</p></div>
            </div>
            <div className="grid gap-3 text-sm text-slate-400 md:grid-cols-3">
              <p>On-time {worker.onTimeScore}%</p>
              <p>Completion {worker.completionRate}%</p>
              <p>Complaints {worker.complaintRate}%</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {worker.skills.map((skill) => (<Badge key={skill.id}>{skill.service.name}</Badge>))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {activeBooking ? (
            <Card className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-sm text-slate-400">Active job</p><h2 className="text-2xl font-semibold text-white">{activeBooking.service.name}</h2></div>
                <Badge>{activeBooking.status}</Badge>
              </div>
              <div className="grid gap-4 text-sm text-slate-300 md:grid-cols-2">
                <div><p className="text-slate-400">Customer</p><p className="mt-1">{activeBooking.customer.user.name}</p></div>
                <div><p className="text-slate-400">Preferred time</p><p className="mt-1">{formatDate(activeBooking.preferredTime)}</p></div>
                <div><p className="text-slate-400">Issue</p><p className="mt-1">{activeBooking.issue}</p></div>
                <div><p className="text-slate-400">Expected payout</p><p className="mt-1">{activeBooking.payment ? formatCurrency(activeBooking.payment.workerPayout) : '-'}</p></div>
              </div>
              {activeBooking.issuePhotoUrl ? <a href={activeBooking.issuePhotoUrl} target="_blank" className="text-sm text-trust-300 underline">Open customer issue photo</a> : null}
              <WorkerActions booking={activeBooking} />

              <div className="space-y-3">
                <p className="font-medium text-white">Job timeline</p>
                {activeBooking.statusLogs.map((log) => (
                  <div key={log.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                    <div className="flex items-center justify-between gap-3"><Badge>{log.status}</Badge><p className="text-xs text-slate-500">{formatDate(log.createdAt)}</p></div>
                    <p className="mt-2">{log.note ?? 'No note available.'}</p>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card><p className="text-slate-300">No active booking right now.</p></Card>
          )}

          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Recent jobs</h3>
            {worker.bookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><p className="font-medium text-white">{booking.service.name}</p><p className="text-sm text-slate-400">{booking.customer.user.name}</p></div>
                  <Badge>{booking.status}</Badge>
                </div>
                {booking.tickets.length > 0 ? <p className="mt-2 text-sm text-rose-300">Support ticket active on this booking.</p> : null}
                {booking.notifications.length > 0 ? <p className="mt-2 text-xs text-slate-500">Latest notification: {booking.notifications[0].message}</p> : null}
              </div>
            ))}
          </Card>
        </div>
      </Container>
    </main>
  );
}
