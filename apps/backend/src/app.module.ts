import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appEnvironment } from './config/app.environment';
import { validateEnvironment } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { ProductsModule } from './modules/products/products.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: ['.env', '../../.env'],
      load: [appEnvironment],
      validate: validateEnvironment,
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ProductsModule,
  ],
})
export class AppModule {}
