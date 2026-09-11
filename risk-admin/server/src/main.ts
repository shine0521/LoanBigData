import 'dotenv/config';
import { Controller, Get, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

/**
 * 健康检查控制器（不依赖任何业务模块，方便云端 readiness/liveness 探针）
 */
@Controller('health')
class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'risk-admin-api',
      pid: process.pid,
      uptime: Math.round(process.uptime()),
      ts: new Date().toISOString(),
    };
  }
}

async function bootstrap() {
  // 🚀 早期日志：必须出现在 NestFactory.create 之前，方便排查启动失败
  console.log('🚀 [STEP 1] Bootstrap start, PID:', process.pid);
  console.log('   ENV: DB_DRIVER=', process.env.DB_DRIVER, 'DB_HOST=', process.env.DB_HOST, 'PORT=', process.env.PORT);

  let app;
  try {
    app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });
    console.log('✅ [STEP 2] App created');
  } catch (err) {
    console.error('❌ [BOOT ERROR] NestFactory.create failed:', err);
    // 写文件：防止 stdout 被截断时丢日志
    try {
      const fs = await import('fs');
      fs.writeFileSync('/tmp/boot-error.log', `[${new Date().toISOString()}] ${(err as any)?.stack || String(err)}\n`);
    } catch {}
    process.exit(1);
  }

  // 注册健康检查路由（独立于 AppModule，避免业务模块加载失败时不可用）
  try {
    app.use((req: any, res: any, next: any) => {
      if (req.path === '/api/health') {
        return res.status(200).json({
          status: 'ok',
          service: 'risk-admin-api',
          pid: process.pid,
          uptime: Math.round(process.uptime()),
          ts: new Date().toISOString(),
        });
      }
      next();
    });
    console.log('✅ [STEP 3] Health route registered at /api/health');
  } catch (err) {
    console.error('⚠️ [STEP 3] Health route registration failed:', err);
  }

  // 全局前缀 /api（如 /api/admin/login、/api/h5/submit）
  app.setGlobalPrefix('api');

  // 允许跨域（H5 与 PC 后台共用 API）
  app.enableCors();

  // 全局参数校验：自动类型转换 + 去除多余字段
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  // 统一响应包装 { code, message, data }
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 统一异常过滤 { code, message, data: null }
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  console.log(`✅ [STEP 4] 风险评分后端服务已启动: http://localhost:${port}`);
  console.log(`   WS 推送命名空间: ws://localhost:${port}/ws/admin/notify`);
  console.log(`   Health: http://localhost:${port}/api/health`);
  console.log(`   DB_DRIVER: ${process.env.DB_DRIVER || 'mysql(default)'} | DB_HOST: ${process.env.DB_HOST || '(none)'}`);
}

bootstrap().catch((err) => {
  console.error('❌ [BOOTSTRAP-FAIL]', err);
  process.exit(1);
});