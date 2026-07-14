import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface CTASectionProps {
  headline: string;
  subtext: string;
  ctaText: string;
  ctaHref: string;
}

export function CTASection({ headline, subtext, ctaText, ctaHref }: CTASectionProps) {
  return (
    <section className="border-t py-24">
      <div className="container text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">{headline}</h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{subtext}</p>
        <div className="mt-8">
          <Link href={ctaHref}>
            <Button size="lg" className="h-12 px-8">
              {ctaText} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
