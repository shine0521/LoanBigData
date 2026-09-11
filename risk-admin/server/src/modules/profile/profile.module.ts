import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerProfile } from '../../entities';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';

/**
 * 资料记录模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([CustomerProfile])],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
