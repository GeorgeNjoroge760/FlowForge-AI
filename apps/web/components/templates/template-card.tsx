'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Copy, Users } from 'lucide-react';
import Link from 'next/link';
import type { Template } from '@/types';

interface TemplateCardProps {
  template: Template;
  onClone?: (id: string) => void;
  loading?: boolean;
}

export function TemplateCard({ template, onClone, loading = false }: TemplateCardProps) {
  const [cloning, setCloning] = useState(false);

  const handleClone = async () => {
    setCloning(true);
    try {
      await onClone?.(template.id);
    } finally {
      setCloning(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="h-3 w-3 fill-yellow-500/50 text-yellow-500" />
        );
      } else {
        stars.push(
          <Star key={i} className="h-3 w-3 text-muted-foreground" />
        );
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col transition-colors hover:border-primary/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{template.name}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {template.category}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {template.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            {renderStars(template.rating)}
            <span className="ml-1">{template.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{template.usageCount.toLocaleString()} uses</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Link href={`/templates/${template.id}`} className="flex-1">
          <Button variant="outline" className="w-full" size="sm">
            View Details
          </Button>
        </Link>
        <Button
          size="sm"
          onClick={handleClone}
          disabled={cloning}
        >
          {cloning ? (
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Cloning...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Copy className="h-3 w-3" />
              Clone
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}