'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LogViewerProps {
  data: Record<string, unknown>;
  className?: string;
  maxHeight?: number;
}

export function LogViewer({ data, className, maxHeight = 200 }: LogViewerProps) {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'relative rounded-lg border bg-muted/50 overflow-hidden',
        className
      )}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <span className="text-xs font-medium text-muted-foreground">JSON</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
      <ScrollArea style={{ height: maxHeight }}>
        <pre className="p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-words">
          <SyntaxHighlight json={jsonString} />
        </pre>
      </ScrollArea>
    </div>
  );
}

function SyntaxHighlight({ json }: { json: string }) {
  const highlighted = json
    .replace(/"([^"]+)":/g, '<span class="text-violet-500">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="text-green-500">"$1"</span>')
    .replace(/: (\d+)/g, ': <span class="text-orange-500">$1</span>')
    .replace(/: (true|false)/g, ': <span class="text-cyan-500">$1</span>')
    .replace(/: (null)/g, ': <span class="text-muted-foreground">$1</span>');

  return (
    <code
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
}