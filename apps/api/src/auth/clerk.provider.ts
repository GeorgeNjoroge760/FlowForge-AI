import { createClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';

export const ClerkClientProvider = {
  provide: 'CLERK_CLIENT',
  useFactory: (configService: ConfigService) =>
    createClerkClient({
      publishableKey: configService.get<string>('CLERK_PUBLISHABLE_KEY'),
      secretKey: configService.get<string>('CLERK_SECRET_KEY'),
    }),
  inject: [ConfigService],
};
