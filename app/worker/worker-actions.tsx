'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function WorkerActions({ booking }: { booking: { id: string; status: string; estimatedAmount: number; finalAmount: number | null } }) {
  const router = useRouter();
  const [completionNote, setCompletionNote] = useState('Work completed successfully and issue resolved.');
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState('');
  const [finalAmount, setFinalAmount] = useState(booking.finalAmount ?? booking.estimatedAmount);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/uploads', { method: 'POST', body: form });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setMessage(data.error || 'Upload failed.');
      return;
    }
    setCompletionPhotoUrl(data.url);
  }

  async function markArrived() {
    const res = await fetch(`/api/bookings/${booking.id}/arrive`, { method: 'POST' });
    const data = await res.json();
    setMessage(data.message || data.error);
    router.refresh();
  }

  async function completeJob() {
    const res = await fetch(`/api/bookings/${booking.id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completionNote, finalAmount, completionPhotoUrl: completionPhotoUrl || null })
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
      <p className="font-medium text-white">Worker actions</p>
      {booking.status === 'ASSIGNED' ? <button onClick={markArrived} className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white">Mark arrived</button> : null}

      {booking.status === 'OTP_VERIFIED' || booking.status === 'IN_PROGRESS' ? (
        <>
          <input value={finalAmount} onChange={(e) => setFinalAmount(Number(e.target.value))} type="number" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" />
          <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(e) => e.target.files?.[0] ? uploadFile(e.target.files[0]) : null} className="w-full rounded-2xl border border-dashed border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" />
          {uploading ? <p className="text-xs text-slate-400">Uploading proof...</p> : null}
          {completionPhotoUrl ? <p className="text-xs text-emerald-300">Uploaded proof: {completionPhotoUrl}</p> : null}
          <textarea value={completionNote} onChange={(e) => setCompletionNote(e.target.value)} rows={3} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" />
          <button onClick={completeJob} disabled={uploading} className="rounded-2xl bg-trust-500 px-5 py-3 text-sm font-semibold text-slate-950">Mark complete and request payout</button>
        </>
      ) : (
        <p className="text-sm text-slate-400">Waiting for customer OTP verification before completion can be submitted.</p>
      )}
      {message ? <p className="text-sm text-trust-200">{message}</p> : null}
    </div>
  );
}
