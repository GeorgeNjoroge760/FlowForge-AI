import { NodeHandler, NodeExecutionInput, NodeExecutionResult } from '../node-executor';

type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'is_empty'
  | 'is_not_empty'
  | 'regex'
  | 'in'
  | 'not_in';

interface Condition {
  field: string;
  operator: ConditionOperator;
  value?: unknown;
}

interface ConditionConfig {
  conditions?: Condition[];
  combinator?: 'and' | 'or';
}

export class ConditionHandler implements NodeHandler {
  category = 'LOGIC_CONDITION';

  validate(config: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.combinator && !['and', 'or'].includes(config.combinator as string)) {
      errors.push('combinator must be "and" or "or"');
    }

    if (config.conditions && !Array.isArray(config.conditions)) {
      errors.push('conditions must be an array');
    }

    return { valid: errors.length === 0, errors };
  }

  async execute(
    input: NodeExecutionInput,
    config: Record<string, unknown>,
  ): Promise<NodeExecutionResult> {
    const cfg = config as unknown as ConditionConfig;
    const conditions = cfg.conditions || [];
    const combinator = cfg.combinator || 'and';

    const firstInput = Object.values(input.previousOutputs)[0] as Record<string, unknown> || {};

    const results: Array<{ condition: Condition; result: boolean; fieldValue: unknown }> = [];

    let overallResult = combinator === 'and';

    for (const condition of conditions) {
      const fieldValue = getNestedValue(firstInput, condition.field);
      const conditionResult = evaluateCondition(fieldValue, condition.operator, condition.value);

      results.push({
        condition,
        result: conditionResult,
        fieldValue,
      });

      if (combinator === 'and') {
        overallResult = overallResult && conditionResult;
      } else {
        overallResult = overallResult || conditionResult;
      }
    }

    return {
      data: {
        ...firstInput,
        _conditionResult: overallResult,
        _conditionDetails: results,
      },
      metadata: {
        combinator,
        totalConditions: conditions.length,
        passedCount: results.filter((r) => r.result).length,
        failedCount: results.filter((r) => !r.result).length,
      },
    };
  }
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: any, key: string) => {
    return current?.[key];
  }, obj);
}

function evaluateCondition(
  fieldValue: unknown,
  operator: ConditionOperator,
  comparisonValue?: unknown,
): boolean {
  switch (operator) {
    case 'equals':
      return fieldValue === comparisonValue || String(fieldValue) === String(comparisonValue);

    case 'not_equals':
      return fieldValue !== comparisonValue && String(fieldValue) !== String(comparisonValue);

    case 'contains':
      return String(fieldValue).includes(String(comparisonValue));

    case 'not_contains':
      return !String(fieldValue).includes(String(comparisonValue));

    case 'starts_with':
      return String(fieldValue).startsWith(String(comparisonValue));

    case 'ends_with':
      return String(fieldValue).endsWith(String(comparisonValue));

    case 'gt':
      return Number(fieldValue) > Number(comparisonValue);

    case 'lt':
      return Number(fieldValue) < Number(comparisonValue);

    case 'gte':
      return Number(fieldValue) >= Number(comparisonValue);

    case 'lte':
      return Number(fieldValue) <= Number(comparisonValue);

    case 'is_empty':
      return !fieldValue || fieldValue === '' || (Array.isArray(fieldValue) && fieldValue.length === 0);

    case 'is_not_empty':
      return !!fieldValue && fieldValue !== '' && (!Array.isArray(fieldValue) || fieldValue.length > 0);

    case 'regex': {
      try {
        const regex = new RegExp(String(comparisonValue));
        return regex.test(String(fieldValue));
      } catch {
        return false;
      }
    }

    case 'in': {
      if (Array.isArray(comparisonValue)) {
        return comparisonValue.includes(fieldValue);
      }
      return false;
    }

    case 'not_in': {
      if (Array.isArray(comparisonValue)) {
        return !comparisonValue.includes(fieldValue);
      }
      return true;
    }

    default:
      return false;
  }
}
