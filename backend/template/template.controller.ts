import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { TemplateService } from './template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  createTemplate(@Body() body: CreateTemplateDto) {
    return this.templateService.createTemplate(body);
  }

  @Get()
  loadTemplate(@Query('path') path?: string) {
    return this.templateService.loadTemplate(path);
  }

  @Patch()
  updateTemplate(@Body() body: UpdateTemplateDto) {
    return this.templateService.updateTemplate(body);
  }
}
