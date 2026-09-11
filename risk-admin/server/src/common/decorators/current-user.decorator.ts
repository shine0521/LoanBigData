import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 获取当前登录用户（由 JwtAuthGuard 挂载到 request.user）
 * 用法：@CurrentUser() user / @CurrentUser('username') username
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
