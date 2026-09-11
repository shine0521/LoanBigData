import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AdminUser,
  Customer,
  CustomerProfile,
  RiskAssessment,
  ScoreDetail,
  SyncRecord,
  OperationLog,
  SysDict,
} from './entities';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { CustomerModule } from './modules/customer/customer.module';
import { ProfileModule } from './modules/profile/profile.module';
import { AssessmentModule } from './modules/assessment/assessment.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AdminUserModule } from './modules/admin-user/admin-user.module';
import { LogModule } from './modules/log/log.module';
import { H5Module } from './modules/h5/h5.module';

/**
 * 数据库配置
 * - 生产环境: MySQL（DB_HOST 等环境变量）
 * - 本地开发无 MySQL 时: 自动降级为 sqljs（纯 WASM SQLite，零安装）
 *   只需设置 DB_DRIVER=sqljs 或不提供 DB_HOST 即可触发
 */
const useSqljs =
  process.env.DB_DRIVER === 'sqljs' ||
  !process.env.DB_HOST ||
  process.env.DB_HOST === '';

const dbConfig = useSqljs
  ? {
      type: 'sqljs' as const,
      database: new Uint8Array([]), // 内存模式初始数据
      location: 'risk-score.sqlite', // 持久化到本地文件
      autoSave: true, // 写操作自动保存
      entities: [
        AdminUser,
        Customer,
        CustomerProfile,
        RiskAssessment,
        ScoreDetail,
        SyncRecord,
        OperationLog,
        SysDict,
      ],
      synchronize: false, // sqljs 也保持 false，避免启动时差异同步
    }
  : {
      type: 'mysql' as const,
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'risk_admin',
      charset: 'utf8mb4',
      synchronize: false, // 生产环境禁用 synchronize（与手工建表冲突，会 DROP/ALTER）
      entities: [
        AdminUser,
        Customer,
        CustomerProfile,
        RiskAssessment,
        ScoreDetail,
        SyncRecord,
        OperationLog,
        SysDict,
      ],
    };

/**
 * 根模块
 * 注册 TypeOrm 并导入全部业务模块
 */
@Module({
  imports: [
    TypeOrmModule.forRoot(dbConfig),
    CommonModule,
    AuthModule,
    CustomerModule,
    ProfileModule,
    AssessmentModule,
    DashboardModule,
    AdminUserModule,
    LogModule,
    H5Module,
  ],
})
export class AppModule {}
