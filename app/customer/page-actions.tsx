'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Booking = {
  id: string;
  status: string;
  finalAmount: number | null;
  customerConfirmed: boolean;
  reviews: Array<{ id: string }>;
};

export function CustomerActions({ booking, customerUserId }: { booking: Booking; customerUserId: string }) {
  const router = useRouter();
  const [otpInput, setOtpInput] = useState('');
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('Good work and clear communication.');
  const [ticketType, setTicketType] = useState('QUALITY_ISSUE');
  const [ticketTitle, setTicketTitle] = useState('Work needs recheck');
  const [ticketDescription, setTicketDescription] = useState('The issue is not fully resolved and I need support or rework.');
  const [message, setMessage] = useState<string | null>(null);

  async function verifyStart() {
    const res = await fetch(`/api/bookings/${booking.id}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otpCode: otpInput })
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    router.refresh();
  }

  async function confirmCompletion() {
    const res = await fetch(`/api/bookings/${booking.id}/confirm`, { method: 'POST' });
    const data = await res.json();
    setMessage(data.message || data.error);
    router.refresh();
  }

  async function submitRating() {
    const res = await fetch(`/api/bookings/${booking.id}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewerId: customerUserId, rating, feedback })
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    router.refresh();
  }

  async function raiseTicket() {
    const res = await fetch(`/api/bookings/${booking.id}/dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        createdById: customerUserId,
        type: ticketType,
        title: ticketTitle,
        description: ticketDescription
      })
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    router.refresh();
  }

  return (
    <div className="card space-y-5 p-6">
      <h3 className="text-xl font-semibold text-white">Customer actions</h3>

      {booking.status === 'ASSIGNED' || booking.status === 'ARRIVED' ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-300">Enter OTP after worker arrival.</p>
          <div className="flex gap-3">
            <input value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder="Enter OTP" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" />
            <button onClick={verifyStart} className="rounded-2xl bg-trust-500 px-5 py-3 text-sm font-semibold text-slate-950">Verify start</button>
          </div>
        </div>
      ) : null}

      {booking.status === 'COMPLETED' && !booking.customerConfirmed ? (
        <div className="space-y-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-100">Worker marked the job complete. Confirm only if your issue is fully resolved.</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={confirmCompletion} className="rounded-2xl bg-trust-500 px-5 py-3 text-sm font-semibold text-slate-950">Confirm completion and release payout</button>
          </div>
        </div>
      ) : null}

      {(booking.status === 'COMPLETED' || booking.status === 'DISPUTED') ? (
        <div className="space-y-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
          <p className="text-sm text-rose-100">Still an issue? Raise support / rework request.</p>
          <div className="grid gap-3 md:grid-cols-2">
            <select value={ticketType} onChange={(e) => setTicketType(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none">
              <option value="QUALITY_ISSUE">Quality issue</option>
              <option value="REWORK_REQUEST">Rework request</option>
              <option value="PRICING_DISPUTE">Pricing dispute</option>
              <option value="PAYMENT_ISSUE">Payment issue</option>
            </select>
            <input value={ticketTitle} onChange={(e) => setTicketTitle(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" />
          </div>
          <textarea value={ticketDescription} onChange={(e) => setTicketDescription(e.target.value)} rows={3} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" />
          <button onClick={raiseTicket} className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white">Raise support ticket</button>
        </div>
      ) : null}

      {booking.status === 'COMPLETED' && booking.customerConfirmed && booking.reviews.length === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-300">Rate the completed work</p>
          <div className="grid gap-3 md:grid-cols-[0.25fr_1fr]">
            <input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" />
            <input value={feedback} onChange={(e) => setFeedback(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" />
          </div>
          <button onClick={submitRating} className="rounded-2xl bg-trust-500 px-5 py-3 text-sm font-semibold text-slate-950">Submit rating</button>
        </div>
      ) : null}

      {booking.status === 'COMPLETED' ? <p className="text-sm text-emerald-300">Final amount: ₹{booking.finalAmount ?? 0}. {booking.customerConfirmed ? 'Payout released to worker.' : 'Payout is still held until confirmation or support resolution.'}</p> : null}
      {message ? <p className="text-sm text-trust-200">{message}</p> : null}
    </div>
  );
}
