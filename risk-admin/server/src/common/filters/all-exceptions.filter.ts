import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * 全局异常过滤器
 * 将异常统一包装为 { code, message, data: null }
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = '服务器内部错误';
    let code = status;

    if (exception instanceof HttpException) {
      const res = exception.getResponse() as any;
      if (typeof res === 'string') {
        message = res;
      } else if (res && typeof res === 'object') {
        const m = res.message;
        message = Array.isArray(m) ? m.join(', ') : m;
        if (typeof res.code === 'number') code = res.code;
      }
    }

    response.status(status).json({
      code,
      message: message || '请求失败',
      data: null,
    });
  }
}
