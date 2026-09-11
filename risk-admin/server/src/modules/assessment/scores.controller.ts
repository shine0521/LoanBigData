import {
  Body,
  Controller,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AssessmentService } from './assessment.service';
import { ScoresUpdateDto } from './dto/scores-update.dto';

/**
 * 人工修正评分控制器（后台，需登录）
 * PUT /api/admin/scores/:id  —— :id 为 score_detail 主键
 */
@UseGuards(JwtAuthGuard)
@Controller('admin/scores')
export class ScoresController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Put(':id')
  correctScore(
    @Param('id') id: string,
    @Body() dto: ScoresUpdateDto,
    @CurrentUser() user: { id: number; username: string },
  ) {
    return this.assessmentService.correctScore(Number(id), dto, user);
  }
}
