import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/navbar';
import { Badge, Card, Container, SectionTitle } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { requireRole } from '@/lib/auth';
import { AdminApplicationActions, AdminTicketActions } from './admin-actions';

export default async function AdminPage() {
  await requireRole('ADMIN');

  const [bookings, workers, applications, tickets, notifications, audits] = await Promise.all([
    prisma.booking.findMany({
      include: {
        service: true,
        customer: { include: { user: true } },
        worker: { include: { user: true } },
        payment: true,
        reviews: true,
        statusLogs: { orderBy: { createdAt: 'desc' }, take: 3 }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.worker.findMany({ include: { user: true, skills: { include: { service: true } } } }),
    prisma.workerApplication.findMany({ include: { skills: { include: { service: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.supportTicket.findMany({ include: { booking: { include: { service: true } }, createdBy: true }, orderBy: { createdAt: 'desc' } }),
    prisma.notificationEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 8 })
  ]);

  return (
    <main>
      <Navbar />
      <Container className="space-y-8 py-12">
        <SectionTitle eyebrow="Ops control" title="TrustMitra admin console" description="Phase 3 adds action audit logs, notification queue visibility, tighter role checks, and upload-backed evidence handling." />

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Booking control</h3>
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{booking.service.name}</p>
                    <p className="text-sm text-slate-400">{booking.customer.user.name} → {booking.worker?.user.name ?? 'Unassigned'}</p>
                  </div>
                  <Badge>{booking.status}</Badge>
                </div>
                <div className="mt-3 grid gap-3 text-sm text-slate-300 md:grid-cols-3">
                  <p>Preferred: {formatDate(booking.preferredTime)}</p>
                  <p>Held: {booking.payment ? formatCurrency(booking.payment.amountHeld) : '-'}</p>
                  <p>Payout status: {booking.payment?.status ?? '-'}</p>
                </div>
                {booking.statusLogs[0] ? <p className="mt-3 text-sm text-slate-400">Latest note: {booking.statusLogs[0].note}</p> : null}
              </div>
            ))}
          </Card>

          <Card className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Worker quality</h3>
            {workers.map((worker) => (
              <div key={worker.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{worker.user.name}</p>
                    <p className="text-sm text-slate-400">{worker.area} · {worker.level}</p>
                  </div>
                  <Badge className="bg-trust-500/10 text-trust-200">Trust {worker.trustScore}</Badge>
                </div>
                <p className="mt-3 text-sm text-slate-300">Skills: {worker.skills.map((skill) => skill.service.name).join(', ')}</p>
                <div className="mt-3 grid gap-3 text-sm text-slate-400 md:grid-cols-3">
                  <p>On-time {worker.onTimeScore}%</p>
                  <p>Completion {worker.completionRate}%</p>
                  <p>Complaints {worker.complaintRate}%</p>
                </div>
              </div>
            ))}
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Worker onboarding queue</h3>
            {applications.length === 0 ? <p className="text-sm text-slate-400">No applications pending.</p> : applications.map((application) => (
              <div key={application.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{application.name}</p>
                    <p className="text-sm text-slate-400">{application.area}, {application.city} · {application.experienceY} yrs</p>
                  </div>
                  <Badge>{application.identityStatus}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-300">{application.bio}</p>
                <p className="mt-2 text-sm text-slate-400">Applied for: {application.skills.map((skill) => skill.service.name).join(', ')}</p>
                {application.idDocumentUrl ? <a href={application.idDocumentUrl} target="_blank" className="mt-2 block text-sm text-trust-300 underline">Open ID proof</a> : null}
                {application.sampleWorkUrl ? <a href={application.sampleWorkUrl} target="_blank" className="mt-1 block text-sm text-emerald-300 underline">Open sample work</a> : null}
                {application.statusNote ? <p className="mt-2 text-xs text-slate-500">{application.statusNote}</p> : null}
                <AdminApplicationActions applicationId={application.id} status={application.identityStatus} />
              </div>
            ))}
          </Card>

          <Card className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Support tickets</h3>
            {tickets.length === 0 ? <p className="text-sm text-slate-400">No tickets raised yet.</p> : tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{ticket.title}</p>
                    <p className="text-sm text-slate-400">{ticket.booking.service.name} · raised by {ticket.createdBy.name}</p>
                  </div>
                  <Badge>{ticket.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-300">{ticket.description}</p>
                <p className="mt-2 text-xs text-slate-500">{ticket.type} · {formatDate(ticket.createdAt)}</p>
                {ticket.resolution ? <p className="mt-2 text-sm text-emerald-300">Resolution: {ticket.resolution}</p> : null}
                <AdminTicketActions ticketId={ticket.id} status={ticket.status} />
              </div>
            ))}
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Recent notification queue</h3>
            {notifications.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-white">{item.template}</p>
                  <Badge>{item.status}</Badge>
                </div>
                <p className="mt-2">{item.message}</p>
                <p className="mt-2 text-xs text-slate-500">{item.channel} · {formatDate(item.createdAt)}</p>
              </div>
            ))}
          </Card>

          <Card className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Recent audit trail</h3>
            {audits.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-white">{item.action}</p>
                  <Badge>{item.entityType}</Badge>
                </div>
                <p className="mt-2 text-slate-400">{item.entityId}</p>
                {item.metadata ? <p className="mt-2 text-xs text-slate-500">{item.metadata}</p> : null}
              </div>
            ))}
          </Card>
        </div>
      </Container>
    </main>
  );
}
