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
    const admin = this.defaultAdmins.find((a) => a.username === dto.username);

    // TODO: 生产环境改为查库 + bcrypt.compare(明文, 密文)
    if (!admin || admin.password !== dto.password) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const payload = {
      sub: 0, // 默认管理员 ID（内存账号固定为 0）
      username: admin.username,
      role: admin.role,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      user: {
        username: admin.username,
        role: admin.role,
        realName: admin.realName,
      },
    };
  }
}
