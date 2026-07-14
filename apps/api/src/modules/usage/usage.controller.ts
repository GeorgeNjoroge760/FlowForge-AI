import { Controller, Get, Query } from '@nestjs/common';
import { UsageService } from './usage.service';

@Controller('usage')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Get()
  getCurrentPeriod(@Query('organizationId') organizationId?: string) {
    return this.usageService.getCurrentPeriod(organizationId || 'default-org');
  }

  @Get('history')
  getHistory(
    @Query('organizationId') organizationId?: string,
    @Query('months') months?: string,
  ) {
    return this.usageService.getHistory(
      organizationId || 'default-org',
      months ? parseInt(months, 10) : 6,
    );
  }
}
