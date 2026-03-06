import { ArrowRight, Clock3, Wallet } from 'lucide-react';
import Link from 'next/link';
import { Card, Badge } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

interface ServiceCardProps {
  category: string;
  name: string;
  description: string;
  duration: number;
  basePrice: number;
  maxPrice: number;
  serviceId: string;
}

export function ServiceCard(props: ServiceCardProps) {
  return (
    <Card className="flex h-full flex-col justify-between gap-5">
      <div className="space-y-4">
        <Badge>{props.category}</Badge>
        <div>
          <h3 className="text-xl font-semibold text-white">{props.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{props.description}</p>
        </div>
        <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-2">
          <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-trust-300" /> {props.duration} min</div>
          <div className="flex items-center gap-2"><Wallet className="h-4 w-4 text-emerald-300" /> {formatCurrency(props.basePrice)} - {formatCurrency(props.maxPrice)}</div>
        </div>
      </div>
      <Link href={`/book?serviceId=${props.serviceId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-trust-300">
        Book this service <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}
