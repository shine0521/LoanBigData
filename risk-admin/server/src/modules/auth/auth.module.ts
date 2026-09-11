import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

/**
 * 鉴权模块
 */
@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
