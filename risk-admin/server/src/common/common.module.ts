import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * 公共模块（全局）
 * 注册 JwtModule（全局可用），提供 JwtAuthGuard 守卫。
 * 其他业务模块无需重复导入即可使用 @UseGuards(JwtAuthGuard)。
 */
@Global()
@Module({
  imports: [
    JwtModule.register({
      // 生产环境务必使用环境变量中的强密钥
      secret: process.env.JWT_SECRET || 'risk-admin-secret',
      signOptions: { expiresIn: '2h' },
      global: true, // 全局注册 JwtService
    }),
  ],
  providers: [JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule],
})
export class CommonModule {}
