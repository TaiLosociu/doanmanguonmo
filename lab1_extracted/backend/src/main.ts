import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 NestJS Backend API đang chạy tại: http://localhost:${port}`);
  logger.log(`📡 Neon DB Health Check: http://localhost:${port}/api/health`);
  logger.log(`👤 Profile API: http://localhost:${port}/api/profile`);
  logger.log(`💡 Skills API: http://localhost:${port}/api/skills`);
  logger.log(`📁 Projects API: http://localhost:${port}/api/projects`);
  logger.log(`🎓 Experiences API: http://localhost:${port}/api/experiences`);
  logger.log(`✉️ Contact API: http://localhost:${port}/api/contact`);
}

bootstrap();

