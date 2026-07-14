import { Module } from '@nestjs/common';
import { OAuthTokensService } from './oauth-tokens.service';

@Module({
  providers: [OAuthTokensService],
  exports: [OAuthTokensService],
})
export class OAuthTokensModule {}
