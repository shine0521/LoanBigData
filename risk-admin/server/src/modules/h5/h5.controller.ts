import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { H5Service } from './h5.service';
import { H5SubmitDto } from './dto/submit.dto';
import { QueryScoreDto } from './dto/query-score.dto';

/**
 * H5 公开接口（无需登录）
 * POST /api/h5/submit            提交用户信息（保存资料 + 创建评估 + 评分 + 广播）
 * POST /api/h5/query-score       查询评分结果
 * GET  /api/h5/assessment/:no    评估详情
 */
@Controller('h5')
export class H5Controller {
  constructor(private readonly h5Service: H5Service) {}

  @Post('submit')
  submit(@Body() dto: H5SubmitDto, @Req() req: Request) {
    return this.h5Service.submit(dto, req);
  }

  @Post('query-score')
  queryScore(@Body() dto: QueryScoreDto) {
    return this.h5Service.queryScore(dto);
  }

  @Get('assessment/:no')
  getAssessment(@Param('no') no: string) {
    return this.h5Service.getAssessment(no);
  }
}
