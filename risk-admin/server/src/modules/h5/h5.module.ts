import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Customer,
  CustomerProfile,
  RiskAssessment,
  ScoreDetail,
  SyncRecord,
} from '../../entities';
import { H5Service } from './h5.service';
import { H5Controller } from './h5.controller';
import { SyncModule } from '../../websocket/sync.module';
import { AssessmentModule } from '../assessment/assessment.module';

/**
 * H5 公开接口模块
 * 依赖 SyncModule（广播）与 AssessmentModule（ScoringService 确定性评分）
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      CustomerProfile,
      RiskAssessment,
      ScoreDetail,
      SyncRecord,
    ]),
    SyncModule,
    AssessmentModule,
  ],
  controllers: [H5Controller],
  providers: [H5Service],
})
export class H5Module {}
