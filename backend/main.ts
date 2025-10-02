import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';


const logger = new Logger('Avvio servizio');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('TemplateGenerator API')
    .setDescription('API REST per gestire i file di configurazione dei template documento.')
    .setVersion('1.0')
    // .addTag('templates')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ? Number(process.env.PORT) : 3005;
  await app.listen(port);
  logger.log(`TemplateGenerator API listening on http://localhost:${port}/api`);
  logger.log(`Swagger UI available at http://localhost:${port}/api/docs`);
}

void bootstrap();
