import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { WorkflowNodesModule } from './modules/workflow-nodes/workflow-nodes.module';
import { WorkflowEdgesModule } from './modules/workflow-edges/workflow-edges.module';
import { ExecutionsModule } from './modules/executions/executions.module';
import { ExecutionLogsModule } from './modules/execution-logs/execution-logs.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { OAuthTokensModule } from './modules/oauth-tokens/oauth-tokens.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { UsageModule } from './modules/usage/usage.module';
import { WorkflowEngineModule } from './modules/workflow-engine/workflow-engine.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Database
    PrismaModule,

    // Auth
    AuthModule,

    // Health
    HealthModule,

    // Feature modules
    UsersModule,
    OrganizationsModule,
    WorkflowsModule,
    WorkflowNodesModule,
    WorkflowEdgesModule,
    ExecutionsModule,
    ExecutionLogsModule,
    IntegrationsModule,
    OAuthTokensModule,
    TemplatesModule,
    NotificationsModule,
    SubscriptionsModule,
    ApiKeysModule,
    UsageModule,
    WorkflowEngineModule,
    AiModule,
  ],
})
export class AppModule {}
