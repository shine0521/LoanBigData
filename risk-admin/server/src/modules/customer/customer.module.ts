import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../../entities';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { LogModule } from '../log/log.module';

/**
 * 客户管理模块（主数据 CRUD）
 */
@Module({
  imports: [TypeOrmModule.forFeature([Customer]), LogModule],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
