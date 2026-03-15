import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserListItemDto } from './dto/user-list-item.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List users for admin management' })
  @ApiOkResponse({ type: PaginatedResponseDto<UserListItemDto> })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  listUsers(@Query() query: ListUsersQueryDto) {
    return this.usersService.listUsers(query);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user role or status' })
  @ApiOkResponse({ type: UserListItemDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  updateUser(@Param('id') userId: string, @Body() body: UpdateUserDto) {
    return this.usersService.updateUser(userId, body);
  }
}
