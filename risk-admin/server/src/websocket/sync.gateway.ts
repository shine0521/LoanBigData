import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

/**
 * 后台实时同步网关
 * 命名空间：/ws/admin/notify
 * 当 H5 端有新提交时，通过 notifyNewSubmit 向后台管理端广播事件。
 */
@WebSocketGateway({ namespace: '/ws/admin/notify', cors: { origin: '*' } })
export class SyncGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SyncGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket): void {
    this.logger.log(`WS 客户端连接: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`WS 客户端断开: ${client.id}`);
  }

  /**
   * 广播新提交事件 h5.submit.new
   * @param payload { profileId, customerId, name, phone(脱敏) }
   */
  notifyNewSubmit(payload: Record<string, any>): void {
    const message = {
      event: 'h5.submit.new',
      timestamp: new Date().toISOString(),
      data: payload,
    };
    this.server?.emit('h5.submit.new', message);
    this.logger.log(`广播事件 h5.submit.new: ${JSON.stringify(payload)}`);
  }
}
