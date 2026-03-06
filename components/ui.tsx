import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-7xl px-4 md:px-6', className)}>{children}</div>;
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs text-slate-200', className)}>
      {children}
    </span>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('card p-5', className)}>{children}</div>;
}

export function SectionTitle({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="max-w-2xl space-y-3">
      {eyebrow ? <p className="text-sm font-medium uppercase tracking-[0.25em] text-trust-300">{eyebrow}</p> : null}
      <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h2>
      {description ? <p className="text-base text-slate-300 md:text-lg">{description}</p> : null}
    </div>
  );
}

export function Button({ href, children, className, variant = 'primary' }: { href?: string; children: ReactNode; className?: string; variant?: 'primary' | 'secondary'; }) {
  const styles = variant === 'primary'
    ? 'bg-trust-500 text-slate-950 hover:bg-trust-400'
    : 'bg-slate-800 text-white hover:bg-slate-700';

  if (href) {
    return (
      <Link href={href} className={cn('inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition', styles, className)}>
        {children}
      </Link>
    );
  }

  return <button className={cn('rounded-2xl px-5 py-3 text-sm font-semibold transition', styles, className)}>{children}</button>;
}
