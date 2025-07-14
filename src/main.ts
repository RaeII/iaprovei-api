import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { patchNestJsSwagger } from 'nestjs-zod';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  dotenv.config({ path: join(__dirname, '..', '.env') });
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  patchNestJsSwagger();
  const config = new DocumentBuilder().setTitle('API').setDescription('API description').setVersion('1.0').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
