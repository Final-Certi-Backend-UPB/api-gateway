import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './config/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/api/v1');
  app.enableCors();
  await app.listen(env.port);
}
bootstrap();
