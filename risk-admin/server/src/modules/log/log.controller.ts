import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LogService } from './log.service';
import { LogQueryDto } from './dto/log-query.dto';

/**
 * 操作日志查询接口（后台，需登录）
 */
@UseGuards(JwtAuthGuard)
@Controller('admin/logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  list(@Query() query: LogQueryDto) {
    return this.logService.list({
      page: query.page,
      pageSize: query.pageSize,
      module: query.module,
    });
  }
}
