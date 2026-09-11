import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProfileService } from './profile.service';
import { ProfileQueryDto } from './dto/profile-query.dto';

/**
 * 资料记录控制器（后台，需登录）
 * GET /api/admin/profiles —— H5 提交记录列表
 */
@UseGuards(JwtAuthGuard)
@Controller('admin/profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  findAll(@Query() query: ProfileQueryDto) {
    return this.profileService.findAll(query);
  }
}
