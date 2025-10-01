import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';
import { TemplateService } from './template.service';
import { CreateTemplateDto, CreateTemplateResponse } from './dto/create-template.dto';
import { UpdateTemplateDto, UpdateTemplateResponse } from './dto/update-template.dto';

@ApiTags('templates')
@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new template configuration.' })
  @ApiBody({ type: CreateTemplateDto })
  @ApiOkResponse({ type: CreateTemplateResponse })
  createTemplate(@Body() body: CreateTemplateDto) {
    return this.templateService.createTemplate(body);
  }

  @Get()
  @ApiOperation({ summary: 'Load a template configuration from disk.' })
  @ApiQuery({ name: 'path', required: true, description: 'Filesystem path of the template JSON file to load.' })
  @ApiOkResponse({ description: 'Template configuration JSON.', schema: { type: 'object' } })
  loadTemplate(@Query('path') path?: string) {
    return this.templateService.loadTemplate(path);
  }

  @Patch()
  @ApiOperation({ summary: 'Update an existing template configuration file.' })
  @ApiBody({ type: UpdateTemplateDto })
  @ApiOkResponse({ type: UpdateTemplateResponse })
  updateTemplate(@Body() body: UpdateTemplateDto) {
    return this.templateService.updateTemplate(body);
  }
}
