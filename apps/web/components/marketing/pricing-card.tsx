import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  ctaHref,
  highlighted = false,
}: PricingCardProps) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-8 ${
        highlighted
          ? 'border-blue-500 shadow-lg shadow-blue-500/10'
          : 'border-border/60'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-block rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-1 text-xs font-medium text-white">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        {period && <span className="text-muted-foreground ml-1">/{period}</span>}
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Link href={ctaHref}>
        <Button
          className="w-full"
          variant={highlighted ? 'default' : 'outline'}
          size="lg"
        >
          {cta}
        </Button>
      </Link>
    </div>
  );
}
