import { ShieldCheck } from 'lucide-react';
import { Container, Button } from '@/components/ui';
import { getCurrentUser } from '@/lib/auth';

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <div className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur">
      <Container className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-trust-500/15 text-trust-300">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">TrustMitra</p>
            <p className="text-xs text-slate-400">Managed trust platform for daily-life services</p>
          </div>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Button href="/book" variant="secondary">Book service</Button>
          <Button href="/auth" variant="secondary">{user ? `${user.role.toLowerCase()} session` : 'Login'}</Button>
          <Button href="/admin">Admin console</Button>
        </div>
      </Container>
    </div>
  );
}
