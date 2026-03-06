'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Service = {
  id: string;
  name: string;
  category: { name: string };
};

export function WorkerOnboardingForm({ services }: { services: Service[] }) {
  const router = useRouter();
  const [name, setName] = useState('Amit Kumar');
  const [phone, setPhone] = useState('9999999911');
  const [city, setCity] = useState('Jaipur');
  const [area, setArea] = useState('Vaishali Nagar');
  const [experienceY, setExperienceY] = useState(2);
  const [availability, setAvailability] = useState('9 AM - 7 PM');
  const [bio, setBio] = useState('I handle basic plumbing and electrical issues for homes and small offices.');
  const [idDocumentUrl, setIdDocumentUrl] = useState('');
  const [sampleWorkUrl, setSampleWorkUrl] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>(services.slice(0, 2).map((service) => service.id));
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<'id' | 'sample' | null>(null);

  function toggleService(serviceId: string) {
    setSelectedServices((current) => current.includes(serviceId) ? current.filter((id) => id !== serviceId) : [...current, serviceId]);
  }

  async function uploadFile(field: 'id' | 'sample', file: File) {
    setUploadingField(field);
    setMessage(null);
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/uploads', { method: 'POST', body: form });
    const data = await res.json();
    setUploadingField(null);
    if (!res.ok) {
      setMessage(data.error || 'Upload failed.');
      return;
    }
    if (field === 'id') setIdDocumentUrl(data.url);
    if (field === 'sample') setSampleWorkUrl(data.url);
  }

  async function submitApplication() {
    setLoading(true);
    setMessage(null);
    const res = await fetch('/api/worker-applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, city, area, experienceY, availability, bio, idDocumentUrl: idDocumentUrl || null, sampleWorkUrl: sampleWorkUrl || null, serviceIds: selectedServices })
    });
    const data = await res.json();
    setLoading(false);
    setMessage(data.message || data.error);
    if (res.ok) router.refresh();
  }

  return (
    <div className="card space-y-5 p-6">
      <h2 className="text-2xl font-semibold text-white">Apply as a worker</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" />
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" />
        <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area" className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" />
        <input type="number" value={experienceY} onChange={(e) => setExperienceY(Number(e.target.value))} placeholder="Experience years" className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" />
        <input value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder="Availability" className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" />
      </div>
      <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-300">
          <span>ID document</span>
          <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(e) => e.target.files?.[0] ? uploadFile('id', e.target.files[0]) : null} className="rounded-2xl border border-dashed border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" />
          {uploadingField === 'id' ? <span className="text-xs text-slate-400">Uploading...</span> : null}
          {idDocumentUrl ? <span className="block text-xs text-emerald-300">Uploaded: {idDocumentUrl}</span> : null}
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Sample work proof</span>
          <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(e) => e.target.files?.[0] ? uploadFile('sample', e.target.files[0]) : null} className="rounded-2xl border border-dashed border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" />
          {uploadingField === 'sample' ? <span className="text-xs text-slate-400">Uploading...</span> : null}
          {sampleWorkUrl ? <span className="block text-xs text-emerald-300">Uploaded: {sampleWorkUrl}</span> : null}
        </label>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-white">Choose approved starter services</p>
        <div className="grid gap-3 md:grid-cols-2">
          {services.map((service) => {
            const active = selectedServices.includes(service.id);
            return (
              <button
                type="button"
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${active ? 'border-trust-500 bg-trust-500/10 text-trust-100' : 'border-slate-800 bg-slate-950/70 text-slate-300'}`}
              >
                <p className="font-medium">{service.name}</p>
                <p className="mt-1 text-xs opacity-75">{service.category.name}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-trust-500/20 bg-trust-500/10 p-4 text-sm text-trust-100">
        After application, ops team reviews identity proof, sample work, and selected skills before trial jobs are enabled.
      </div>

      <button onClick={submitApplication} disabled={loading || uploadingField !== null} className="rounded-2xl bg-trust-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60">
        {loading ? 'Submitting...' : 'Submit worker application'}
      </button>
      {message ? <p className="text-sm text-trust-200">{message}</p> : null}
    </div>
  );
}
