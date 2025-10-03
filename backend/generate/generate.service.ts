import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { DocumentGenerator } from "../../ContractGenerator";
import { GenerateDocumentDto, GenerateDocumentResponse } from "./dto/generate-document.dto";
import { DocumentConfig } from "../../interfaces/doc";
import { DocumentParams, IPartiContratto } from "../../interfaces/content";
import { readFileSync } from "fs";

const DEFAULT_PATH_CONFIG = 'config.json';
const logger = new Logger('Generate');

@Injectable()
export class GenerateService {
  private readonly defaultConfig: DocumentConfig;

  constructor() {
    this.defaultConfig = this.loadDefaultConfig();
  }

  async generateDocument(dto: GenerateDocumentDto): Promise<GenerateDocumentResponse> {
    if (!dto.fileName || !dto.fileName.trim()) {
      throw new BadRequestException('file name is required to generate a document.');
    }

    const fileName = this.ensurePdfExtension(dto.fileName.trim());
    const generator = new DocumentGenerator();
    const config = this.cloneConfig(dto.config ?? this.defaultConfig);

    try {
      generator.setConfig(config);

      const documentParams = this.buildDocumentParams(dto, config, fileName);
      const document = await generator.generateDocument(documentParams);

      if (!document) {
        throw new BadRequestException('Document generation failed.');
      }

      return {
        document,
        filePath: fileName
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      logger.error(`Unable to generate document: ${message}`, stack);
      throw new BadRequestException(`Unable to generate document: ${message}`);
    }
  }

  private loadDefaultConfig(): DocumentConfig {
    try {
      const configFile = readFileSync(DEFAULT_PATH_CONFIG, 'utf-8');
      return JSON.parse(configFile) as DocumentConfig;
    } catch (error) {
      logger.error(`Failed to read default configuration from ${DEFAULT_PATH_CONFIG}`, error as Error);
      throw new Error(`Unable to read configuration file ${DEFAULT_PATH_CONFIG}`);
    }
  }

  private cloneConfig(config: DocumentConfig): DocumentConfig {
    return JSON.parse(JSON.stringify(config)) as DocumentConfig;
  }

  private ensurePdfExtension(fileName: string): string {
    return fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  }

  private buildDocumentParams(
    dto: GenerateDocumentDto,
    config: DocumentConfig,
    fileName: string,
  ): DocumentParams {
    const params: DocumentParams = {
      nomeFile: fileName,
    };

    const parti = this.buildParti(dto);
    if (parti) {
      params.parti = parti;
    }

    const numPagina = this.buildPageNumberConfig(dto);
    if (numPagina) {
      params.numPagina = numPagina;
    }

    const dynamicElements = this.buildDynamicElements(dto, config);
    if (dynamicElements) {
      params.dynamicElements = dynamicElements;
    }

    return params;
  }

  private buildParti(dto: GenerateDocumentDto): IPartiContratto | undefined {
    const supplierProvided = dto.supplier || dto.pIvaCfSupplier || dto.supplierAddress;
    const clientProvided = dto.client || dto.pIvaCfClient || dto.clientAddress;

    if (!supplierProvided && !clientProvided) {
      return undefined;
    }

    return {
      fornitore: {
        denominazione: dto.supplier ?? '',
        codiceFiscale: dto.pIvaCfSupplier ?? '',
        indirizzoCompleto: dto.supplierAddress ?? '',
      },
      cliente: {
        denominazione: dto.client ?? '',
        codiceFiscale: dto.pIvaCfClient ?? '',
        indirizzoCompleto: dto.clientAddress ?? '',
      },
    };
  }

  private buildPageNumberConfig(dto: GenerateDocumentDto): DocumentParams['numPagina'] | undefined {
    if (!dto.labelPagNum) {
      return undefined;
    }

    return {
      label: dto.labelPagNum,
      fontId: dto.fontPagNum,
      totPages: dto.totPagNum,
    };
  }

  private buildDynamicElements(
    dto: GenerateDocumentDto,
    config: DocumentConfig,
  ): DocumentParams['dynamicElements'] | undefined {
    if (!dto.tableAnchor) {
      return undefined;
    }

    if (!dto.tableBody || dto.tableBody.length === 0) {
      throw new BadRequestException('tableBody is required when tableAnchor is provided.');
    }

    const tableConfig: any = {
      body: dto.tableBody,
    };

    if (dto.tableHead && dto.tableHead.length > 0) {
      tableConfig.head = [dto.tableHead];
    }

    if (config.tableStyle) {
      tableConfig.styles = {
        ...config.tableStyle,
      };
    }

    return {
      [dto.tableAnchor]: {
        type: 'table',
        config: tableConfig,
      },
    };
  }
}
