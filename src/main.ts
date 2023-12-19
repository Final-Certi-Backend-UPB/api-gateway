import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { AppModule } from './app.module';
import { env } from './config/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: [env.logLevel]
  });

  app.setGlobalPrefix('/api/v1');
  app.enableCors();

  const document = JSON.parse(
    (await readFile(join(process.cwd(), '/docs/swagger.json'), { encoding: 'utf-8' })
    ));
  SwaggerModule.setup('/api-docs', app, document);

  await app.listen(env.port);
}
bootstrap();
