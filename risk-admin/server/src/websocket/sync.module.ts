import { Module } from '@nestjs/common';
import { SyncGateway } from './sync.gateway';

/**
 * WebSocket 同步模块
 * 提供 SyncGateway，供其他模块（如 h5）注入后调用 notifyNewSubmit。
 */
@Module({
  providers: [SyncGateway],
  exports: [SyncGateway],
})
export class SyncModule {}
