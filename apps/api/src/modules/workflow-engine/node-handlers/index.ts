import { NodeExecutor, NodeHandler } from '../node-executor';

import { OpenAIHandler } from './action-openai.handler';
import { SlackHandler } from './action-slack.handler';
import { EmailHandler } from './action-email.handler';
import { TelegramHandler } from './action-telegram.handler';
import { HttpHandler } from './action-http.handler';
import { WebhookHandler } from './trigger-webhook.handler';
import { ScheduleHandler } from './trigger-schedule.handler';
import { GmailHandler } from './trigger-gmail.handler';
import { ConditionHandler } from './logic-condition.handler';
import { FilterHandler } from './logic-filter.handler';
import { CodeHandler } from './logic-code.handler';

export {
  OpenAIHandler,
  SlackHandler,
  EmailHandler,
  TelegramHandler,
  HttpHandler,
  WebhookHandler,
  ScheduleHandler,
  GmailHandler,
  ConditionHandler,
  FilterHandler,
  CodeHandler,
};

const handlerClasses: Array<{ category: string; handler: NodeHandler }> = [
  { category: 'ACTION_OPENAI', handler: new OpenAIHandler() },
  { category: 'ACTION_SLACK', handler: new SlackHandler() },
  { category: 'ACTION_EMAIL', handler: new EmailHandler() },
  { category: 'ACTION_TELEGRAM', handler: new TelegramHandler() },
  { category: 'ACTION_HTTP_REQUEST', handler: new HttpHandler() },
  { category: 'TRIGGER_WEBHOOK', handler: new WebhookHandler() },
  { category: 'TRIGGER_SCHEDULE', handler: new ScheduleHandler() },
  { category: 'TRIGGER_CRON', handler: new ScheduleHandler() },
  { category: 'TRIGGER_GMAIL', handler: new GmailHandler() },
  { category: 'LOGIC_CONDITION', handler: new ConditionHandler() },
  { category: 'LOGIC_FILTER', handler: new FilterHandler() },
  { category: 'LOGIC_CODE', handler: new CodeHandler() },
];

export function registerAllHandlers(executor: NodeExecutor): void {
  for (const { category, handler } of handlerClasses) {
    executor.registerHandler(category, handler);
  }
}
