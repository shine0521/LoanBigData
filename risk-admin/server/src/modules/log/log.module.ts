import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationLog } from '../../entities';
import { LogService } from './log.service';
import { LogController } from './log.controller';

/**
 * 操作日志模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([OperationLog])],
  controllers: [LogController],
  providers: [LogService],
  exports: [LogService], // 供 customer / assessment 等模块注入以写审计
})
export class LogModule {}
