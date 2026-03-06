'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AdminApplicationActions({ applicationId, status }: { applicationId: string; status: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  async function approve() {
    const res = await fetch(`/api/worker-applications/${applicationId}/approve`, { method: 'POST' });
    const data = await res.json();
    setMessage(data.message || data.error);
    router.refresh();
  }

  async function reject() {
    const res = await fetch(`/api/worker-applications/${applicationId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: 'Rejected in admin review.' })
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    router.refresh();
  }

  return (
    <div className="mt-3 space-y-2">
      {status === 'PENDING' ? (
        <div className="flex flex-wrap gap-2">
          <button onClick={approve} className="rounded-xl bg-trust-500 px-3 py-2 text-xs font-semibold text-slate-950">Approve</button>
          <button onClick={reject} className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-white">Reject</button>
        </div>
      ) : null}
      {message ? <p className="text-xs text-trust-200">{message}</p> : null}
    </div>
  );
}

export function AdminTicketActions({ ticketId, status }: { ticketId: string; status: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  async function markReview() {
    const res = await fetch(`/api/tickets/${ticketId}/review`, { method: 'POST' });
    const data = await res.json();
    setMessage(data.message || data.error);
    router.refresh();
  }

  async function resolve() {
    const res = await fetch(`/api/tickets/${ticketId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution: 'Admin reviewed evidence and closed the issue.' })
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    router.refresh();
  }

  return (
    <div className="mt-3 space-y-2">
      {status !== 'RESOLVED' ? (
        <div className="flex flex-wrap gap-2">
          <button onClick={markReview} className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-white">Mark in review</button>
          <button onClick={resolve} className="rounded-xl bg-trust-500 px-3 py-2 text-xs font-semibold text-slate-950">Resolve</button>
        </div>
      ) : null}
      {message ? <p className="text-xs text-trust-200">{message}</p> : null}
    </div>
  );
}
