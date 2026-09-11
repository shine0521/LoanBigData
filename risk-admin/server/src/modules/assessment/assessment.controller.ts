import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AssessmentService } from './assessment.service';
import { AssessmentQueryDto } from './dto/assessment-query.dto';

/**
 * 评估/评分控制器（后台，需登录）
 * GET  /api/admin/assessments         列表
 * GET  /api/admin/assessments/:id     详情（含 score_detail）
 * POST /api/admin/assessments/:id/recalc  手动重算
 */
@UseGuards(JwtAuthGuard)
@Controller('admin/assessments')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Get()
  findAll(@Query() query: AssessmentQueryDto) {
    return this.assessmentService.findAll(query);
  }

  @Get(':id')
  findDetail(@Param('id') id: string) {
    return this.assessmentService.findDetail(Number(id));
  }

  @Post(':id/recalc')
  recalc(
    @Param('id') id: string,
    @CurrentUser() user: { id: number; username: string },
  ) {
    return this.assessmentService.recalc(Number(id), user);
  }
}
