import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerProfile, RiskAssessment, ScoreDetail } from '../../entities';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

/**
 * 工作台统计模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerProfile, RiskAssessment, ScoreDetail]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
