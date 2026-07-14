'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { NODE_TYPES, type NodeCategory, type NodeTypeInfo } from 'shared';

const CATEGORIES: Record<string, { label: string; types: NodeCategory[] }> = {
  triggers: {
    label: 'Triggers',
    types: Object.keys(NODE_TYPES).filter(
      (key) => NODE_TYPES[key as NodeCategory].type === 'TRIGGER'
    ) as NodeCategory[],
  },
  actions: {
    label: 'Actions',
    types: Object.keys(NODE_TYPES).filter(
      (key) => NODE_TYPES[key as NodeCategory].type === 'ACTION'
    ) as NodeCategory[],
  },
  logic: {
    label: 'Logic',
    types: Object.keys(NODE_TYPES).filter(
      (key) => NODE_TYPES[key as NodeCategory].type === 'LOGIC'
    ) as NodeCategory[],
  },
};

function DraggableNodeItem({ nodeType }: { nodeType: NodeTypeInfo }) {
  function onDragStart(event: React.DragEvent, category: NodeCategory) {
    event.dataTransfer.setData('application/reactflow-category', category);
    event.dataTransfer.setData('application/reactflow-type', nodeType.type);
    event.dataTransfer.effectAllowed = 'move';
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, nodeType.category)}
      className={cn(
        'flex items-center gap-3 rounded-md border border-border/50 bg-card p-3',
        'cursor-grab select-none transition-all hover:border-border hover:bg-accent/50',
        'active:cursor-grabbing'
      )}
    >
      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{nodeType.label}</p>
        <p className="truncate text-xs text-muted-foreground">
          {nodeType.description}
        </p>
      </div>
    </div>
  );
}

export function NodePalette() {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filteredCategories = useMemo(() => {
    if (!search) return CATEGORIES;

    const query = search.toLowerCase();
    const result: typeof CATEGORIES = {};

    for (const [key, category] of Object.entries(CATEGORIES)) {
      const filteredTypes = category.types.filter((type) => {
        const info = NODE_TYPES[type];
        return (
          info.label.toLowerCase().includes(query) ||
          info.description.toLowerCase().includes(query)
        );
      });

      if (filteredTypes.length > 0) {
        result[key] = { ...category, types: filteredTypes };
      }
    }

    return result;
  }, [search]);

  function toggleGroup(key: string) {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-background">
      <div className="border-b border-border p-3">
        <h3 className="mb-2 text-sm font-semibold text-foreground">
          Node Palette
        </h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {Object.entries(filteredCategories).length === 0 && (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No nodes found
            </p>
          )}

          {Object.entries(filteredCategories).map(([key, category]) => {
            const isCollapsed = collapsed[key] ?? false;

            return (
              <div key={key}>
                <button
                  onClick={() => toggleGroup(key)}
                  className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  {category.label}
                  <span className="ml-auto text-[10px] text-muted-foreground/60">
                    {category.types.length}
                  </span>
                </button>

                {!isCollapsed && (
                  <div className="space-y-1.5 pb-2 pl-1">
                    {category.types.map((type) => (
                      <DraggableNodeItem key={type} nodeType={NODE_TYPES[type]} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
