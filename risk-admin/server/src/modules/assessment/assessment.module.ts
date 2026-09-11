import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer, RiskAssessment, ScoreDetail } from '../../entities';
import { AssessmentService } from './assessment.service';
import { ScoringService } from './scoring.service';
import { AssessmentController } from './assessment.controller';
import { ScoresController } from './scores.controller';
import { LogModule } from '../log/log.module';

/**
 * 评估/评分模块
 * 导出 ScoringService，供 h5 模块注入使用
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([RiskAssessment, ScoreDetail, Customer]),
    LogModule,
  ],
  controllers: [AssessmentController, ScoresController],
  providers: [AssessmentService, ScoringService],
  exports: [AssessmentService, ScoringService],
})
export class AssessmentModule {}
