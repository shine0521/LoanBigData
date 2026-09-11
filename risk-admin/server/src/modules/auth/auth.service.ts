import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

/**
 * 鉴权服务
 * 说明：默认账号走内存校验（admin / 123456），便于快速启动。
 * TODO: 生产环境改为查询 admin_user 表 + bcrypt.compare 校验密码。
 */
@Injectable()
export class AuthService {
  // 内存默认账号（占位）
  private readonly defaultAdmins = [
    {
      username: 'admin',
      password: '123456',
      role: 'super_admin',
      realName: '超级管理员',
    },
  ];

  constructor(private readonly jwtService: JwtService) {}

  async login(dto: LoginDto) {
    // 🐛 DEBUG: 打印真实收到的 dto（用于排查 401）
    console.error('[AUTH-DEBUG] dto:', JSON.stringify({
      raw: dto,
      username: dto?.username,
      usernameType: typeof dto?.username,
      password: dto?.password,
      passwordType: typeof dto?.password,
      passwordLen: dto?.password?.length,
      keys: dto ? Object.keys(dto) : null,
    }));

    const username = String(dto?.username ?? '').trim();
    const password = String(dto?.password ?? '').trim();

    // TODO: 生产环境改为查库 + bcrypt.compare(明文, 密文)
    if (username !== 'admin' || password !== '123456') {
      console.error('[AUTH-DEBUG] FAILED - u:', username, 'pLen:', password.length);
      throw new UnauthorizedException('用户名或密码错误');
    }

    const payload = {
      sub: 0, // 默认管理员 ID（内存账号固定为 0）
      username: 'admin',
      role: 'super_admin',
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      user: {
        username: 'admin',
        role: 'super_admin',
        realName: '超级管理员',
      },
    };
  }
}
