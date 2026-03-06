'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AuthClient() {
  const router = useRouter();
  const [phone, setPhone] = useState('9999999901');
  const [code, setCode] = useState('123456');
  const [message, setMessage] = useState<string | null>(null);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  async function loginAs(role: 'CUSTOMER' | 'WORKER' | 'ADMIN') {
    const res = await fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (res.ok) router.push(role === 'CUSTOMER' ? '/customer' : role === 'WORKER' ? '/worker' : '/admin');
  }

  async function requestOtp() {
    const res = await fetch('/api/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    const data = await res.json();
    setDemoOtp(data.demoOtp || null);
    setMessage(data.message || data.error);
  }

  async function verifyOtp() {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code })
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (res.ok) router.push(data.role === 'CUSTOMER' ? '/customer' : data.role === 'WORKER' ? '/worker' : '/admin');
  }

  async function logout() {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (res.ok) router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card space-y-4 p-6">
        <h2 className="text-2xl font-semibold text-white">Demo role switch</h2>
        <p className="text-sm text-slate-400">Instantly login as seeded customer, worker, or admin to test the full workflow.</p>
        <div className="grid gap-3">
          <button onClick={() => loginAs('CUSTOMER')} className="rounded-2xl bg-trust-500 px-5 py-3 text-sm font-semibold text-slate-950">Continue as customer</button>
          <button onClick={() => loginAs('WORKER')} className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white">Continue as worker</button>
          <button onClick={() => loginAs('ADMIN')} className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white">Continue as admin</button>
          <button onClick={logout} className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200">Logout</button>
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="text-2xl font-semibold text-white">OTP-ready auth foundation</h2>
        <p className="text-sm text-slate-400">This uses a demo OTP flow now, but route structure is production-friendly for SMS providers later.</p>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" />
        <div className="flex gap-3">
          <button onClick={requestOtp} className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white">Request OTP</button>
          <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" placeholder="Enter OTP" />
        </div>
        <button onClick={verifyOtp} className="rounded-2xl bg-trust-500 px-5 py-3 text-sm font-semibold text-slate-950">Verify OTP</button>
        {demoOtp ? <p className="text-sm text-emerald-300">Demo OTP: {demoOtp}</p> : null}
      </div>

      {message ? <p className="text-sm text-trust-200 lg:col-span-2">{message}</p> : null}
    </div>
  );
}
