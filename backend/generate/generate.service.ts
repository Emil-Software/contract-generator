import { Injectable, BadRequestException } from "@nestjs/common";
import { async } from "rxjs";
import { DocumentGenerator } from "../../ContractGenerator";
import { GenerateDocumentDto, GenerateDocumentResponse } from "./dto/generate-document.dto";

  const DEFAULT_PATH_CONFIG = 'config.json';
  
  @Injectable()
  export class GenerateService {
      async generateDocument(dto: GenerateDocumentDto): Promise<GenerateDocumentResponse> {
        if (!dto.params) {
          throw new BadRequestException('params is required to generate a document.');
        }
    
        const generator = new DocumentGenerator(DEFAULT_PATH_CONFIG);
    
        try {
          const document = await generator.generateDocument(dto.params);
          if (!document) {
            throw new Error('Document generation failed.');
          }
    
          return {
            document,
            filePath: dto.params.nomeFile,
          };
        } catch (error) {
          throw new BadRequestException(`Unable to generate document: ${error instanceof Error ? error.message : error}`);
        }
      }
  }
  