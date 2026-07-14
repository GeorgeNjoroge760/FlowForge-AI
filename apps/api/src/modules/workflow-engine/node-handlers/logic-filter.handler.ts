import { NodeHandler, NodeExecutionInput, NodeExecutionResult } from '../node-executor';

type FilterOperator =
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
  | 'regex';

interface FilterConfig {
  field?: string;
  operator?: FilterOperator;
  value?: unknown;
}

export class FilterHandler implements NodeHandler {
  category = 'LOGIC_FILTER';

  validate(config: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.field || typeof config.field !== 'string') {
      errors.push('field is required and must be a string');
    }

    const validOperators: FilterOperator[] = [
      'equals', 'not_equals', 'contains', 'not_contains',
      'starts_with', 'ends_with', 'gt', 'lt', 'gte', 'lte',
      'is_empty', 'is_not_empty', 'regex',
    ];

    if (config.operator && !validOperators.includes(config.operator as FilterOperator)) {
      errors.push(`operator must be one of: ${validOperators.join(', ')}`);
    }

    return { valid: errors.length === 0, errors };
  }

  async execute(
    input: NodeExecutionInput,
    config: Record<string, unknown>,
  ): Promise<NodeExecutionResult> {
    const cfg = config as unknown as FilterConfig;
    const field = cfg.field!;
    const operator = (cfg.operator as FilterOperator) || 'equals';
    const comparisonValue = cfg.value;

    const firstInput = Object.values(input.previousOutputs)[0] as Record<string, unknown> || {};

    const fieldValue = getNestedValue(firstInput, field);
    const passes = evaluateFilter(fieldValue, operator, comparisonValue);

    return {
      data: {
        ...firstInput,
        _filterPasses: passes,
        _filterField: field,
        _filterOperator: operator,
      },
      metadata: {
        field,
        operator,
        passes,
        fieldValue: fieldValue !== undefined ? String(fieldValue) : undefined,
      },
    };
  }
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: any, key: string) => {
    return current?.[key];
  }, obj);
}

function evaluateFilter(
  fieldValue: unknown,
  operator: FilterOperator,
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

    default:
      return false;
  }
}
