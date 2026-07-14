import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <FileX className="h-16 w-16 text-muted-foreground/50" />
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-lg text-muted-foreground">Page not found</p>
      <p className="text-sm text-muted-foreground max-w-md text-center">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
