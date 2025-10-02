import { Module } from '@nestjs/common';
import { TemplateModule } from './template/template.module';
import { GenerateModule } from './generate/generate.module';

@Module({
  imports: [TemplateModule, GenerateModule],
})
export class AppModule {}
