import 'reflect-metadata';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import express from 'express';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from './app.module';
import type { AppEnvironment } from './config/app.environment';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';
import { PrismaService } from './modules/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);
  const prismaService: PrismaService = app.get(PrismaService);
  const appConfig = configService.getOrThrow<AppEnvironment>('app');

  app.enableCors({
    origin: appConfig.frontendUrl,
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.use(cookieParser());
  const uploadsPath = join(process.cwd(), 'apps', 'backend', 'uploads');
  if (!existsSync(uploadsPath)) {
    mkdirSync(uploadsPath, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsPath));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new RequestLoggingInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('TestForge API')
    .setDescription('Core backend foundation for the TestForge product management platform.')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  prismaService.enableShutdownHooks(app);
  await app.listen(appConfig.port);
}

void bootstrap();
