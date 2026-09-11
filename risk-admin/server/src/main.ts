import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  console.log(`✅ 风险评分后端服务已启动: http://localhost:${port}`);
  console.log(`   WS 推送命名空间: ws://localhost:${port}/ws/admin/notify`);
}

bootstrap();
