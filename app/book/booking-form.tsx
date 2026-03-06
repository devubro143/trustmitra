'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

type Service = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  maxPrice: number;
  expectedDurationMin: number;
  category: { name: string };
};

export function BookingForm({ services, defaultServiceId, customerId }: { services: Service[]; defaultServiceId?: string; customerId: string }) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState(defaultServiceId ?? services[0]?.id ?? '');
  const [issue, setIssue] = useState('Kitchen tap is leaking continuously from the neck joint.');
  const [address, setAddress] = useState('Vaishali Nagar, Jaipur');
  const [preferredTime, setPreferredTime] = useState(new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString().slice(0, 16));
  const [notes, setNotes] = useState('Please bring standard tools if possible.');
  const [issuePhotoUrl, setIssuePhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selected = useMemo(() => services.find((item) => item.id === serviceId), [services, serviceId]);

  async function uploadFile(file: File) {
    setUploading(true);
    setMessage(null);
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/uploads', { method: 'POST', body: form });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setMessage(data.error || 'Upload failed.');
      return;
    }
    setIssuePhotoUrl(data.url);
  }

  async function submitBooking() {
    if (!customerId) {
      setMessage('Please login as a customer first.');
      return;
    }

    setLoading(true);
    setMessage(null);

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, serviceId, issue, address, preferredTime, notes, issuePhotoUrl: issuePhotoUrl || null })
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || 'Booking failed.');
      return;
    }

    router.push(`/customer?bookingId=${data.booking.id}`);
  }

  return (
    <div className="card space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Create booking</h2>
        <p className="mt-2 text-sm text-slate-400">Phase 3 adds real file upload support for issue proof and tighter auth on booking creation.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-300">
          <span>Service</span>
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none">
            {services.map((service) => (
              <option key={service.id} value={service.id}>{service.category.name} · {service.name}</option>
            ))}
          </select>
        </label>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
          <p className="font-medium text-white">Estimated range</p>
          {selected ? <><p className="mt-2">{formatCurrency(selected.basePrice)} - {formatCurrency(selected.maxPrice)}</p><p className="mt-1 text-slate-400">Expected duration {selected.expectedDurationMin} minutes</p></> : null}
        </div>
      </div>

      <label className="space-y-2 text-sm text-slate-300">
        <span>Issue details</span>
        <textarea value={issue} onChange={(e) => setIssue(e.target.value)} rows={4} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-300">
          <span>Address</span>
          <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" />
        </label>

        <label className="space-y-2 text-sm text-slate-300">
          <span>Preferred time</span>
          <input type="datetime-local" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" />
        </label>
      </div>

      <label className="space-y-2 text-sm text-slate-300">
        <span>Issue photo (optional)</span>
        <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(e) => e.target.files?.[0] ? uploadFile(e.target.files[0]) : null} className="w-full rounded-2xl border border-dashed border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" />
        {uploading ? <p className="text-xs text-slate-400">Uploading...</p> : null}
        {issuePhotoUrl ? <p className="text-xs text-emerald-300">Uploaded: {issuePhotoUrl}</p> : null}
      </label>

      <label className="space-y-2 text-sm text-slate-300">
        <span>Notes (optional)</span>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" />
      </label>

      <div className="rounded-2xl border border-trust-500/20 bg-trust-500/10 p-4 text-sm text-trust-100">
        Payment logic: customer money is held by platform first, worker payout releases after completion confirmation or admin resolution.
      </div>

      <button onClick={submitBooking} disabled={loading || uploading} className="w-full rounded-2xl bg-trust-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-trust-400 disabled:opacity-60">
        {loading ? 'Creating booking...' : 'Confirm booking and auto-match worker'}
      </button>

      {message ? <p className="text-sm text-rose-300">{message}</p> : null}
    </div>
  );
}
