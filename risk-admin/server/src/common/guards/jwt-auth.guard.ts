import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * 简易 JWT 鉴权守卫
 * 从 Authorization: Bearer <token> 解析并校验，将 payload 挂载到 request.user
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('缺少 Authorization 头');
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) {
      throw new UnauthorizedException('令牌为空');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'risk-admin-secret',
      });
      (request as any).user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('令牌无效或已过期');
    }
  }
}
