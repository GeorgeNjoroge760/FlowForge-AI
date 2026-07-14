'use client';

import { useCallback, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkflowStore, type WorkflowNodeData } from '@/store/workflow-store';
import { useUiStore } from '@/store/ui-store';
import { NODE_TYPES, type NodeCategory } from 'shared';

interface ConfigField {
  key: string;
  label: string;
  type: string;
  default?: unknown;
  options?: string[];
  description?: string;
  min?: number;
  max?: number;
}

function ConfigFieldRenderer({
  field,
  value,
  onChange,
}: {
  field: ConfigField;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  const fieldId = `config-${field.key}`;

  switch (field.type) {
    case 'string':
      return (
        <div className="space-y-1.5">
          <Label htmlFor={fieldId} className="text-xs">
            {field.label}
          </Label>
          <Input
            id={fieldId}
            value={String(value ?? field.default ?? '')}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.description}
            className="h-8 text-xs"
          />
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-1.5">
          <Label htmlFor={fieldId} className="text-xs">
            {field.label}
          </Label>
          <Textarea
            id={fieldId}
            value={String(value ?? field.default ?? '')}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.description}
            className="min-h-[80px] text-xs"
          />
        </div>
      );

    case 'number':
      return (
        <div className="space-y-1.5">
          <Label htmlFor={fieldId} className="text-xs">
            {field.label}
          </Label>
          <Input
            id={fieldId}
            type="number"
            value={String(value ?? field.default ?? '')}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            min={field.min}
            max={field.max}
            placeholder={field.description}
            className="h-8 text-xs"
          />
        </div>
      );

    case 'select':
      return (
        <div className="space-y-1.5">
          <Label className="text-xs">{field.label}</Label>
          <Select
            value={String(value ?? field.default ?? '')}
            onValueChange={(val) => onChange(val)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder={field.description} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt} value={opt} className="text-xs">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case 'boolean':
      return (
        <div className="flex items-center justify-between">
          <Label htmlFor={fieldId} className="text-xs">
            {field.label}
          </Label>
          <button
            id={fieldId}
            onClick={() => onChange(!value)}
            className={cn(
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors',
              value ? 'bg-primary' : 'bg-muted'
            )}
          >
            <span
              className={cn(
                'pointer-events-none block h-3.5 w-3.5 rounded-full bg-background shadow-sm transition-transform',
                value ? 'translate-x-4.5' : 'translate-x-0.5'
              )}
            />
          </button>
        </div>
      );

    case 'json':
      return (
        <div className="space-y-1.5">
          <Label htmlFor={fieldId} className="text-xs">
            {field.label}
          </Label>
          <Textarea
            id={fieldId}
            value={
              typeof value === 'object'
                ? JSON.stringify(value, null, 2)
                : String(value ?? field.default ?? '')
            }
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value));
              } catch {
                onChange(e.target.value);
              }
            }}
            placeholder={field.description}
            className="min-h-[80px] font-mono text-xs"
          />
        </div>
      );

    default:
      return (
        <div className="space-y-1.5">
          <Label htmlFor={fieldId} className="text-xs">
            {field.label}
          </Label>
          <Input
            id={fieldId}
            value={String(value ?? field.default ?? '')}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      );
  }
}

export function NodeConfigPanel() {
  const { nodes, selectedNodeId, updateNodeData, removeNode, selectNode } =
    useWorkflowStore();
  const { configPanelOpen, setConfigPanelOpen } = useUiStore();

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId]
  );

  const nodeData = selectedNode?.data as WorkflowNodeData | undefined;
  const typeInfo = nodeData ? NODE_TYPES[nodeData.category as NodeCategory] : null;

  const configFields: ConfigField[] = useMemo(() => {
    if (!typeInfo) return [];
    const schema = typeInfo.configSchema as Record<string, ConfigField>;
    return Object.entries(schema).map(([key, val]) => ({
      ...val,
      key,
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
    }));
  }, [typeInfo]);

  const handleConfigChange = useCallback(
    (key: string, value: unknown) => {
      if (!selectedNodeId || !nodeData) return;
      updateNodeData(selectedNodeId, {
        config: { ...nodeData.config, [key]: value },
      });
    },
    [selectedNodeId, nodeData, updateNodeData]
  );

  const handleLabelChange = useCallback(
    (value: string) => {
      if (!selectedNodeId) return;
      updateNodeData(selectedNodeId, { label: value });
    },
    [selectedNodeId, updateNodeData]
  );

  const handleDelete = useCallback(() => {
    if (!selectedNodeId) return;
    removeNode(selectedNodeId);
    setConfigPanelOpen(false);
  }, [selectedNodeId, removeNode, setConfigPanelOpen]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setConfigPanelOpen(open);
      if (!open) selectNode(null);
    },
    [setConfigPanelOpen, selectNode]
  );

  if (!selectedNode || !nodeData) return null;

  const typeColors: Record<string, string> = {
    TRIGGER: 'text-emerald-500',
    ACTION: 'text-blue-500',
    LOGIC: 'text-purple-500',
  };

  return (
    <Sheet open={configPanelOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="w-80 sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className={cn('text-xs font-medium uppercase', typeColors[nodeData.type])}>
              {nodeData.type}
            </span>
          </SheetTitle>
          <SheetDescription>Configure this node</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Label</Label>
            <Input
              value={nodeData.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <div className="h-px bg-border" />

          {configFields.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground">
                {typeInfo?.label} Settings
              </p>
              {configFields.map((field) => (
                <ConfigFieldRenderer
                  key={field.key}
                  field={field}
                  value={nodeData.config?.[field.key]}
                  onChange={(val) => handleConfigChange(field.key, val)}
                />
              ))}
            </div>
          )}

          <div className="h-px bg-border" />

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="w-full"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete Node
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
