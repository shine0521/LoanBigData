import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUser } from '../../entities';
import { AdminUserService } from './admin-user.service';
import { AdminUserController } from './admin-user.controller';

/**
 * 管理员账号模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([AdminUser])],
  controllers: [AdminUserController],
  providers: [AdminUserService],
  exports: [AdminUserService],
})
export class AdminUserModule {}
