import { NodeHandler, NodeExecutionInput, NodeExecutionResult } from '../node-executor';

interface ScheduleConfig {
  interval?: number;
  unit?: 'seconds' | 'minutes' | 'hours' | 'days';
  cron?: string;
}

export class ScheduleHandler implements NodeHandler {
  category = 'TRIGGER_SCHEDULE';

  validate(config: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.interval !== undefined) {
      const interval = Number(config.interval);
      if (isNaN(interval) || interval < 1) {
        errors.push('interval must be a positive number');
      }
    }

    if (config.unit) {
      const validUnits = ['seconds', 'minutes', 'hours', 'days'];
      if (!validUnits.includes(config.unit as string)) {
        errors.push(`unit must be one of: ${validUnits.join(', ')}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  async execute(
    input: NodeExecutionInput,
    config: Record<string, unknown>,
  ): Promise<NodeExecutionResult> {
    const cfg = config as unknown as ScheduleConfig;
    const now = new Date();
    const tickId = `tick_${now.getTime()}_${Math.random().toString(36).slice(2, 8)}`;

    const interval = cfg.interval || 60;
    const unit = cfg.unit || 'seconds';

    let intervalMs: number;
    switch (unit) {
      case 'minutes': intervalMs = interval * 60 * 1000; break;
      case 'hours': intervalMs = interval * 60 * 60 * 1000; break;
      case 'days': intervalMs = interval * 24 * 60 * 60 * 1000; break;
      default: intervalMs = interval * 1000;
    }

    return {
      data: {
        tickId,
        triggeredAt: now.toISOString(),
        timestamp: now.getTime(),
        interval,
        unit,
        intervalMs,
        cron: cfg.cron || null,
      },
      metadata: {
        tickId,
        intervalMs,
        scheduledTime: now.toISOString(),
      },
    };
  }
}
