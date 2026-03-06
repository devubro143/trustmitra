import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TrustMitra System',
  description: 'Managed trust platform prototype for daily-life service jobs.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
