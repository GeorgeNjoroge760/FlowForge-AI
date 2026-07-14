import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ description: 'Get current user profile' })
  async getProfile(@CurrentUser() user: any) {
    if (!user?.id) {
      return null;
    }
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  @ApiOperation({ description: 'Update current user profile' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() body: { name?: string; avatarUrl?: string },
  ) {
    return this.usersService.update(user.id, body);
  }

  @Get(':id')
  @ApiOperation({ description: 'Get user by ID' })
  async getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
