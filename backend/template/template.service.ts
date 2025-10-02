import { Injectable, BadRequestException } from '@nestjs/common';
import { TemplateGenerator } from '../../services/TemplateGenerator';
import { CreateTemplateDto, CreateTemplateResponse } from './dto/create-template.dto';
import { UpdateContentDto, UpdateTemplateDto, UpdateTemplateResponse } from './dto/update-template.dto';
import { DocumentConfig } from '../../interfaces/doc';
import { DocumentGenerator } from '../../ContractGenerator';

const DEFAULT_PATH_CONFIG = 'config.json';

@Injectable()
export class TemplateService {
  async createTemplate(dto: CreateTemplateDto): Promise<CreateTemplateResponse> {
    const generator = new TemplateGenerator();

    if (dto.template) {
      generator.setTemplate(dto.template);
    }

    let template: DocumentConfig;
    if (dto.template) {
      template = generator.getTemplate();
    } else {
      template = await generator.load();
    }

    if (dto.persist) {
      if (!dto.destinationPath) {
        throw new BadRequestException('destinationPath is required when persist is true.');
      }
      await generator.save(dto.destinationPath);
      return { template, savedPath: dto.destinationPath };
    }

    return { template };
  }

  async loadTemplate(path: string | undefined): Promise<DocumentConfig> {
    if (!path) {
      console.warn("default config.json");
      path = 'config.json';
      // throw new BadRequestException('Query parameter "path" is required to load a template.');
    }
    const generator = new TemplateGenerator(path);
    return generator.load();
  }

  async updateTemplate(dto: UpdateTemplateDto): Promise<UpdateTemplateResponse> {
    if (!dto.path) {
      throw new BadRequestException('Path is required to update a template.');
    }
    if (!dto.update) {
      throw new BadRequestException('Update payload is required to update a template.');
    }

    const generator = new TemplateGenerator(dto.path);
    const template = await generator.updateTemplate(dto.update);

    const shouldPersist = dto.persist ?? true;
    if (shouldPersist) {
      await generator.save(dto.path);
      return { template, savedPath: dto.path };
    }

    return { template };
  }

  async updateContent(dto: UpdateContentDto) {
    if (!dto.elenco && !dto.testo) {
      throw new BadRequestException('No content given.');
    }
    const generator = new TemplateGenerator();
  }


}
