import { Controller, Get, Patch, Param, Query, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationsService.findAll('default-user', {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      unreadOnly: unreadOnly === 'true',
    });
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id, 'default-user');
  }

  @Patch('read-all')
  markAllAsRead() {
    return this.notificationsService.markAllAsRead('default-user');
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { read?: boolean }) {
    if (body.read === true) {
      return this.notificationsService.markAsRead(id, 'default-user');
    }
    return this.notificationsService.findById(id, 'default-user');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findById(id, 'default-user');
  }
}
