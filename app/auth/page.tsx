import { Navbar } from '@/components/navbar';
import { Container, SectionTitle } from '@/components/ui';
import { AuthClient } from './auth-client';

export default function AuthPage() {
  return (
    <main>
      <Navbar />
      <Container className="space-y-8 py-12">
        <SectionTitle eyebrow="Phase 3" title="Session auth, OTP, and protected routes" description="Switch roles instantly for testing or run the demo OTP flow. Phase 3 also adds middleware protection, upload auth checks, and event logging." />
        <AuthClient />
      </Container>
    </main>
  );
}
