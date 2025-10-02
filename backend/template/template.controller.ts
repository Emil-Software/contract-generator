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
import { UpdateContentDto, UpdateTemplateDto, UpdateTemplateResponse } from './dto/update-template.dto';


@ApiTags('templates')
@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  @ApiOperation({ summary: 'Load a template configuration from disk.' })
  @ApiQuery({ name: 'path', required: false, description: 'Filesystem path of the template JSON file to load.' })
  @ApiOkResponse({ description: 'Template configuration JSON.', schema: { type: 'object' } })
  async loadTemplate(@Query('path') path?: string) {
    const config = await this.templateService.loadTemplate(path);
    return config;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new template configuration.' })
  @ApiBody({ type: CreateTemplateDto })
  @ApiOkResponse({ type: CreateTemplateResponse })
  createTemplate(@Body() body: CreateTemplateDto) {
    return this.templateService.createTemplate(body);
  }

  @Patch()
  @ApiOperation({ summary: 'Update an existing template configuration file.' })
  @ApiBody({ type: UpdateTemplateDto })
  @ApiOkResponse({ type: UpdateTemplateResponse })
  updateTemplate(@Body() body: UpdateTemplateDto) {
    return this.templateService.updateTemplate(body);
  }

  @Patch('content')
  @ApiOperation({ summary: 'Update the content of the document.' })
  @ApiBody({ type: UpdateContentDto })
  @ApiOkResponse({ type: UpdateTemplateResponse })
  updateContent(@Body() body: UpdateContentDto) {
    return this.templateService.updateContent(body);
  }

}
