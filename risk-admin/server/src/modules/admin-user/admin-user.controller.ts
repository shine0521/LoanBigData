import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminUserService } from './admin-user.service';
import { PageQueryDto } from '../../common/dto/page-query.dto';

/**
 * 管理员账号控制器（后台，需登录）
 * GET /api/admin/users
 */
@UseGuards(JwtAuthGuard)
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get()
  list(@Query() query: PageQueryDto) {
    return this.adminUserService.list(query);
  }
}
