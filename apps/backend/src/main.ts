import 'reflect-metadata';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import express from 'express';
import type { Express, Request, Response } from 'express';
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

  const expressApp = app.getHttpAdapter().getInstance() as Express;

  expressApp.get('/', (_request: Request, response: Response) => {
    response.type('html').send(`
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>TestForge API</title>
          <style>
            body {
              margin: 0;
              font-family: Segoe UI, Arial, sans-serif;
              background: linear-gradient(180deg, #f8fbff 0%, #eef4f8 100%);
              color: #102134;
            }
            main {
              max-width: 760px;
              margin: 0 auto;
              padding: 48px 20px 64px;
            }
            .card {
              background: rgba(255, 255, 255, 0.9);
              border: 1px solid rgba(16, 33, 52, 0.08);
              border-radius: 24px;
              padding: 24px;
              box-shadow: 0 12px 40px rgba(16, 33, 52, 0.08);
            }
            a {
              color: #0f62fe;
              font-weight: 600;
            }
            code {
              background: #eef4f8;
              border-radius: 8px;
              padding: 2px 6px;
            }
          </style>
        </head>
        <body>
          <main>
            <div class="card">
              <p>TestForge API</p>
              <h1>Backend em execucao.</h1>
              <p>Este servidor expoe a API da aplicacao, a documentacao Swagger e o healthcheck.</p>
              <ul>
                <li><a href="/api/docs">Documentacao Swagger</a></li>
                <li><a href="/api/v1/health">Healthcheck da API</a></li>
                <li>Frontend esperado em <code>${appConfig.frontendUrl}</code></li>
              </ul>
            </div>
          </main>
        </body>
      </html>
    `);
  });

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

  try {
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  } catch (error) {
    console.warn('Swagger setup skipped due to runtime schema generation issue.', error);
  }

  prismaService.enableShutdownHooks(app);
  await app.listen(appConfig.port);
}

void bootstrap();
